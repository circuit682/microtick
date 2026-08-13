import type { Plan as PrismaPlan } from "@generated/prisma/client.js";

import {
  AccessMethod,
  ConsumptionPolicy,
  Money,
  Plan,
  PlanType,
  ServiceLevel,
  Validity,
  ValidityUnit,
} from "@domain";

export class PlanMapper {
  static toDomain(plan: PrismaPlan): Plan {
    const consumptionPolicy =
      plan.type === PlanType.TIME
        ? ConsumptionPolicy.CONTINUOUS
        : ConsumptionPolicy.USAGE;

    return Plan.reconstitute({
      id: plan.id,

      name: plan.name,

      price: Money.fromMinorUnits(plan.priceMinor),

      validity: Validity.create({
        amount: plan.allowanceMinutes,
        unit: ValidityUnit.MINUTES,
      }),

      consumptionPolicy,

      serviceLevel: ServiceLevel.create({
        name: "Residential",
      }),

      accessMethod:
        consumptionPolicy === ConsumptionPolicy.CONTINUOUS
          ? AccessMethod.WALL_CLOCK
          : AccessMethod.SESSION,

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

      // Compatibility with the current Prisma schema.
      type:
        plan.consumptionPolicy === ConsumptionPolicy.CONTINUOUS
          ? PlanType.TIME
          : PlanType.USAGE,

      allowanceMinutes: plan.validity.toMinutes(),

      active: plan.active,
    };
  }
}
