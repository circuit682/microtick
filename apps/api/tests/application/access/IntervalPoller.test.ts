import { afterEach, describe, expect, it, vi } from "vitest";

import { IntervalPoller } from "@application/access/IntervalPoller.js";

describe("IntervalPoller", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("executes the scheduled operation on each polling interval", async () => {
    vi.useFakeTimers();

    const execute = vi.fn(async () => {});

    const poller = new IntervalPoller(execute, 1_000);

    poller.start();

    expect(execute).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1_000);

    expect(execute).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1_000);

    expect(execute).toHaveBeenCalledTimes(2);

    poller.stop();
  });

  it("does not start a second execution while the current one is running", async () => {
    vi.useFakeTimers();

    let resolveFirst: (() => void) | undefined;
    const firstExecution = new Promise<void>((resolve) => {
      resolveFirst = resolve;
    });
    const execute = vi
      .fn<() => Promise<void>>()
      .mockReturnValueOnce(firstExecution)
      .mockResolvedValue(undefined);

    const poller = new IntervalPoller(execute, 1_000);

    poller.start();

    await vi.advanceTimersByTimeAsync(1_000);
    await vi.advanceTimersByTimeAsync(1_000);

    expect(execute).toHaveBeenCalledTimes(1);

    resolveFirst!();
    await vi.advanceTimersByTimeAsync(1_000);

    expect(execute).toHaveBeenCalledTimes(2);

    poller.stop();
  });
});
