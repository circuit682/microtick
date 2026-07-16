import { ValidationError, ErrorCode } from "@shared";

import type { PaymentGateway } from "../payment/PaymentGateway.js";
import type { PlanRepository } from "./PlanRepository.js";

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
      throw new ValidationError(
        ErrorCode.PLAN_NOT_FOUND,
        "The requested plan does not exist.",
        {
          planId: command.planId,
        },
      );
    }

    if (!plan.active) {
      throw new ValidationError(
        ErrorCode.PLAN_INACTIVE,
        "Inactive plans cannot be purchased.",
        {
          planId: plan.id,
        },
      );
    }

    await this.paymentGateway.requestPayment({
      phoneNumber: command.phoneNumber,
      amount: plan.price,
      reference: plan.id,
    });
  }
}