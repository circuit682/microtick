import type { Purchase as PrismaPurchase } from "@generated/prisma/client.js";

import {
  AccessMethod,
  Money,
  Purchase,
  PlanType,
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

      planId: purchase.planId,
      planName: purchase.planName,
      planPrice: Money.fromMinorUnits(purchase.planPriceMinor),

      //
      // Temporary compatibility until the database
      // schema is migrated.
      //
      validity: Validity.create({
        amount: purchase.allowanceMinutes,
        unit: ValidityUnit.MINUTES,
      }),

      serviceLevel: ServiceLevel.create({
        name: "Default",
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
    planId: string;
    planName: string;
    planPriceMinor: number;
    planType: PlanType;
    allowanceMinutes: number;
    purchasedAt: Date;
  } {
    return {
      id: purchase.id,
      paymentIntentId: purchase.paymentIntentId,
      customerId: purchase.customerId,

      planId: purchase.planId,
      planName: purchase.planName,
      planPriceMinor: purchase.planPrice.minorUnits,

      //
      // Temporary compatibility.
      //
      planType:
        purchase.accessMethod === AccessMethod.WALL_CLOCK
          ? PlanType.TIME
          : PlanType.USAGE,

      allowanceMinutes: purchase.validity.toMinutes(),

      purchasedAt: purchase.purchasedAt,
    };
  }
}
