import { afterEach, describe, expect, it, vi } from "vitest";

import type { RouterOsClient } from "@application/ports/RouterOsClient.js";

import { createServer } from "../src/server.js";

describe("server", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts and stops the RouterOS access poller with the server lifecycle", async () => {
    const routerOsClient: RouterOsClient = {
      connect: vi.fn().mockResolvedValue(undefined),
      getSystemIdentity: vi.fn().mockResolvedValue([]),
      createHotspotUser: vi.fn().mockResolvedValue(undefined),
      getHotspotUsers: vi.fn().mockResolvedValue([]),
      getActiveHotspotSessions: vi.fn().mockResolvedValue([]),
      removeHotspotUser: vi.fn().mockResolvedValue(undefined),
      removeActiveHotspotSession: vi.fn().mockResolvedValue(undefined),
      close: vi.fn().mockResolvedValue(undefined),
    };

    const server = createServer(undefined, routerOsClient);

    await server.ready();

    expect(routerOsClient.connect).toHaveBeenCalledOnce();

    await server.close();

    expect(routerOsClient.close).toHaveBeenCalledOnce();
  });
});
