import type { NetworkIdentityRepository } from "@application/ports/NetworkIdentityRepository.js";
import type { PurchaseRepository } from "@application/ports/PurchaseRepository.js";
import type { RouterOsClient } from "@application/ports/RouterOsClient.js";

import type { ActivateInternetAccessUseCase } from "./ActivateInternetAccess.js";

export class ActivateInternetAccessFromRouterOs {
  constructor(
    private readonly routerOsClient: RouterOsClient,
    private readonly networkIdentityRepository: NetworkIdentityRepository,
    private readonly purchaseRepository: PurchaseRepository,
    private readonly activateInternetAccess: ActivateInternetAccessUseCase,
  ) {}

  async execute(): Promise<void> {
    const activeSessions = await this.routerOsClient.getActiveHotspotSessions();

    for (const session of activeSessions) {
      const username = session.user;

      if (!username) {
        continue;
      }

      const identity =
        await this.networkIdentityRepository.findByUsername(username);

      if (identity === null) {
        continue;
      }

      const purchase = await this.purchaseRepository.findByNetworkIdentityId(
        identity.id,
      );

      if (purchase === null) {
        continue;
      }

      await this.activateInternetAccess.execute({
        purchaseId: purchase.id,
        customerId: purchase.customerId,
      });
    }
  }
}
