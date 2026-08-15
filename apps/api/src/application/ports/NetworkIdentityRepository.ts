import { NetworkIdentity } from "@domain";

export interface NetworkIdentityRepository {
  save(identity: NetworkIdentity): Promise<void>;

  findById(id: string): Promise<NetworkIdentity | null>;

  findByUsername(username: string): Promise<NetworkIdentity | null>;

  findByCustomerId(customerId: string): Promise<NetworkIdentity[]>;
}
