import type { InternetAccessRepository } from "@application/ports/InternetAccessRepository.js";

import { InternetAccess, InternetAccessStatus } from "@domain";

export interface RecordInternetAccessUsageCommand {
  purchaseId: string;
  allowanceMinutes?: number;
  sessionId?: string;
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

    if (
      access.status !== InternetAccessStatus.PROVISIONING &&
      access.status !== InternetAccessStatus.ACTIVE
    ) {
      return access;
    }

    const updated = command.sessionId
      ? access.recordSessionUsage(
          command.sessionId,
          command.connectedAt,
          command.disconnectedAt,
          command.allowanceMinutes,
        )
      : access.recordUsage(
          command.connectedAt,
          command.disconnectedAt,
          command.allowanceMinutes,
        );

    await this.repository.save(updated);

    return updated;
  }
}
