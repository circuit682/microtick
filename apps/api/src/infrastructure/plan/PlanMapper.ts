import type { Plan as PrismaPlan } from "@generated/prisma/client.js";

import { Money, Plan, PlanType } from "@domain";

export class PlanMapper {
  static toDomain(plan: PrismaPlan): Plan {
    return Plan.reconstitute({
      id: plan.id,
      name: plan.name,
      price: Money.fromMinorUnits(
        plan.priceMinor,
      ),
      type: plan.type as PlanType,
      allowanceMinutes: plan.allowanceMinutes,
      active: plan.active,
    });
  }

  static toPersistence(
    plan: Plan,
  ): {
    id: string;
    name: string;
    priceMinor: number;
    type: PlanType;
    allowanceMinutes: number;
    active: boolean;
  } {
    return {
      id: plan.id,
      name: plan.name,
      priceMinor: plan.price.minorUnits,
      type: plan.type,
      allowanceMinutes: plan.allowanceMinutes,
      active: plan.active,
    };
  }
}