import mongoose, { ClientSession } from "mongoose";
import { RepositoryError } from "../error/repositoryError";
import { CircuitBreaker } from "../utility/circuitBreaker";

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
 *  - MongoDB transaction helpers
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

  constructor(options?: {
    maxRetries?: number;
    baseDelay?: number;
    maxDelay?: number;
  }) {
    this.maxRetries = options?.maxRetries ?? 3;
    this.baseDelay = options?.baseDelay ?? 100;
    this.maxDelay = options?.maxDelay ?? 5_000;
  }

  /**
   * executeAsync
   *
   * Core execution wrapper used by all repository methods.
   *
   * Responsibilities:
   *  - Enforces retry logic for transient MongoDB failures
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
    context?: string,
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
          null,
        );
      }

      /**
       * Enforce global deadline across retries
       */
      if (options?.deadlineMs && Date.now() - start > options.deadlineMs) {
        throw new RepositoryError(
          `[Repository${context ? `:${context}` : ""}] deadline exceeded`,
          null,
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
          options.deadlineMs - (Date.now() - start),
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
            err,
          );
        }

        /**
         * Exponential backoff with jitter to avoid retry storms
         */
        const delay = Math.min(
          this.baseDelay * 2 ** (attempt - 1),
          this.maxDelay,
        );

        const jitter = Math.random() * delay;

        console.warn(
          `[Repository${context ? `:${context}` : ""}] attempt ${attempt} failed; retrying in ${Math.round(delay + jitter)}ms`,
          {
            code: err?.code,
            labels: err?.errorLabels,
          },
        );

        await new Promise((r) => setTimeout(r, delay + jitter));
      } finally {
        if (timeout) clearTimeout(timeout);
      }
    }
  }

  /**
   * executeTransaction
   *
   * Helper for executing MongoDB transactions safely.
   *
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
    fn: (session: ClientSession, signal?: AbortSignal) => Promise<T>,
    context?: string,
    options?: { deadlineMs?: number },
  ): Promise<T> {
    return this.executeAsync(
      async (signal) => {
        const session = await mongoose.startSession();
        try {
          let result!: T;

          await session.withTransaction(async () => {
            result = await fn(session, signal);
          });

          return result;
        } finally {
          await session.endSession();
        }
      },
      options,
      context,
    );
  }

  /**
   * shouldRetry
   *
   * Determines whether an error is safe to retry.
   *
   * Retries are allowed only for:
   *  - MongoDB transient transaction errors
   *  - Retryable write errors
   *  - Known network / replica set failures
   *
   * Non-transient logical or validation errors
   * must fail fast and never retry.
   */
  protected shouldRetry(err: any): boolean {
    if (typeof err?.hasErrorLabel === "function") {
      if (
        err.hasErrorLabel("TransientTransactionError") ||
        err.hasErrorLabel("UnknownTransactionCommitResult") ||
        err.hasErrorLabel("RetryableWriteError")
      ) {
        return true;
      }
    }

    const retryableCodes = new Set([6, 7, 89, 91, 11600, 11602, 10107, 13435]);

    return typeof err?.code === "number" && retryableCodes.has(err.code);
  }
}

export { BaseRepository };
