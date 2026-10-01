import Fastify from "fastify";

import {
  createIntaSendWebhookController,
  createPurchasePaymentController,
} from "./composition/payment.js";

import { createRouterOsAccessPoller } from "./composition/access.js";

import { createPaymentRoutes } from "./http/payment/routes/paymentRoutes.js";

import {
  createGetCustomerController,
  createGetCustomerInternetAccessController,
  createGetCustomerPurchasesController,
} from "./composition/customer.js";

import {
  createCreateSessionController,
  createGetActiveSessionController,
  createSessionHygienePoller,
} from "./composition/session.js";

import {
  createCreateOtpChallengeController,
  createVerifyOtpCodeController,
} from "./composition/otp.js";

import { createCustomerRoutes } from "./http/customer/routes/customerRoutes.js";
import { createSessionRoutes } from "./http/session/routes/sessionRoutes.js";
import { createOtpRoutes } from "./http/otp/routes/otpRoutes.js";

import { createAuthenticateCustomerController } from "./composition/auth.js";
import { createAuthRoutes } from "./http/auth/routes/authRoutes.js";

import type { OtpDeliveryProvider } from "@infrastructure/otp/OtpDeliveryService.js";

import type { RouterOsClient } from "@application/ports/RouterOsClient.js";
import { RouterOsClientAdapter } from "@infrastructure/routeros/RouterOsClient.js";

import { registerErrorHandler } from "./http/errors/errorHandler.js";

export function createServer(
  otpDeliveryProvider?: OtpDeliveryProvider,
  routerOsClient?: RouterOsClient,
) {
  const server = Fastify({
    logger: true,
  });

  const resolvedRouterOsClient = routerOsClient ?? new RouterOsClientAdapter();

  const routerOsAccessPoller = createRouterOsAccessPoller(
    resolvedRouterOsClient,
  );

  const sessionHygienePoller = createSessionHygienePoller();

  // Registered before the RouterOS hook below: session hygiene has no
  // RouterOS dependency and must not be blocked by a RouterOS
  // connection failure. Fastify runs onReady hooks in registration
  // order and stops at the first one that throws, so this ordering
  // guarantees this poller starts regardless of what the RouterOS
  // hook does next.
  server.addHook("onReady", async () => {
    sessionHygienePoller.start();
  });

  // A RouterOS connect() failure must not take the whole server down.
  // Logged and swallowed rather than rethrown, so server.ready()
  // resolves and every other route remains available. The RouterOS
  // poller simply does not start until a future restart succeeds --
  // there is no automatic reconnect/retry here.
  server.addHook("onReady", async () => {
    try {
      await resolvedRouterOsClient.connect();
      routerOsAccessPoller.start();
    } catch (error) {
      server.log.error(
        { err: error },
        "Failed to connect to RouterOS at startup. The RouterOS access poller will not start; other routes remain available.",
      );
    }
  });

  server.addHook("onClose", async () => {
    sessionHygienePoller.stop();
  });

  server.addHook("onClose", async () => {
    routerOsAccessPoller.stop();
    await resolvedRouterOsClient.close();
  });

  registerErrorHandler(server);

  const purchasePaymentController = createPurchasePaymentController();

  const intaSendWebhookController = createIntaSendWebhookController(
    resolvedRouterOsClient,
  );

  const getCustomerController = createGetCustomerController();

  const getCustomerInternetAccessController =
    createGetCustomerInternetAccessController();

  const getCustomerPurchasesController = createGetCustomerPurchasesController();

  const createSessionController = createCreateSessionController();

  const getActiveSessionController = createGetActiveSessionController();

  const createOtpChallengeController =
    createCreateOtpChallengeController(otpDeliveryProvider);

  const verifyOtpCodeController = createVerifyOtpCodeController();

  const authenticateCustomerController = createAuthenticateCustomerController();

  server.register(
    createPaymentRoutes(purchasePaymentController, intaSendWebhookController),
    {
      prefix: "/payments",
    },
  );

  server.register(
    createCustomerRoutes(
      getCustomerController,
      getCustomerInternetAccessController,
      getCustomerPurchasesController,
    ),
    {
      prefix: "/customers",
    },
  );

  server.register(
    createSessionRoutes(createSessionController, getActiveSessionController),
    {
      prefix: "/customers",
    },
  );

  server.register(
    createOtpRoutes(createOtpChallengeController, verifyOtpCodeController),
    {
      prefix: "/otp",
    },
  );

  server.register(createAuthRoutes(authenticateCustomerController), {
    prefix: "/auth",
  });

  return server;
}
