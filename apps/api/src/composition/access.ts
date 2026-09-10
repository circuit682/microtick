import { ActivateInternetAccess } from "@application/access/ActivateInternetAccess.js";
import { ActivateInternetAccessFromRouterOs } from "@application/access/ActivateInternetAccessFromRouterOs.js";
import { ExpireExpiredInternetAccess } from "@application/access/ExpireExpiredInternetAccess.js";
import { RecordInternetAccessUsage } from "@application/access/RecordInternetAccessUsage.js";
import { RecordInternetAccessUsageFromRouterOs } from "@application/access/RecordInternetAccessUsageFromRouterOs.js";
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

  const recordInternetAccessUsage = new RecordInternetAccessUsage(
    internetAccessRepository,
  );

  const recordInternetAccessUsageFromRouterOs =
    new RecordInternetAccessUsageFromRouterOs(
      networkIdentityRepository,
      purchaseRepository,
      recordInternetAccessUsage,
    );

  const expireExpiredInternetAccess = new ExpireExpiredInternetAccess(
    internetAccessRepository,
    purchaseRepository,
    networkIdentityRepository,
    routerOsClient,
  );

  return new RouterOsAccessPoller(async () => {
    await activateInternetAccessFromRouterOs.execute();
    const intervals = await routerOsClient.getHotspotSessionIntervals();
    await recordInternetAccessUsageFromRouterOs.execute(intervals);
    await expireExpiredInternetAccess.execute({ now: new Date() });
  }, 1000);
}
