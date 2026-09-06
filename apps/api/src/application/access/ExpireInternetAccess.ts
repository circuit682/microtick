import type { InternetAccessRepository } from "@application/ports/InternetAccessRepository.js";
import type { NetworkIdentityRepository } from "@application/ports/NetworkIdentityRepository.js";
import type { PurchaseRepository } from "@application/ports/PurchaseRepository.js";
import type { RouterOsClient } from "@application/ports/RouterOsClient.js";
import { InternetAccess } from "@domain";

export interface ExpireInternetAccessCommand {
  purchaseId: string;
}

export class ExpireInternetAccess {
  constructor(
    private readonly internetAccessRepository: InternetAccessRepository,
    private readonly purchaseRepository: PurchaseRepository,
    private readonly networkIdentityRepository: NetworkIdentityRepository,
    private readonly routerOsClient: RouterOsClient,
  ) {}

  async execute(command: ExpireInternetAccessCommand): Promise<InternetAccess> {
    const access = await this.internetAccessRepository.findByPurchaseId(
      command.purchaseId,
    );

    if (access === null) {
      throw new Error(
        `Internet access for purchase '${command.purchaseId}' was not found.`,
      );
    }

    const purchase = await this.purchaseRepository.findById(command.purchaseId);

    if (purchase === null) {
      throw new Error(`Purchase '${command.purchaseId}' was not found.`);
    }

    const identity = await this.networkIdentityRepository.findById(
      purchase.networkIdentityId,
    );

    if (identity === null) {
      throw new Error(
        `Network identity '${purchase.networkIdentityId}' was not found.`,
      );
    }

    await this.routerOsClient.removeHotspotUser(identity.username);
    await this.routerOsClient.removeActiveHotspotSession(identity.username);

    const expired = access.expire();

    await this.internetAccessRepository.save(expired);

    return expired;
  }
}