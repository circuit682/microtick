import { ConfirmPayment } from "@application/payment/ConfirmPayment.js";
import { ReceivePaymentConfirmation } from "@application/payment/ReceivePaymentConfirmation.js";

import { MemoryPaymentIntentRepository } from "@infrastructure/payment/MemoryPaymentIntentRepository.js";

import { IntaSendWebhookController } from "@http/payment/controller/IntaSendWebhookController.js";

// Future imports:
//
// import { InitiatePayment } from "@application/payment/InitiatePayment.js";
// import { PurchasePlan } from "@application/plan/PurchasePlan.js";
// import { MemoryPlanRepository } from "@infrastructure/plan/MemoryPlanRepository.js";
// import { IntaSendGateway } from "@infrastructure/payment/IntaSendGateway.js";
// import { PurchasePaymentController } from "@http/payment/controller/PurchasePaymentController.js";

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

/*
 * Next slice:
 *
 * export function createPurchasePaymentController(): PurchasePaymentController {
 *   ...
 * }
 */