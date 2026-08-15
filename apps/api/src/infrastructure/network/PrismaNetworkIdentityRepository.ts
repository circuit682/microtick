import type { NetworkIdentityRepository } from "@application/ports/NetworkIdentityRepository.js";
import { NetworkIdentity } from "@domain";

import { prisma } from "@infrastructure/database/prisma.js";

import { NetworkIdentityMapper } from "./NetworkIdentityMapper.js";

export class PrismaNetworkIdentityRepository implements NetworkIdentityRepository {
  constructor(
    private readonly encrypt: (value: string) => string,
    private readonly decrypt: (value: string) => string,
  ) {}

  async save(identity: NetworkIdentity): Promise<void> {
    const data = NetworkIdentityMapper.toPersistence(identity, this.encrypt);

    await prisma.networkIdentity.upsert({
      where: {
        id: data.id,
      },
      create: data,
      update: data,
    });
  }

  async findById(id: string): Promise<NetworkIdentity | null> {
    const identity = await prisma.networkIdentity.findUnique({
      where: {
        id,
      },
    });

    if (!identity) {
      return null;
    }

    return NetworkIdentityMapper.toDomain(identity, this.decrypt);
  }

  async findByUsername(username: string): Promise<NetworkIdentity | null> {
    const identity = await prisma.networkIdentity.findUnique({
      where: {
        username,
      },
    });

    if (!identity) {
      return null;
    }

    return NetworkIdentityMapper.toDomain(identity, this.decrypt);
  }

  async findByCustomerId(customerId: string): Promise<NetworkIdentity[]> {
    const identities = await prisma.networkIdentity.findMany({
      where: {
        customerId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return identities.map((identity) =>
      NetworkIdentityMapper.toDomain(identity, this.decrypt),
    );
  }
}
