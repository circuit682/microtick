import type { NetworkIdentityRepository } from "@application/ports/NetworkIdentityRepository.js";

import { AuthenticationMethod, NetworkIdentity } from "@domain";

export interface GetNetworkIdentitiesCommand {
  customerId: string;
}

export interface NetworkIdentitySummary {
  id: string;
  customerId: string;
  username: string;
  authenticationMethod: AuthenticationMethod;
}

export class GetNetworkIdentities {
  constructor(
    private readonly networkIdentityRepository: NetworkIdentityRepository,
  ) {}

  async execute(
    command: GetNetworkIdentitiesCommand,
  ): Promise<NetworkIdentitySummary[]> {
    const identities = await this.networkIdentityRepository.findByCustomerId(
      command.customerId,
    );

    return identities.map((identity: NetworkIdentity) => ({
      id: identity.id,
      customerId: identity.customerId,
      username: identity.username,
      authenticationMethod: identity.authenticationMethod,
    }));
  }
}
