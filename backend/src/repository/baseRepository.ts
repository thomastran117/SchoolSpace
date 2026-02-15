import { PrismaClient } from "@prisma/client";

import { RepositoryError } from "../error/repositoryError";
import prisma from "../resource/prisma";
import { CircuitBreaker } from "../utility/circuitBreaker";
import logger from "../utility/logger";

/**
 * BaseRepository
 *
 * Shared base class for all data-access repositories.
 *
 * Provides:
 *  - Automatic retries with exponential backoff + jitter
 *  - Deadline enforcement (timeouts across retries)
 *  - AbortSignal propagation
 *  - Circuit breaker protection
 *
 * This class is intentionally opinionated to enforce
 * resilience and consistency at the repository layer.
 */
abstract class BaseRepository {
  /** Maximum retry attempts before failing */
  private readonly maxRetries: number;

  /** Base delay (ms) for exponential backoff */
  private readonly baseDelay: number;

  /** Upper bound for retry delay (ms) */
  private readonly maxDelay: number;

  /** Circuit breaker guarding repository execution */
  private readonly breaker = new CircuitBreaker();

  protected prisma: PrismaClient;

  constructor(options?: {
    maxRetries?: number;
    baseDelay?: number;
    maxDelay?: number;
  }) {
    this.prisma = prisma;
    this.maxRetries = options?.maxRetries ?? 2;
    this.baseDelay = options?.baseDelay ?? 100;
    this.maxDelay = options?.maxDelay ?? 5_000;
  }

  /**
   * executeAsync
   *
   * Core execution wrapper used by all repository methods.
   *
   * Responsibilities:
   *  - Applies exponential backoff with jitter
   *  - Propagates AbortSignal cancellation
   *  - Enforces overall execution deadlines
   *  - Integrates with the circuit breaker
   *
   * @param fn       The async repository operation
   * @param options  Abort and deadline configuration
   * @param context  Optional context string for logging/errors
   */
  protected async executeAsync<T>(
    fn: (signal?: AbortSignal) => Promise<T>,
    options?: {
      signal?: AbortSignal;
      deadlineMs?: number;
    },
    context?: string
  ): Promise<T> {
    let attempt = 0;
    const start = Date.now();

    while (true) {
      /**
       * Prevent execution when circuit breaker is OPEN
       */
      if (!this.breaker.canExecute()) {
        throw new RepositoryError(
          `[Repository${context ? `:${context}` : ""}] circuit breaker OPEN`,
          null
        );
      }

      /**
       * Enforce global deadline across retries
       */
      if (options?.deadlineMs && Date.now() - start > options.deadlineMs) {
        throw new RepositoryError(
          `[Repository${context ? `:${context}` : ""}] deadline exceeded`,
          null
        );
      }

      /**
       * Each attempt gets its own AbortController so:
       *  - external cancellation propagates
       *  - deadline-based cancellation is enforced
       */
      const controller = new AbortController();

      /**
       * If a deadline is specified, schedule an abort
       * when remaining time is exhausted
       */
      if (options?.signal) {
        options.signal.addEventListener("abort", () => controller.abort());
      }

      let timeout: NodeJS.Timeout | undefined;
      if (options?.deadlineMs) {
        timeout = setTimeout(
          () => controller.abort(),
          options.deadlineMs - (Date.now() - start)
        );
      }

      try {
        /**
         * Execute the repository operation
         */
        const result = await fn(controller.signal);

        this.breaker.onSuccess();
        return result;
      } catch (err: any) {
        attempt++;
        this.breaker.onFailure();

        /**
         * Stop retrying when:
         *  - max retries exceeded
         *  - error is not retryable
         *  - operation was aborted
         */
        if (
          attempt > this.maxRetries ||
          !this.shouldRetry(err) ||
          controller.signal.aborted
        ) {
          throw new RepositoryError(
            `[Repository${context ? `:${context}` : ""}] failed after ${attempt} attempts`,
            err
          );
        }

        /**
         * Exponential backoff with jitter to avoid retry storms
         */
        const delay = Math.min(
          this.baseDelay * 2 ** (attempt - 1),
          this.maxDelay
        );

        const jitter = Math.random() * delay;

        logger.warn(
          `[Repository${context ? `:${context}` : ""}] attempt ${attempt} failed; retrying in ${Math.round(delay + jitter)}ms`
        );

        await new Promise((r) => setTimeout(r, delay + jitter));
      } finally {
        if (timeout) clearTimeout(timeout);
      }
    }
  }

  /**
   * executeTransaction
   *   *
   * Guarantees:
   *  - Session lifecycle management
   *  - Automatic retry behavior via executeAsync
   *  - Proper cleanup even on failure
   *
   * @param fn       Transactional operation
   * @param context  Optional logging context
   * @param options  Deadline configuration
   */
  protected async executeTransaction<T>(
    prisma: { $transaction: (fn: (tx: any) => Promise<T>) => Promise<T> },
    fn: (tx: any, signal?: AbortSignal) => Promise<T>,
    context?: string,
    options?: { deadlineMs?: number }
  ): Promise<T> {
    return this.executeAsync(
      async (signal) => prisma.$transaction((tx: any) => fn(tx, signal)),
      options,
      context
    );
  }

  /**
   * shouldRetry
   *
   * Determines whether an error is safe to retry.
   *
   * Retries are allowed only for:
   *  - Retryable write errors
   *  - Known network / replica set failures
   *
   * Non-transient logical or validation errors
   * must fail fast and never retry.
   */
  protected shouldRetry(err: any): boolean {
    if (
      err?.name === "PrismaClientInitializationError" ||
      err?.name === "PrismaClientUnknownRequestError"
    ) {
      return true;
    }

    // Deadlock / lock timeout
    if (err?.code === "P2034") {
      return true;
    }

    return false;
  }
}

export { BaseRepository };
