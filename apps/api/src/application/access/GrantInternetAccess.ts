import type { IdentifierGenerator } from "@shared";

import { InternetAccess, Plan, PlanType } from "@domain";

import type { InternetAccessRepository } from "@application/ports/InternetAccessRepository.js";

export interface GrantInternetAccessCommand {
  purchaseId: string;
  customerId: string;
  plan: Plan;
  grantedAt: Date;
}

export class GrantInternetAccess {
  constructor(
    private readonly repository: InternetAccessRepository,
    private readonly identifierGenerator: IdentifierGenerator,
  ) {}

  async execute(command: GrantInternetAccessCommand): Promise<InternetAccess> {
    const existing = await this.repository.findByPurchaseId(command.purchaseId);

    if (existing !== null) {
      return existing;
    }

    const expiresAt = new Date(command.grantedAt);

    switch (command.plan.type) {
      case PlanType.TIME:
        expiresAt.setMinutes(
          expiresAt.getMinutes() + command.plan.allowanceMinutes,
        );
        break;

      case PlanType.USAGE:
        // Temporary implementation.
        expiresAt.setMinutes(
          expiresAt.getMinutes() + command.plan.allowanceMinutes,
        );
        break;
    }

    const access = InternetAccess.create({
      id: this.identifierGenerator.generate(),
      purchaseId: command.purchaseId,
      customerId: command.customerId,
      grantedAt: command.grantedAt,
      expiresAt,
    });

    await this.repository.save(access);

    return access;
  }
}
