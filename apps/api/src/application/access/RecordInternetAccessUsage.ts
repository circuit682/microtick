import type { InternetAccessRepository } from "@application/ports/InternetAccessRepository.js";

import { InternetAccess } from "@domain";

export interface RecordInternetAccessUsageCommand {
  purchaseId: string;
  connectedAt: Date;
  disconnectedAt: Date;
}

export interface RecordInternetAccessUsageUseCase {
  execute(command: RecordInternetAccessUsageCommand): Promise<InternetAccess>;
}

export class RecordInternetAccessUsage implements RecordInternetAccessUsageUseCase {
  constructor(private readonly repository: InternetAccessRepository) {}

  async execute(
    command: RecordInternetAccessUsageCommand,
  ): Promise<InternetAccess> {
    const access = await this.repository.findByPurchaseId(command.purchaseId);

    if (access === null) {
      throw new Error(
        `Internet access for purchase '${command.purchaseId}' was not found.`,
      );
    }

    const updated = access.recordUsage(
      command.connectedAt,
      command.disconnectedAt,
    );

    await this.repository.save(updated);

    return updated;
  }
}
