import { Plan, Purchase } from "@domain";

import type { IdentifierGenerator } from "@shared";
import type { PurchaseRepository } from "../ports/PurchaseRepository.js";

export interface PurchasePlanRequest {
  paymentIntentId: string;
  customerId: string;
  networkIdentityId: string;
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
      networkIdentityId: request.networkIdentityId,

      planId: request.plan.id,
      planName: request.plan.name,
      planPrice: request.plan.price,

      validity: request.plan.validity,

      consumptionPolicy: request.plan.consumptionPolicy,

      serviceLevel: request.plan.serviceLevel,

      accessMethod: request.plan.accessMethod,

      purchasedAt: new Date(),
    });

    await this.purchaseRepository.save(purchase);

    return purchase;
  }
}
