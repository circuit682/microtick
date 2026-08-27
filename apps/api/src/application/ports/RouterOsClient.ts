export interface RouterOsClient {
  connect(): Promise<void>;

  getSystemIdentity(): Promise<Record<string, string>[]>;

  close(): Promise<void>;
}
