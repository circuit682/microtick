import { afterEach, describe, expect, it, vi } from "vitest";

import { RouterOsAccessPoller } from "@application/access/RouterOsAccessPoller.js";

describe("RouterOsAccessPoller", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("executes the RouterOS activation trigger on each polling interval", async () => {
    vi.useFakeTimers();

    const execute = vi.fn(async () => {});

    const poller = new RouterOsAccessPoller(execute, 1_000);

    poller.start();

    expect(execute).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1_000);

    expect(execute).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1_000);

    expect(execute).toHaveBeenCalledTimes(2);

    poller.stop();
  });
});
