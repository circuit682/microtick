import type { NetworkIdentity as PrismaNetworkIdentity } from "@generated/prisma/client.js";

import { AuthenticationMethod, NetworkIdentity } from "@domain";

export class NetworkIdentityMapper {
  static toDomain(
    identity: PrismaNetworkIdentity,
    decrypt: (value: string) => string,
  ): NetworkIdentity {
    return NetworkIdentity.reconstitute({
      id: identity.id,
      customerId: identity.customerId,
      username: identity.username,
      credential: decrypt(identity.encryptedCredential),
      authenticationMethod:
        identity.authenticationMethod === AuthenticationMethod.HOTSPOT
          ? AuthenticationMethod.HOTSPOT
          : (() => {
              throw new Error(
                `Unsupported authentication method: ${identity.authenticationMethod}`,
              );
            })(),
    });
  }

  static toPersistence(
    identity: NetworkIdentity,
    encrypt: (value: string) => string,
  ): {
    id: string;
    customerId: string;
    username: string;
    encryptedCredential: string;
    authenticationMethod: AuthenticationMethod;
  } {
    return {
      id: identity.id,
      customerId: identity.customerId,
      username: identity.username,
      encryptedCredential: encrypt(identity.credential),
      authenticationMethod: identity.authenticationMethod,
    };
  }
}
