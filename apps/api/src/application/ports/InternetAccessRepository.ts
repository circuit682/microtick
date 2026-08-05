import { InternetAccess } from "@domain";

export interface InternetAccessRepository {
  save(access: InternetAccess): Promise<void>;

  findByPurchaseId(purchaseId: string): Promise<InternetAccess | null>;

  findByCustomerId(customerId: string): Promise<InternetAccess | null>;
}
