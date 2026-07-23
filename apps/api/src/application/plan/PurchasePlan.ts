import { PaymentIntent } from "@domain";
import { ErrorCode, ValidationError } from "@shared";

import { InitiatePayment } from "../payment/InitiatePayment.js";
import type { PlanRepository } from "./PlanRepository.js";

export interface PurchasePlanCommand {
  planId: string;
  phoneNumber: string;
}

export class PurchasePlan {
  constructor(
    private readonly planRepository: PlanRepository,
    private readonly initiatePayment: InitiatePayment,
  ) {}

  async execute(command: PurchasePlanCommand): Promise<PaymentIntent> {
    // Retrieve the requested plan.
    const plan = await this.planRepository.findById(command.planId);

    // Business Rule:
    // A customer cannot purchase a plan that does not exist.
    if (plan === null) {
      throw new ValidationError(
        ErrorCode.PLAN_NOT_FOUND,
        "The requested plan does not exist.",
        {
          planId: command.planId,
        },
      );
    }

    // Business Rule:
    // A customer cannot purchase an inactive plan.
    if (!plan.active) {
      throw new ValidationError(
        ErrorCode.PLAN_INACTIVE,
        "Inactive plans cannot be purchased.",
        {
          planId: plan.id,
        },
      );
    }

    // Create a unique business reference for this payment.
    const paymentReference = plan.id;

    // Create the business representation of this payment request.
    const paymentIntent = new PaymentIntent({
      amount: plan.price,
      phoneNumber: command.phoneNumber,
      reference: paymentReference,
    });

    // Initiate payment through the dedicated application service.
    await this.initiatePayment.execute(paymentIntent);

    // Return the PaymentIntent so that the caller can
    // continue tracking the payment lifecycle.
    return paymentIntent;
  }
}