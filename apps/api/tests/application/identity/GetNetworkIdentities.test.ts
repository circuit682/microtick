import { describe, expect, it } from "vitest";

import { GetNetworkIdentities } from "@application/identity/GetNetworkIdentities.js";

import { AuthenticationMethod, NetworkIdentity } from "@domain";

import type { NetworkIdentityRepository } from "@application/ports/NetworkIdentityRepository.js";

describe("GetNetworkIdentities", () => {
  it("should return network identities belonging to a customer without exposing credentials", async () => {
    const identities = [
      NetworkIdentity.create({
        id: "identity-1",
        customerId: "customer-001",
        username: "mt_customer_001",
        credential: "SecretCredential123!",
        authenticationMethod: AuthenticationMethod.HOTSPOT,
      }),
    ];

    const repository: NetworkIdentityRepository = {
      save: async () => {},
      findById: async () => null,
      findByUsername: async () => null,
      findByCustomerId: async (customerId) =>
        identities.filter((identity) => identity.customerId === customerId),
    };

    const useCase = new GetNetworkIdentities(repository);

    const result = await useCase.execute({
      customerId: "customer-001",
    });

    expect(result).toEqual([
      {
        id: "identity-1",
        customerId: "customer-001",
        username: "mt_customer_001",
        authenticationMethod: AuthenticationMethod.HOTSPOT,
      },
    ]);

    expect(result[0]).not.toHaveProperty("credential");
  });

  it("should return an empty array when the customer has no identities", async () => {
    const repository: NetworkIdentityRepository = {
      save: async () => {},
      findById: async () => null,
      findByUsername: async () => null,
      findByCustomerId: async () => [],
    };

    const useCase = new GetNetworkIdentities(repository);

    const result = await useCase.execute({
      customerId: "customer-without-identities",
    });

    expect(result).toEqual([]);
  });
});
