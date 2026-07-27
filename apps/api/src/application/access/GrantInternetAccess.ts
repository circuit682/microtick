import { InternetAccess, Plan, PlanType } from "@domain";

export interface GrantInternetAccessCommand {
  customerId: string;
  plan: Plan;
  grantedAt: Date;
}

export class GrantInternetAccess {
  execute(command: GrantInternetAccessCommand): InternetAccess {
    const expiresAt = new Date(command.grantedAt);

    switch (command.plan.type) {
      case PlanType.TIME:
        expiresAt.setMinutes(
          expiresAt.getMinutes() + command.plan.allowanceMinutes,
        );
        break;

      case PlanType.USAGE:
        // Temporary implementation.
        // Usage-based plans will eventually consume allowance
        // while the customer is connected rather than by
        // elapsed wall-clock time.
        expiresAt.setMinutes(
          expiresAt.getMinutes() + command.plan.allowanceMinutes,
        );
        break;
    }

    return InternetAccess.create({
      customerId: command.customerId,
      planId: command.plan.id,
      grantedAt: command.grantedAt,
      expiresAt,
    });
  }
}
