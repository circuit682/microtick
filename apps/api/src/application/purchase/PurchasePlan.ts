import { Plan, Purchase } from "@domain";

import { IdentifierGenerator } from "@shared";
import { PurchaseRepository } from "../ports/PurchaseRepository.js";

export interface PurchasePlanRequest {
  paymentIntentId: string;
  customerId: string;
  plan: Plan;
}

export class PurchasePlan {
  constructor(
    private readonly purchaseRepository: PurchaseRepository,
    private readonly identifierGenerator: IdentifierGenerator,
  ) {}

  async execute(request: PurchasePlanRequest): Promise<Purchase> {
    const purchase = Purchase.create({
      id: this.identifierGenerator.generate(),
      paymentIntentId: request.paymentIntentId,
      customerId: request.customerId,
      planId: request.plan.id,
      planName: request.plan.name,
      planPrice: request.plan.price,
      planType: request.plan.type,
      allowanceMinutes: request.plan.allowanceMinutes,
      purchasedAt: new Date(),
    });

    await this.purchaseRepository.save(purchase);

    return purchase;
  }
}
