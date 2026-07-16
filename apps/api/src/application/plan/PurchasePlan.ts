import type { PlanRepository } from "./PlanRepository.js";
import type { PaymentGateway } from "../payment/PaymentGateway.js";

export interface PurchasePlanCommand {
  planId: string;
  phoneNumber: string;
}

export class PurchasePlan {
  constructor(
    private readonly planRepository: PlanRepository,
    private readonly paymentGateway: PaymentGateway,
  ) {}

  async execute(command: PurchasePlanCommand): Promise<void> {
    const plan = await this.planRepository.findById(command.planId);

    if (plan === null) {
      return;
    }

    await this.paymentGateway.requestPayment({
      phoneNumber: command.phoneNumber,
      amount: plan.price,
      reference: plan.id,
    });
  }
}