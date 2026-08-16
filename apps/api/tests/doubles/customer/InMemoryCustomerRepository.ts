import type { CustomerRepository } from "@application/ports/CustomerRepository.js";
import type { Customer } from "@domain";

export class InMemoryCustomerRepository implements CustomerRepository {
  private readonly customers = new Map<string, Customer>();

  async save(customer: Customer): Promise<void> {
    this.customers.set(customer.id, customer);
  }

  async findById(id: string): Promise<Customer | null> {
    return this.customers.get(id) ?? null;
  }

  async findByPhoneNumber(phoneNumber: string): Promise<Customer | null> {
    for (const customer of this.customers.values()) {
      if (customer.phoneNumber === phoneNumber) {
        return customer;
      }
    }

    return null;
  }
}
