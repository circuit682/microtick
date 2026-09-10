import { describe, expect, it } from "vitest";

import { createRouterOsAccessPoller } from "@composition/access.js";

import type { RouterOsClient } from "@application/ports/RouterOsClient.js";

describe("access composition", () => {
  it("creates the RouterOS access poller", () => {
    const routerOsClient: RouterOsClient = {
      connect: async () => {},
      getSystemIdentity: async () => [],
      createHotspotUser: async () => {},
      getHotspotUsers: async () => [],
      getActiveHotspotSessions: async () => [],
      getHotspotSessionIntervals: async () => [],
      removeHotspotUser: async () => {},
      removeActiveHotspotSession: async () => {},
      close: async () => {},
    };

    const poller = createRouterOsAccessPoller(routerOsClient);

    expect(poller).toBeDefined();
    expect(typeof poller.start).toBe("function");
    expect(typeof poller.stop).toBe("function");
  });
});
