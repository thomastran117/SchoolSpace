class CircuitBreaker {
  private failures = 0;
  private state: "CLOSED" | "OPEN" | "HALF_OPEN" = "CLOSED";
  private openedAt = 0;

  constructor(
    private readonly failureThreshold = 5,
    private readonly resetTimeoutMs = 10_000
  ) {}

  canExecute(): boolean {
    if (this.state === "OPEN") {
      if (Date.now() - this.openedAt > this.resetTimeoutMs) {
        this.state = "HALF_OPEN";
        return true;
      }
      return false;
    }
    return true;
  }

  onSuccess() {
    this.failures = 0;
    this.state = "CLOSED";
  }

  onFailure() {
    this.failures++;

    if (this.failures >= this.failureThreshold) {
      this.state = "OPEN";
      this.openedAt = Date.now();
    }
  }

  getState() {
    return this.state;
  }
}

export { CircuitBreaker };
