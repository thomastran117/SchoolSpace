import mongoose, { ClientSession } from "mongoose";
import { RepositoryError } from "../error/repositoryError";
import { CircuitBreaker } from "../utility/circuitBreaker";

abstract class BaseRepository {
  private readonly maxRetries: number;
  private readonly baseDelay: number;
  private readonly maxDelay: number;
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
      if (!this.breaker.canExecute()) {
        throw new RepositoryError(
          `[Repository${context ? `:${context}` : ""}] circuit breaker OPEN`,
          null,
        );
      }

      if (
        options?.deadlineMs &&
        Date.now() - start > options.deadlineMs
      ) {
        throw new RepositoryError(
          `[Repository${context ? `:${context}` : ""}] deadline exceeded`,
          null,
        );
      }

      const controller = new AbortController();

      if (options?.signal) {
        options.signal.addEventListener("abort", () =>
          controller.abort(),
        );
      }

      let timeout: NodeJS.Timeout | undefined;
      if (options?.deadlineMs) {
        timeout = setTimeout(
          () => controller.abort(),
          options.deadlineMs - (Date.now() - start),
        );
      }

      try {
        const result = await fn(controller.signal);

        this.breaker.onSuccess();
        return result;
      } catch (err: any) {
        attempt++;
        this.breaker.onFailure();

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

    const retryableCodes = new Set([
      6,
      7,
      89,
      91,
      11600,
      11602,
      10107,
      13435,
    ]);

    return typeof err?.code === "number" && retryableCodes.has(err.code);
  }
}

export { BaseRepository };
