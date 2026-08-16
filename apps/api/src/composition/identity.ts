import { GetNetworkIdentities } from "@application/identity/GetNetworkIdentities.js";

import { env } from "@config/env.js";

import { PrismaNetworkIdentityRepository } from "@infrastructure/network/PrismaNetworkIdentityRepository.js";
import { Aes256GcmCredentialEncryptor } from "@infrastructure/security/Aes256GcmCredentialEncryptor.js";

export function createGetNetworkIdentities(): GetNetworkIdentities {
  const encryptor = new Aes256GcmCredentialEncryptor(
    env.security.networkIdentityEncryptionKey,
  );

  const networkIdentityRepository = new PrismaNetworkIdentityRepository(
    (value) => encryptor.encrypt(value),
    (value) => encryptor.decrypt(value),
  );

  return new GetNetworkIdentities(networkIdentityRepository);
}
