import { env } from "@config/env.js";

import { IntaSendGateway } from "@infrastructure/payment/IntaSendGateway.js";

export function createIntaSendGateway(): IntaSendGateway {
  return new IntaSendGateway({
    publishableKey: env.intaSend.publishableKey,
    baseUrl: env.intaSend.baseUrl,
    host: env.intaSend.host,
    redirectUrl: env.intaSend.redirectUrl,
  });
}