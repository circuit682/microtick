import { InternetAccess, Plan } from "@domain";

export interface GrantInternetAccessCommand {
  customerId: string;
  plan: Plan;
  grantedAt: Date;
}

export class GrantInternetAccess {
  execute(command: GrantInternetAccessCommand): InternetAccess {
    const expiresAt = new Date(command.grantedAt);

    expiresAt.setMinutes(
      expiresAt.getMinutes() + command.plan.duration,
    );

    return InternetAccess.create({
      customerId: command.customerId,
      planId: command.plan.id,
      grantedAt: command.grantedAt,
      expiresAt,
    });
  }
}