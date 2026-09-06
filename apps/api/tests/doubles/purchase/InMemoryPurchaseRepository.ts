import { Purchase } from "@domain";

import { PurchaseRepository } from "@application/ports/PurchaseRepository.js";

export class InMemoryPurchaseRepository implements PurchaseRepository {
  private readonly purchases = new Map<string, Purchase>();

  async save(purchase: Purchase): Promise<void> {
    this.purchases.set(purchase.id, purchase);
  }

  async findById(id: string): Promise<Purchase | null> {
    return this.purchases.get(id) ?? null;
  }

  async findByCustomerId(customerId: string): Promise<Purchase[]> {
    return [...this.purchases.values()].filter(
      (purchase) => purchase.customerId === customerId,
    );
  }

  async findByPaymentIntentId(
    paymentIntentId: string,
  ): Promise<Purchase | null> {
    return (
      [...this.purchases.values()].find(
        (purchase) => purchase.paymentIntentId === paymentIntentId,
      ) ?? null
    );
  }

  async findByNetworkIdentityId(
    networkIdentityId: string,
  ): Promise<Purchase | null> {
    return (
      [...this.purchases.values()].find(
        (purchase) => purchase.networkIdentityId === networkIdentityId,
      ) ?? null
    );
  }
}
