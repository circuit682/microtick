import type { IdentifierGenerator } from "@shared";

import { AccessMethod, InternetAccess, Plan } from "@domain";

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

    switch (command.plan.accessMethod) {
      case AccessMethod.WALL_CLOCK:
        expiresAt.setMinutes(
          expiresAt.getMinutes() + command.plan.validity.toMinutes(),
        );
        break;

      case AccessMethod.SESSION:
        //
        // Temporary implementation.
        //
        // Session-based plans will eventually expire
        // according to accumulated online usage rather
        // than wall-clock time.
        //
        expiresAt.setMinutes(
          expiresAt.getMinutes() + command.plan.validity.toMinutes(),
        );
        break;
    }

    console.log("Validity (minutes):", command.plan.validity.toMinutes());
    console.log("Granted:", command.grantedAt);
    console.log("Expires:", expiresAt);

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
