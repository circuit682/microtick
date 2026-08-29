import { GrantInternetAccess } from "@application/access/GrantInternetAccess.js";
import { ConfirmPayment } from "@application/payment/ConfirmPayment.js";
import { InitiatePayment } from "@application/payment/InitiatePayment.js";
import { ReceivePaymentConfirmation } from "@application/payment/ReceivePaymentConfirmation.js";

import { PurchasePlan } from "@application/plan/PurchasePlan.js";
import { FulfilPurchase } from "@application/purchase/FulfilPurchase.js";

import type { CredentialGenerator } from "@application/ports/CredentialGenerator.js";
import type { UsernameGenerator } from "@application/ports/UsernameGenerator.js";

import { env } from "@config/env.js";

import { IntaSendWebhookController } from "@http/payment/controller/IntaSendWebhookController.js";
import { PurchasePaymentController } from "@http/payment/controller/PurchasePaymentController.js";

import { PrismaInternetAccessRepository } from "@infrastructure/access/PrismaInternetAccessRepository.js";
import { HotspotUsernameGenerator } from "@infrastructure/identity/HotspotUsernameGenerator.js";
import { UlidIdentifierGenerator } from "@infrastructure/identity/UlidIdentifierGenerator.js";
import { PrismaNetworkIdentityRepository } from "@infrastructure/network/PrismaNetworkIdentityRepository.js";
import { Aes256GcmCredentialEncryptor } from "@infrastructure/security/Aes256GcmCredentialEncryptor.js";
import { SecureCredentialGenerator } from "@infrastructure/security/SecureCredentialGenerator.js";
import { PrismaPaymentIntentRepository } from "@infrastructure/payment/PrismaPaymentIntentRepository.js";
import { PrismaPlanRepository } from "@infrastructure/plan/PrismaPlanRepository.js";
import { PrismaPurchaseRepository } from "@infrastructure/purchase/PrismaPurchaseRepository.js";

import { createIntaSendGateway } from "./infrastructure/intaSend.js";
import type { RouterOsClient } from "@application/ports/RouterOsClient.js";


export function createIntaSendWebhookController(
  routerOsClient: RouterOsClient,
): IntaSendWebhookController {
  const paymentIntentRepository = new PrismaPaymentIntentRepository();

  const planRepository = new PrismaPlanRepository();

  const purchaseRepository = new PrismaPurchaseRepository();

  const internetAccessRepository = new PrismaInternetAccessRepository();

  const identifierGenerator = new UlidIdentifierGenerator();

  const encryptor = new Aes256GcmCredentialEncryptor(
    env.security.networkIdentityEncryptionKey,
  );

  const networkIdentityRepository = new PrismaNetworkIdentityRepository(
    (value) => encryptor.encrypt(value),
    (value) => encryptor.decrypt(value),
  );

  const usernameGenerator: UsernameGenerator = new HotspotUsernameGenerator(
    identifierGenerator,
  );

  const credentialGenerator: CredentialGenerator =
    new SecureCredentialGenerator();

  const grantInternetAccess = new GrantInternetAccess(
    internetAccessRepository,
    identifierGenerator,
  );

  const fulfilPurchase = new FulfilPurchase(
    purchaseRepository,
    planRepository,
    identifierGenerator,
    networkIdentityRepository,
    usernameGenerator,
    credentialGenerator,
    grantInternetAccess,
    routerOsClient,
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
