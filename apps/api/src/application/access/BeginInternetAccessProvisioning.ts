import type { InternetAccessRepository } from "@application/ports/InternetAccessRepository.js";

import { InternetAccess } from "@domain";

export interface BeginInternetAccessProvisioningCommand {
  purchaseId: string;
}

export interface BeginInternetAccessProvisioningUseCase {
  execute(
    command: BeginInternetAccessProvisioningCommand,
  ): Promise<InternetAccess>;
}

export class BeginInternetAccessProvisioning implements BeginInternetAccessProvisioningUseCase {
  constructor(
    private readonly internetAccessRepository: InternetAccessRepository,
  ) {}

  async execute(
    command: BeginInternetAccessProvisioningCommand,
  ): Promise<InternetAccess> {
    const access = await this.internetAccessRepository.findByPurchaseId(
      command.purchaseId,
    );

    if (access === null) {
      throw new Error(
        `Internet access for purchase '${command.purchaseId}' was not found.`,
      );
    }

    const provisioning = access.beginProvisioning();

    await this.internetAccessRepository.save(provisioning);

    return provisioning;
  }
}
