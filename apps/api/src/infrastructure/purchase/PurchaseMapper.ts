import type { Purchase as PrismaPurchase } from "@generated/prisma/client.js";

import {
  AccessMethod,
  ConsumptionPolicy,
  Money,
  PlanType,
  Purchase,
  ServiceLevel,
  Validity,
  ValidityUnit,
} from "@domain";

export class PurchaseMapper {
  static toDomain(purchase: PrismaPurchase): Purchase {
    return Purchase.reconstitute({
      id: purchase.id,
      paymentIntentId: purchase.paymentIntentId,
      customerId: purchase.customerId,
      networkIdentityId: purchase.networkIdentityId,

      planId: purchase.planId,
      planName: purchase.planName,
      planPrice: Money.fromMinorUnits(purchase.planPriceMinor),

      //
      // Temporary compatibility until the
      // database schema is migrated.
      //
      validity: Validity.create({
        amount: purchase.allowanceMinutes,
        unit: ValidityUnit.MINUTES,
      }),

      consumptionPolicy:
        purchase.planType === PlanType.TIME
          ? ConsumptionPolicy.CONTINUOUS
          : ConsumptionPolicy.USAGE,

      serviceLevel: ServiceLevel.create({
        name: purchase.serviceLevel,
      }),

      accessMethod:
        purchase.planType === PlanType.TIME
          ? AccessMethod.WALL_CLOCK
          : AccessMethod.SESSION,

      purchasedAt: purchase.purchasedAt,
    });
  }

  static toPersistence(purchase: Purchase): {
    id: string;
    paymentIntentId: string;
    customerId: string;
    networkIdentityId: string;
    planId: string;
    planName: string;
    planPriceMinor: number;
    planType: PlanType;
    allowanceMinutes: number;
    serviceLevel: string;
    purchasedAt: Date;
  } {
    return {
      id: purchase.id,
      paymentIntentId: purchase.paymentIntentId,
      customerId: purchase.customerId,
      networkIdentityId: purchase.networkIdentityId,

      planId: purchase.planId,
      planName: purchase.planName,
      planPriceMinor: purchase.planPrice.minorUnits,

      //
      // Temporary compatibility until the
      // database schema is migrated.
      //
      planType:
        purchase.consumptionPolicy === ConsumptionPolicy.CONTINUOUS
          ? PlanType.TIME
          : PlanType.USAGE,

      allowanceMinutes: purchase.validity.toMinutes(),

      serviceLevel: purchase.serviceLevel.name,

      purchasedAt: purchase.purchasedAt,
    };
  }
}
