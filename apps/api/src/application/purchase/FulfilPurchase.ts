import { GrantInternetAccess } from "@application/access/GrantInternetAccess.js";
import type { PlanRepository } from "@application/plan/PlanRepository.js";
import type { PurchaseRepository } from "@application/ports/PurchaseRepository.js";

import { Purchase } from "@domain";

import type { IdentifierGenerator } from "@shared";

export interface FulfilPurchaseCommand {
  paymentId: string;
  customerId: string;
  planId: string;
  purchasedAt: Date;
}

export interface FulfilPurchaseUseCase {
  execute(command: FulfilPurchaseCommand): Promise<void>;
}

export class FulfilPurchase implements FulfilPurchaseUseCase {
  constructor(
    private readonly purchaseRepository: PurchaseRepository,
    private readonly planRepository: PlanRepository,
    private readonly identifierGenerator: IdentifierGenerator,
    private readonly grantInternetAccess: GrantInternetAccess,
  ) {}

  async execute(command: FulfilPurchaseCommand): Promise<void> {
    const existing = await this.purchaseRepository.findByPaymentIntentId(
      command.paymentId,
    );

    if (existing !== null) {
      return;
    }

    const plan = await this.planRepository.findById(command.planId);

    if (plan === null) {
      throw new Error(`Plan '${command.planId}' was not found.`);
    }

    const purchase = Purchase.create({
      id: this.identifierGenerator.generate(),

      paymentIntentId: command.paymentId,
      customerId: command.customerId,

      planId: plan.id,
      planName: plan.name,
      planPrice: plan.price,

      validity: plan.validity,

      consumptionPolicy: plan.consumptionPolicy,

      serviceLevel: plan.serviceLevel,

      accessMethod: plan.accessMethod,

      purchasedAt: command.purchasedAt,
    });

    await this.purchaseRepository.save(purchase);

    await this.grantInternetAccess.execute({
      purchaseId: purchase.id,
      customerId: purchase.customerId,
      plan,
      grantedAt: purchase.purchasedAt,
    });
  }
}
