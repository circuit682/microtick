import { ConfirmPayment } from "@application/payment/ConfirmPayment.js";
import { InitiatePayment } from "@application/payment/InitiatePayment.js";
import { ReceivePaymentConfirmation } from "@application/payment/ReceivePaymentConfirmation.js";

import { PurchasePlan } from "@application/plan/PurchasePlan.js";
import { FulfilPurchase } from "@application/purchase/FulfilPurchase.js";

import { createIntaSendGateway } from "./infrastructure/intaSend.js";

import { UlidIdentifierGenerator } from "@infrastructure/identity/UlidIdentifierGenerator.js";

import { PrismaPaymentIntentRepository } from "@infrastructure/payment/PrismaPaymentIntentRepository.js";
import { PrismaPlanRepository } from "@infrastructure/plan/PrismaPlanRepository.js";
import { PrismaPurchaseRepository } from "@infrastructure/purchase/PrismaPurchaseRepository.js";

import { IntaSendWebhookController } from "@http/payment/controller/IntaSendWebhookController.js";
import { PurchasePaymentController } from "@http/payment/controller/PurchasePaymentController.js";

export function createIntaSendWebhookController(): IntaSendWebhookController {
  const paymentIntentRepository = new PrismaPaymentIntentRepository();

  const planRepository = new PrismaPlanRepository();

  const purchaseRepository = new PrismaPurchaseRepository();

  const identifierGenerator = new UlidIdentifierGenerator();

  const fulfilPurchase = new FulfilPurchase(
    purchaseRepository,
    planRepository,
    identifierGenerator,
  );

  const confirmPayment = new ConfirmPayment(
    paymentIntentRepository,
    fulfilPurchase,
  );

  const receivePaymentConfirmation = new ReceivePaymentConfirmation(
    confirmPayment,
  );

  return new IntaSendWebhookController(receivePaymentConfirmation);
}

export function createPurchasePaymentController(): PurchasePaymentController {
  const planRepository = new PrismaPlanRepository();

  const paymentIntentRepository = new PrismaPaymentIntentRepository();

  const paymentGateway = createIntaSendGateway();

  const identifierGenerator = new UlidIdentifierGenerator();

  const initiatePayment = new InitiatePayment(
    paymentGateway,
    paymentIntentRepository,
  );

  const purchasePlan = new PurchasePlan(
    planRepository,
    initiatePayment,
    identifierGenerator,
  );

  return new PurchasePaymentController(purchasePlan);
}
