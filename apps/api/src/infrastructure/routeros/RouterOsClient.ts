import { MikrotikAPI } from "@fibercom/routeros-api";

import { env } from "@config/env.js";

import type { RouterOsSessionInterval } from "@application/access/RouterOsSessionInterval.js";
import type { RouterOsClient } from "@application/ports/RouterOsClient.js";

function parseRouterOsUptimeToMs(uptime: string): number {
  if (!uptime) {
    return Number.NaN;
  }

  const tokens = uptime.match(/(\d+)([wdhms])/gi) ?? [];

  if (tokens.length === 0) {
    return Number.NaN;
  }

  let totalMs = 0;

  for (const token of tokens) {
    const match = token.match(/(\d+)([wdhms])/i);

    if (!match) {
      continue;
    }

    const amount = Number.parseInt(match[1], 10);
    const unit = match[2].toLowerCase();

    switch (unit) {
      case "w":
        totalMs += amount * 7 * 24 * 60 * 60 * 1000;
        break;
      case "d":
        totalMs += amount * 24 * 60 * 60 * 1000;
        break;
      case "h":
        totalMs += amount * 60 * 60 * 1000;
        break;
      case "m":
        totalMs += amount * 60 * 1000;
        break;
      case "s":
        totalMs += amount * 1000;
        break;
      default:
        break;
    }
  }

  return totalMs;
}

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

  async getActiveHotspotSessions(): Promise<Record<string, string>[]> {
    return this.client.write("/ip/hotspot/active/print");
  }

  async getHotspotSessionIntervals(): Promise<RouterOsSessionInterval[]> {
    const sessions = await this.getActiveHotspotSessions();
    const now = new Date();

    return sessions
      .filter(
        (session) =>
          typeof session.user === "string" && session.user.length > 0,
      )
      .map((session) => {
        const connectedAtMs =
          now.getTime() - parseRouterOsUptimeToMs(session.uptime ?? "");

        return {
          username: session.user,
          connectedAt: new Date(connectedAtMs),
          disconnectedAt: now,
        };
      })
      .filter((session) => Number.isFinite(session.connectedAt.getTime()));
  }

  async removeHotspotUser(username: string): Promise<void> {
    const users = await this.getHotspotUsers();

    const user = users.find((entry) => entry.name === username);

    if (!user?.[".id"]) {
      return;
    }

    await this.client.write("/ip/hotspot/user/remove", `=.id=${user[".id"]}`);
  }

  async removeActiveHotspotSession(username: string): Promise<void> {
    const sessions = await this.getActiveHotspotSessions();

    const session = sessions.find((entry) => entry.user === username);

    if (!session?.[".id"]) {
      return;
    }

    await this.client.write(
      "/ip/hotspot/active/remove",
      `=.id=${session[".id"]}`,
    );
  }

  async close(): Promise<void> {
    await this.client.close();
  }
}
