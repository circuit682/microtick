import { afterEach, describe, expect, it, vi } from "vitest";

import type { RouterOsClient } from "@application/ports/RouterOsClient.js";
import { IntervalPoller } from "@application/access/IntervalPoller.js";

import { createServer } from "../src/server.js";

describe("server", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("starts and stops the RouterOS access poller with the server lifecycle", async () => {
    const routerOsClient: RouterOsClient = {
      connect: vi.fn().mockResolvedValue(undefined),
      getSystemIdentity: vi.fn().mockResolvedValue([]),
      createHotspotUser: vi.fn().mockResolvedValue(undefined),
      getHotspotUsers: vi.fn().mockResolvedValue([]),
      getActiveHotspotSessions: vi.fn().mockResolvedValue([]),
      getHotspotSessionIntervals: vi.fn().mockResolvedValue([]),
      getCompletedHotspotSessionIntervals: vi.fn().mockResolvedValue([]),
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

  it("starts and stops both the RouterOS and session hygiene pollers with the server lifecycle", async () => {
    // Both createRouterOsAccessPoller and createSessionHygienePoller
    // build an IntervalPoller instance (see composition/access.ts
    // and composition/session.ts), so spying on the shared prototype
    // and expecting two calls confirms both are actually wired,
    // without needing access to either instance directly.
    const startSpy = vi.spyOn(IntervalPoller.prototype, "start");
    const stopSpy = vi.spyOn(IntervalPoller.prototype, "stop");

    const routerOsClient: RouterOsClient = {
      connect: vi.fn().mockResolvedValue(undefined),
      getSystemIdentity: vi.fn().mockResolvedValue([]),
      createHotspotUser: vi.fn().mockResolvedValue(undefined),
      getHotspotUsers: vi.fn().mockResolvedValue([]),
      getActiveHotspotSessions: vi.fn().mockResolvedValue([]),
      getHotspotSessionIntervals: vi.fn().mockResolvedValue([]),
      getCompletedHotspotSessionIntervals: vi.fn().mockResolvedValue([]),
      removeHotspotUser: vi.fn().mockResolvedValue(undefined),
      removeActiveHotspotSession: vi.fn().mockResolvedValue(undefined),
      close: vi.fn().mockResolvedValue(undefined),
    };

    const server = createServer(undefined, routerOsClient);

    await server.ready();

    expect(startSpy).toHaveBeenCalledTimes(2);

    await server.close();

    expect(stopSpy).toHaveBeenCalledTimes(2);
  });

  it("keeps the server available when RouterOS is unreachable at startup", async () => {
    // Confirms the fix: a RouterOS connect() failure at startup no
    // longer takes the whole server down. Fastify runs onReady hooks
    // in registration order and stops at the first one that throws,
    // which is why the connect() call is wrapped and swallowed in
    // server.ts rather than left to propagate. server.ready() must
    // resolve, the session hygiene poller (registered first) must
    // still start, and the RouterOS poller must NOT start, since
    // connect() never succeeded.
    const startSpy = vi.spyOn(IntervalPoller.prototype, "start");

    const routerOsClient: RouterOsClient = {
      connect: vi.fn().mockRejectedValue(new Error("RouterOS unreachable")),
      getSystemIdentity: vi.fn().mockResolvedValue([]),
      createHotspotUser: vi.fn().mockResolvedValue(undefined),
      getHotspotUsers: vi.fn().mockResolvedValue([]),
      getActiveHotspotSessions: vi.fn().mockResolvedValue([]),
      getHotspotSessionIntervals: vi.fn().mockResolvedValue([]),
      getCompletedHotspotSessionIntervals: vi.fn().mockResolvedValue([]),
      removeHotspotUser: vi.fn().mockResolvedValue(undefined),
      removeActiveHotspotSession: vi.fn().mockResolvedValue(undefined),
      close: vi.fn().mockResolvedValue(undefined),
    };

    const server = createServer(undefined, routerOsClient);

    await server.ready();

    expect(startSpy).toHaveBeenCalledTimes(1);

    await server.close();
  });
});
