import { InternetAccess } from "@domain";

import { InternetAccessRepository } from "@application/ports/InternetAccessRepository.js";

export class MemoryInternetAccessRepository implements InternetAccessRepository {
  private readonly accesses = new Map<string, InternetAccess>();

  async findAll(): Promise<InternetAccess[]> {
    return [...this.accesses.values()];
  }

  async save(access: InternetAccess): Promise<void> {
    this.accesses.set(access.id, access);
  }

  async findByPurchaseId(purchaseId: string): Promise<InternetAccess | null> {
    for (const access of this.accesses.values()) {
      if (access.purchaseId === purchaseId) {
        return access;
      }
    }

    return null;
  }

  async findByCustomerId(customerId: string): Promise<InternetAccess | null> {
    for (const access of this.accesses.values()) {
      if (access.customerId === customerId) {
        return access;
      }
    }

    return null;
  }
}
