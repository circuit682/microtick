import type { RecordInternetAccessUsageUseCase } from "@application/access/RecordInternetAccessUsage.js";
import type { NetworkIdentityRepository } from "@application/ports/NetworkIdentityRepository.js";
import type { PurchaseRepository } from "@application/ports/PurchaseRepository.js";

import type { RouterOsSessionInterval } from "./RouterOsSessionInterval.js";

export class RecordInternetAccessUsageFromRouterOs {
  constructor(
    private readonly networkIdentityRepository: NetworkIdentityRepository,
    private readonly purchaseRepository: PurchaseRepository,
    private readonly recordInternetAccessUsage: RecordInternetAccessUsageUseCase,
  ) {}

  async execute(intervals: RouterOsSessionInterval[]): Promise<void> {
    for (const interval of intervals) {
      const identity = await this.networkIdentityRepository.findByUsername(
        interval.username,
      );

      if (identity === null) {
        continue;
      }

      const purchase = await this.purchaseRepository.findByNetworkIdentityId(
        identity.id,
      );

      if (purchase === null) {
        continue;
      }

      await this.recordInternetAccessUsage.execute({
        purchaseId: purchase.id,
        sessionId: interval.sessionId,
        connectedAt: interval.connectedAt,
        disconnectedAt: interval.disconnectedAt,
      });
    }
  }
}
