import { ActivateInternetAccess } from "@application/access/ActivateInternetAccess.js";
import { ActivateInternetAccessFromRouterOs } from "@application/access/ActivateInternetAccessFromRouterOs.js";
import { RouterOsAccessPoller } from "@application/access/RouterOsAccessPoller.js";

import type { RouterOsClient } from "@application/ports/RouterOsClient.js";

import { env } from "@config/env.js";

import { PrismaInternetAccessRepository } from "@infrastructure/access/PrismaInternetAccessRepository.js";
import { PrismaNetworkIdentityRepository } from "@infrastructure/network/PrismaNetworkIdentityRepository.js";
import { PrismaPurchaseRepository } from "@infrastructure/purchase/PrismaPurchaseRepository.js";
import { Aes256GcmCredentialEncryptor } from "@infrastructure/security/Aes256GcmCredentialEncryptor.js";

export function createRouterOsAccessPoller(
  routerOsClient: RouterOsClient,
): RouterOsAccessPoller {
  const internetAccessRepository = new PrismaInternetAccessRepository();

  const purchaseRepository = new PrismaPurchaseRepository();

  const encryptor = new Aes256GcmCredentialEncryptor(
    env.security.networkIdentityEncryptionKey,
  );

  const networkIdentityRepository = new PrismaNetworkIdentityRepository(
    (value) => encryptor.encrypt(value),
    (value) => encryptor.decrypt(value),
  );

  const activateInternetAccess = new ActivateInternetAccess(
    internetAccessRepository,
    networkIdentityRepository,
    purchaseRepository,
    routerOsClient,
  );

  const activateInternetAccessFromRouterOs =
    new ActivateInternetAccessFromRouterOs(
      routerOsClient,
      networkIdentityRepository,
      purchaseRepository,
      activateInternetAccess,
    );

  return new RouterOsAccessPoller(
    () => activateInternetAccessFromRouterOs.execute(),
    1000,
  );
}
