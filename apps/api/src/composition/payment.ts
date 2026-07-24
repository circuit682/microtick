import { ConfirmPayment } from "@application/payment/ConfirmPayment.js";
import { InitiatePayment } from "@application/payment/InitiatePayment.js";
import { ReceivePaymentConfirmation } from "@application/payment/ReceivePaymentConfirmation.js";

import { PurchasePlan } from "@application/plan/PurchasePlan.js";

import { createIntaSendGateway } from "./infrastructure/intaSend.js";

import { MemoryPaymentIntentRepository } from "@infrastructure/payment/MemoryPaymentIntentRepository.js";
import { MemoryPlanRepository } from "@infrastructure/plan/MemoryPlanRepository.js";

import { IntaSendWebhookController } from "@http/payment/controller/IntaSendWebhookController.js";
import { PurchasePaymentController } from "@http/payment/controller/PurchasePaymentController.js";

export function createIntaSendWebhookController(): IntaSendWebhookController {
  const paymentIntentRepository =
    new MemoryPaymentIntentRepository();

  const confirmPayment =
    new ConfirmPayment(paymentIntentRepository);

  const receivePaymentConfirmation =
    new ReceivePaymentConfirmation(confirmPayment);

  return new IntaSendWebhookController(
    receivePaymentConfirmation,
  );
}

export function createPurchasePaymentController(): PurchasePaymentController {
  const planRepository =
    new MemoryPlanRepository();

  const paymentGateway =
    createIntaSendGateway();

  const initiatePayment =
    new InitiatePayment(paymentGateway);

  const purchasePlan =
    new PurchasePlan(
      planRepository,
      initiatePayment,
    );

  return new PurchasePaymentController(
    purchasePlan,
  );
}