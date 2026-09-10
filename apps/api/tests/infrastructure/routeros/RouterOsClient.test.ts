import { afterEach, describe, expect, it } from "vitest";

import { RouterOsClientAdapter } from "@infrastructure/routeros/RouterOsClient.js";

describe("RouterOS client", () => {
  let client: RouterOsClientAdapter | undefined;

  afterEach(async () => {
    if (client) {
      await client.close();
    }
  });

  it("connects to the configured CHR and reads its system identity", async () => {
    client = new RouterOsClientAdapter();

    await client.connect();

    const identity = await client.getSystemIdentity();

    expect(identity).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: expect.any(String),
        }),
      ]),
    );
  });

  it("creates and removes a HotSpot user", async () => {
    client = new RouterOsClientAdapter();

    await client.connect();

    const username = "mt-api-test";
    const password = "TestCredential123!";

    await client.createHotspotUser(username, password);

    const users = await client.getHotspotUsers();

    expect(users).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: username,
        }),
      ]),
    );

    await client.removeHotspotUser(username);

    const remainingUsers = await client.getHotspotUsers();

    expect(remainingUsers).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: username,
        }),
      ]),
    );
  });

  it("reads active HotSpot sessions", async () => {
    client = new RouterOsClientAdapter();

    await client.connect();

    const sessions = await client.getActiveHotspotSessions();

    expect(sessions).toEqual(expect.any(Array));
  });

  it("reads completed HotSpot session intervals from RouterOS logs", async () => {
    client = new RouterOsClientAdapter();

    await client.connect();

    const intervals = await client.getCompletedHotspotSessionIntervals();

    expect(intervals).toEqual(expect.any(Array));
    expect(intervals).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          username: "mt-active-session-test",
          connectedAt: expect.any(Date),
          disconnectedAt: expect.any(Date),
        }),
      ]),
    );
  });

  it("removes the active HotSpot session for a username when present and is otherwise a no-op", async () => {
    client = new RouterOsClientAdapter();

    await client.connect();

    const username = "mt-active-session-test";

    const sessionsBefore = await client.getActiveHotspotSessions();
    const matchingSession = sessionsBefore.find(
      (session) => session.user === username,
    );

    if (matchingSession) {
      await client.removeActiveHotspotSession(username);

      const sessionsAfter = await client.getActiveHotspotSessions();

      expect(sessionsAfter).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            user: username,
          }),
        ]),
      );

      return;
    }

    await expect(
      client.removeActiveHotspotSession(username),
    ).resolves.toBeUndefined();

    const sessionsAfter = await client.getActiveHotspotSessions();

    expect(sessionsAfter).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          user: username,
        }),
      ]),
    );
  });
});
