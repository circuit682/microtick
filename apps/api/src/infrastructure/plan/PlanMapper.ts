import type { Plan as PrismaPlan } from "@generated/prisma/client.js";

import { Money, Plan } from "@domain";

export class PlanMapper {
  static toDomain(plan: PrismaPlan): Plan {
    return Plan.reconstitute({
      id: plan.id,
      name: plan.name,
      price: Money.fromMinorUnits(
        plan.priceMinor,
      ),
      duration: plan.duration,
      active: plan.active,
    });
  }

  static toPersistence(
    plan: Plan,
  ): {
    id: string;
    name: string;
    priceMinor: number;
    duration: number;
    active: boolean;
  } {
    return {
      id: plan.id,
      name: plan.name,
      priceMinor: plan.price.minorUnits,
      duration: plan.duration,
      active: plan.active,
    };
  }
}