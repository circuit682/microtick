import type { IdentifierGenerator } from "@shared";

import { Purchase } from "@domain";

import type { PlanRepository } from "@application/plan/PlanRepository.js";
import type { PurchaseRepository } from "@application/ports/PurchaseRepository.js";

export interface FulfilPurchaseCommand {
  paymentId: string;
  customerId: string;
  planId: string;
  purchasedAt: Date;
}

export interface FulfilPurchaseUseCase {
  execute(
    command: FulfilPurchaseCommand,
  ): Promise<void>;
}

export class FulfilPurchase
  implements FulfilPurchaseUseCase
{
  constructor(
    private readonly purchaseRepository: PurchaseRepository,
    private readonly planRepository: PlanRepository,
    private readonly identifierGenerator: IdentifierGenerator,
  ) {}

  async execute(
    command: FulfilPurchaseCommand,
  ): Promise<void> {
    const plan = await this.planRepository.findById(
      command.planId,
    );

    if (plan === null) {
      throw new Error(
        `Plan '${command.planId}' was not found.`,
      );
    }

    const purchase = Purchase.create({
      id: this.identifierGenerator.generate(),
      customerId: command.customerId,
      planId: plan.id,
      planName: plan.name,
      planPrice: plan.price,
      planType: plan.type,
      allowanceMinutes: plan.allowanceMinutes,
      purchasedAt: command.purchasedAt,
    });

    await this.purchaseRepository.save(purchase);
  }
}