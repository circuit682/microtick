import { MikrotikAPI } from "@fibercom/routeros-api";

import { env } from "@config/env.js";

import type { RouterOsClient } from "@application/ports/RouterOsClient.js";

export class RouterOsClientAdapter implements RouterOsClient {
  private readonly client: MikrotikAPI;

  constructor() {
    this.client = new MikrotikAPI({
      host: env.routerOs.host,
      user: env.routerOs.username,
      password: env.routerOs.password,
      port: env.routerOs.port,
      timeout: env.routerOs.timeout,
      tls: env.routerOs.tls,
    });
  }

  async connect(): Promise<void> {
    await this.client.connect();
  }

  async getSystemIdentity(): Promise<Record<string, string>[]> {
    return this.client.getSystemIdentity();
  }

  async createHotspotUser(username: string, password: string): Promise<void> {
    await this.client.write(
      "/ip/hotspot/user/add",
      `=name=${username}`,
      `=password=${password}`,
      "=server=all",
      "=profile=default",
    );
  }

  async getHotspotUsers(): Promise<Record<string, string>[]> {
    return this.client.write("/ip/hotspot/user/print");
  }

  async removeHotspotUser(username: string): Promise<void> {
    const users = await this.getHotspotUsers();

    const user = users.find((entry) => entry.name === username);

    if (!user?.[".id"]) {
      return;
    }

    await this.client.write("/ip/hotspot/user/remove", `=.id=${user[".id"]}`);
  }

  async close(): Promise<void> {
    await this.client.close();
  }
}
