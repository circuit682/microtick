import type { RouterOsSessionInterval } from "@application/access/RouterOsSessionInterval.js";

export interface RouterOsClient {
  connect(): Promise<void>;

  getSystemIdentity(): Promise<Record<string, string>[]>;

  createHotspotUser(username: string, password: string): Promise<void>;

  getHotspotUsers(): Promise<Record<string, string>[]>;

  getActiveHotspotSessions(): Promise<Record<string, string>[]>;

  getHotspotSessionIntervals(): Promise<RouterOsSessionInterval[]>;

  getCompletedHotspotSessionIntervals(): Promise<RouterOsSessionInterval[]>;

  removeHotspotUser(username: string): Promise<void>;

  removeActiveHotspotSession(username: string): Promise<void>;

  close(): Promise<void>;
}
