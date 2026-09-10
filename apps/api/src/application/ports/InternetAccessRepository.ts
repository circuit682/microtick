import { InternetAccess } from "@domain";

export interface InternetAccessRepository {
  save(access: InternetAccess): Promise<void>;

  findAll(): Promise<InternetAccess[]>;

  findByPurchaseId(purchaseId: string): Promise<InternetAccess | null>;

  findByCustomerId(customerId: string): Promise<InternetAccess | null>;
}
