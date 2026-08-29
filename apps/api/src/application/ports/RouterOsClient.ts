export interface RouterOsClient {
  connect(): Promise<void>;

  getSystemIdentity(): Promise<Record<string, string>[]>;

  createHotspotUser(username: string, password: string): Promise<void>;

  getHotspotUsers(): Promise<Record<string, string>[]>;

  removeHotspotUser(username: string): Promise<void>;

  close(): Promise<void>;
}
