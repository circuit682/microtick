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

  async close(): Promise<void> {
    await this.client.close();
  }
}
