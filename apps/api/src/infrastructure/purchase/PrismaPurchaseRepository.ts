import { PurchaseRepository } from "@application/ports/PurchaseRepository.js";
import { Purchase } from "@domain";

import { prisma } from "@infrastructure/database/prisma.js";

import { PurchaseMapper } from "./PurchaseMapper.js";

export class PrismaPurchaseRepository implements PurchaseRepository {
  async save(purchase: Purchase): Promise<void> {
    const data = PurchaseMapper.toPersistence(purchase);

    await prisma.purchase.upsert({
      where: {
        id: data.id,
      },
      create: data,
      update: data,
    });
  }

  async findById(id: string): Promise<Purchase | null> {
    const purchase = await prisma.purchase.findUnique({
      where: {
        id,
      },
    });

    if (!purchase) {
      return null;
    }

    return PurchaseMapper.toDomain(purchase);
  }

  async findByCustomerId(customerId: string): Promise<Purchase[]> {
    const purchases = await prisma.purchase.findMany({
      where: {
        customerId,
      },
      orderBy: {
        purchasedAt: "desc",
      },
    });

    return purchases.map(PurchaseMapper.toDomain);
  }
}
