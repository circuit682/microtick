import { describe, expect, it } from "vitest";

import { AuthenticationMethod, NetworkIdentity } from "@domain";

import { NetworkIdentityMapper } from "@infrastructure/network/NetworkIdentityMapper.js";

describe("NetworkIdentityMapper", () => {
  const identity = NetworkIdentity.create({
    id: "identity-1",
    customerId: "254712345678",
    username: "mt_customer_1",
    credential: "uK8#pR2!xQ7@Lm4",
    authenticationMethod: AuthenticationMethod.HOTSPOT,
  });

  it("should map a domain identity to persistence data", () => {
    const encrypt = (value: string): string => `encrypted:${value}`;

    const persistence = NetworkIdentityMapper.toPersistence(identity, encrypt);

    expect(persistence).toEqual({
      id: "identity-1",
      customerId: "254712345678",
      username: "mt_customer_1",
      encryptedCredential: "encrypted:uK8#pR2!xQ7@Lm4",
      authenticationMethod: AuthenticationMethod.HOTSPOT,
    });
  });

  it("should map persistence data back to the domain", () => {
    const decrypt = (value: string): string => value.replace("encrypted:", "");

    const domain = NetworkIdentityMapper.toDomain(
      {
        id: "identity-1",
        customerId: "254712345678",
        username: "mt_customer_1",
        encryptedCredential: "encrypted:uK8#pR2!xQ7@Lm4",
        authenticationMethod: AuthenticationMethod.HOTSPOT,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      decrypt,
    );

    expect(domain.id).toBe(identity.id);
    expect(domain.customerId).toBe(identity.customerId);
    expect(domain.username).toBe(identity.username);
    expect(domain.credential).toBe(identity.credential);
    expect(domain.authenticationMethod).toBe(AuthenticationMethod.HOTSPOT);
  });

  it("should not persist the plaintext credential", () => {
    const persistence = NetworkIdentityMapper.toPersistence(
      identity,
      () => "encrypted-value",
    );

    expect(persistence.encryptedCredential).toBe("encrypted-value");

    expect(persistence.encryptedCredential).not.toBe(identity.credential);
  });

  it("should preserve the authentication method", () => {
    const persistence = NetworkIdentityMapper.toPersistence(
      identity,
      (value) => value,
    );

    expect(persistence.authenticationMethod).toBe(AuthenticationMethod.HOTSPOT);
  });
});
