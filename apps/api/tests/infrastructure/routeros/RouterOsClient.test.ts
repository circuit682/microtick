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
});
