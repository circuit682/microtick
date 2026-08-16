import type { Customer } from "@domain";

export interface CustomerRepository {
  save(customer: Customer): Promise<void>;
  findById(id: string): Promise<Customer | null>;
  findByPhoneNumber(phoneNumber: string): Promise<Customer | null>;
}
