import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { AuthenticationMethod, NetworkIdentity } from "@domain";

import { prisma } from "@infrastructure/database/prisma.js";
import { Aes256GcmCredentialEncryptor } from "@infrastructure/security/Aes256GcmCredentialEncryptor.js";
import { PrismaNetworkIdentityRepository } from "@infrastructure/network/PrismaNetworkIdentityRepository.js";

describe("PrismaNetworkIdentityRepository", () => {
  const encryptionKey = Buffer.from("0123456789abcdef0123456789abcdef", "utf8");

  let repository: PrismaNetworkIdentityRepository;

  beforeEach(async () => {
    await prisma.networkIdentity.deleteMany();

    const encryptor = new Aes256GcmCredentialEncryptor(encryptionKey);

    repository = new PrismaNetworkIdentityRepository(
      (value) => encryptor.encrypt(value),
      (value) => encryptor.decrypt(value),
    );
  });

  afterEach(async () => {
    await prisma.networkIdentity.deleteMany();
  });

  function createIdentity(
    id: string,
    customerId: string,
    username: string,
  ): NetworkIdentity {
    return NetworkIdentity.create({
      id,
      customerId,
      username,
      credential: "uK8#pR2!xQ7@Lm4",
      authenticationMethod: AuthenticationMethod.HOTSPOT,
    });
  }

  it("should save and retrieve an identity by id", async () => {
    const identity = createIdentity(
      "identity-1",
      "254712345678",
      "mt_customer_1",
    );

    await repository.save(identity);

    const stored = await repository.findById(identity.id);

    expect(stored).not.toBeNull();
    expect(stored?.id).toBe(identity.id);
    expect(stored?.customerId).toBe(identity.customerId);
    expect(stored?.username).toBe(identity.username);
    expect(stored?.credential).toBe(identity.credential);
    expect(stored?.authenticationMethod).toBe(AuthenticationMethod.HOTSPOT);
  });

  it("should not persist the plaintext credential", async () => {
    const identity = createIdentity(
      "identity-2",
      "254712345679",
      "mt_customer_2",
    );

    await repository.save(identity);

    const stored = await prisma.networkIdentity.findUnique({
      where: {
        id: identity.id,
      },
    });

    expect(stored).not.toBeNull();
    expect(stored?.encryptedCredential).not.toBe(identity.credential);
  });

  it("should find an identity by username", async () => {
    const identity = createIdentity(
      "identity-3",
      "254712345680",
      "mt_customer_3",
    );

    await repository.save(identity);

    const stored = await repository.findByUsername(identity.username);

    expect(stored?.id).toBe(identity.id);
    expect(stored?.customerId).toBe(identity.customerId);
    expect(stored?.credential).toBe(identity.credential);
  });

  it("should find all identities belonging to a customer", async () => {
    const first = createIdentity(
      "identity-4",
      "254712345681",
      "mt_customer_4a",
    );

    const second = createIdentity(
      "identity-5",
      "254712345681",
      "mt_customer_4b",
    );

    await repository.save(first);
    await repository.save(second);

    const identities = await repository.findByCustomerId("254712345681");

    expect(identities).toHaveLength(2);
    expect(identities.map((identity) => identity.id)).toEqual(
      expect.arrayContaining([first.id, second.id]),
    );
  });

  it("should return null when the identity does not exist", async () => {
    const stored = await repository.findById("missing-identity");

    expect(stored).toBeNull();
  });

  it("should return an empty array when a customer has no identities", async () => {
    const identities = await repository.findByCustomerId(
      "customer-without-identities",
    );

    expect(identities).toEqual([]);
  });

  it("should update an existing identity without exposing the credential", async () => {
    const identity = createIdentity(
      "identity-6",
      "254712345682",
      "mt_customer_6",
    );

    await repository.save(identity);

    const updated = NetworkIdentity.create({
      id: identity.id,
      customerId: identity.customerId,
      username: "mt_customer_6_updated",
      credential: "New9#Credential7",
      authenticationMethod: AuthenticationMethod.HOTSPOT,
    });

    await repository.save(updated);

    const stored = await repository.findById(updated.id);

    expect(stored?.username).toBe(updated.username);
    expect(stored?.credential).toBe(updated.credential);

    const persisted = await prisma.networkIdentity.findUnique({
      where: {
        id: updated.id,
      },
    });

    expect(persisted?.encryptedCredential).not.toBe(updated.credential);
  });
});
