import type { InternetAccessRepository } from "@application/ports/InternetAccessRepository.js";
import type { NetworkIdentityRepository } from "@application/ports/NetworkIdentityRepository.js";
import type { PurchaseRepository } from "@application/ports/PurchaseRepository.js";
import type { RouterOsClient } from "@application/ports/RouterOsClient.js";

import { InternetAccess, InternetAccessStatus } from "@domain";

export interface ActivateInternetAccessCommand {
  purchaseId: string;
  customerId: string;
}

export interface ActivateInternetAccessUseCase {
  execute(command: ActivateInternetAccessCommand): Promise<InternetAccess>;
}

export class ActivateInternetAccess implements ActivateInternetAccessUseCase {
  constructor(
    private readonly internetAccessRepository: InternetAccessRepository,
    private readonly networkIdentityRepository: NetworkIdentityRepository,
    private readonly purchaseRepository: PurchaseRepository,
    private readonly routerOsClient: RouterOsClient,
  ) {}

  async execute(
    command: ActivateInternetAccessCommand,
  ): Promise<InternetAccess> {
    const access = await this.internetAccessRepository.findByPurchaseId(
      command.purchaseId,
    );

    if (access === null) {
      throw new Error(
        `Internet access for purchase '${command.purchaseId}' was not found.`,
      );
    }

    if (
      access.status === InternetAccessStatus.EXPIRED ||
      access.status === InternetAccessStatus.REVOKED ||
      access.status === InternetAccessStatus.FAILED
    ) {
      return access;
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

    const activeSessions = await this.routerOsClient.getActiveHotspotSessions();

    const hasActiveSession = activeSessions.some(
      (session) => session.user === identity.username,
    );

    if (!hasActiveSession) {
      return access;
    }

    const activated = access.activate();

    await this.internetAccessRepository.save(activated);

    return activated;
  }
}
