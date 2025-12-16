export abstract class BaseRepository {
  private readonly maxRetries: number;
  private readonly baseDelay: number;

  constructor(options?: { maxRetries?: number; baseDelay?: number }) {
    this.maxRetries = options?.maxRetries ?? 3;
    this.baseDelay = options?.baseDelay ?? 100;
  }

  private async sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private shouldRetry(err: any): boolean {
    if (!err?.code) return false;

    const transientCodes = new Set(["P1001", "P1002", "P1008", "P1017"]);

    return transientCodes.has(err.code);
  }

  protected async executeAsync<T>(fn: () => Promise<T>): Promise<T> {
    let attempt = 0;

    while (true) {
      try {
        return await fn();
      } catch (err: any) {
        attempt++;

        if (attempt > this.maxRetries || !this.shouldRetry(err)) {
          throw new Error(
            `[Repository] failed after ${attempt} attempts: ${err?.message ?? err}`,
          );
        }

        const delay = this.baseDelay * 2 ** (attempt - 1);
        const jitter = Math.random() * delay;
        const wait = delay + jitter;

        console.warn(
          `[Repository] attempt ${attempt} failed (${err.code}). Retrying in ${Math.round(wait)}ms...`,
        );

        await this.sleep(wait);
      }
    }
  }
}
