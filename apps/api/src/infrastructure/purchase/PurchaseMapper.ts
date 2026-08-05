import type { Purchase as PrismaPurchase } from "@generated/prisma/client.js";

import { Money, Purchase, PlanType } from "@domain";

export class PurchaseMapper {
  static toDomain(purchase: PrismaPurchase): Purchase {
    return Purchase.reconstitute({
      id: purchase.id,
      paymentIntentId: purchase.paymentIntentId,
      customerId: purchase.customerId,
      planId: purchase.planId,
      planName: purchase.planName,
      planPrice: Money.fromMinorUnits(purchase.planPriceMinor),
      planType: purchase.planType as PlanType,
      allowanceMinutes: purchase.allowanceMinutes,
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
      planType: purchase.planType,
      allowanceMinutes: purchase.allowanceMinutes,
      purchasedAt: purchase.purchasedAt,
    };
  }
}
