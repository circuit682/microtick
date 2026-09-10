import type { InternetAccessRepository } from "@application/ports/InternetAccessRepository.js";
import type { NetworkIdentityRepository } from "@application/ports/NetworkIdentityRepository.js";
import type { PurchaseRepository } from "@application/ports/PurchaseRepository.js";
import type { RouterOsClient } from "@application/ports/RouterOsClient.js";

import {
  ConsumptionPolicy,
  InternetAccess,
  InternetAccessStatus,
} from "@domain";

export interface ExpireExpiredInternetAccessCommand {
  now: Date;
}

export class ExpireExpiredInternetAccess {
  constructor(
    private readonly internetAccessRepository: InternetAccessRepository,
    private readonly purchaseRepository: PurchaseRepository,
    private readonly networkIdentityRepository: NetworkIdentityRepository,
    private readonly routerOsClient: RouterOsClient,
  ) {}

  async execute(
    command: ExpireExpiredInternetAccessCommand,
  ): Promise<InternetAccess[]> {
    const accesses = await this.internetAccessRepository.findAll();
    const expired: InternetAccess[] = [];

    for (const access of accesses) {
      if (access.status === InternetAccessStatus.EXPIRED) {
        continue;
      }

      const purchase = await this.purchaseRepository.findById(
        access.purchaseId,
      );

      if (purchase === null) {
        continue;
      }

      const hasExpired =
        purchase.consumptionPolicy === ConsumptionPolicy.USAGE
          ? access.consumedMinutes >= purchase.validity.toMinutes()
          : access.expiresAt <= command.now;

      if (!hasExpired) {
        continue;
      }

      const identity = await this.networkIdentityRepository.findById(
        purchase.networkIdentityId,
      );

      if (identity === null) {
        continue;
      }

      await this.routerOsClient.removeHotspotUser(identity.username);
      await this.routerOsClient.removeActiveHotspotSession(identity.username);

      const expiredAccess = access.expire();
      await this.internetAccessRepository.save(expiredAccess);
      expired.push(expiredAccess);
    }

    return expired;
  }
}
