import { Purchase } from "@domain";

export interface PurchaseRepository {
  /**
   * Persists a purchase.
   *
   * Creates a new record if one does not already exist,
   * otherwise updates the existing record.
   */
  save(purchase: Purchase): Promise<void>;

  /**
   * Finds a purchase by its unique identifier.
   */
  findById(id: string): Promise<Purchase | null>;

  // find by payment intent id
  findByPaymentIntentId(paymentIntentId: string): Promise<Purchase | null>;

  /**
   * Returns all purchases belonging to a customer.
   */
  findByCustomerId(customerId: string): Promise<Purchase[]>;
}
