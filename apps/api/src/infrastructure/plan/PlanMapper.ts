import type { Plan as PrismaPlan } from "@generated/prisma/client.js";

import {
  AccessMethod,
  Money,
  Plan,
  PlanType,
  ServiceLevel,
  Validity,
  ValidityUnit,
} from "@domain";

export class PlanMapper {
  static toDomain(plan: PrismaPlan): Plan {
    return Plan.reconstitute({
      id: plan.id,

      name: plan.name,

      price: Money.fromMinorUnits(plan.priceMinor),

      validity: Validity.create({
        amount: plan.allowanceMinutes,
        unit: ValidityUnit.MINUTES,
      }),

      serviceLevel: ServiceLevel.create({
        name: "Residential",
      }),

      accessMethod:
        plan.type === PlanType.TIME
          ? AccessMethod.WALL_CLOCK
          : AccessMethod.SESSION,

      // Temporary compatibility.
      type: plan.type as PlanType,
      allowanceMinutes: plan.allowanceMinutes,

      active: plan.active,
    });
  }

  static toPersistence(plan: Plan): {
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

      // Compatibility until schema migration.
      type: plan.type,
      allowanceMinutes: plan.allowanceMinutes,

      active: plan.active,
    };
  }
}
