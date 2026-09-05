export class RouterOsAccessPoller {
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly execute: () => Promise<void>,
    private readonly intervalMs: number,
  ) {}

  start(): void {
    if (this.timer !== null) {
      return;
    }

    this.timer = setInterval(() => {
      void this.execute();
    }, this.intervalMs);
  }

  stop(): void {
    if (this.timer === null) {
      return;
    }

    clearInterval(this.timer);
    this.timer = null;
  }
}
