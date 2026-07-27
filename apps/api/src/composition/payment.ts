import { ConfirmPayment } from "@application/payment/ConfirmPayment.js";
import { InitiatePayment } from "@application/payment/InitiatePayment.js";
import { ReceivePaymentConfirmation } from "@application/payment/ReceivePaymentConfirmation.js";

import { PurchasePlan } from "@application/plan/PurchasePlan.js";

import { createIntaSendGateway } from "./infrastructure/intaSend.js";
import { UlidIdentifierGenerator } from "@infrastructure/identity/UlidIdentifierGenerator.js";
import { MemoryPaymentIntentRepository } from "@infrastructure/payment/MemoryPaymentIntentRepository.js";
import { PrismaPlanRepository } from "@infrastructure/plan/PrismaPlanRepository.js";

import { IntaSendWebhookController } from "@http/payment/controller/IntaSendWebhookController.js";
import { PurchasePaymentController } from "@http/payment/controller/PurchasePaymentController.js";

export function createIntaSendWebhookController(): IntaSendWebhookController {
  const paymentIntentRepository = new MemoryPaymentIntentRepository();

  const confirmPayment = new ConfirmPayment(paymentIntentRepository);

  const receivePaymentConfirmation = new ReceivePaymentConfirmation(
    confirmPayment,
  );

  return new IntaSendWebhookController(receivePaymentConfirmation);
}

export function createPurchasePaymentController(): PurchasePaymentController {
  const planRepository = new PrismaPlanRepository();

  const paymentGateway = createIntaSendGateway();

  const identifierGenerator = new UlidIdentifierGenerator();

  const initiatePayment = new InitiatePayment(paymentGateway);

  const purchasePlan = new PurchasePlan(
    planRepository,
    initiatePayment,
    identifierGenerator,
  );

  return new PurchasePaymentController(purchasePlan);
}
