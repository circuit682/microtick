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
});
