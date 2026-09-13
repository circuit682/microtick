import type { Purchase } from "@domain";

import type { PurchaseRepository } from "@application/ports/PurchaseRepository.js";

export interface GetCustomerPurchasesCommand {
  customerId: string;
}

export class GetCustomerPurchases {
  constructor(private readonly purchaseRepository: PurchaseRepository) {}

  async execute(command: GetCustomerPurchasesCommand): Promise<Purchase[]> {
    return this.purchaseRepository.findByCustomerId(command.customerId);
  }
}
