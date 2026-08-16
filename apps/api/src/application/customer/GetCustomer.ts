import type { Customer } from "@domain";

import type { CustomerRepository } from "@application/ports/CustomerRepository.js";

export interface GetCustomerCommand {
  customerId: string;
}

export interface GetCustomerUseCase {
  execute(command: GetCustomerCommand): Promise<Customer | null>;
}

export class GetCustomer implements GetCustomerUseCase {
  constructor(private readonly customerRepository: CustomerRepository) {}

  async execute(command: GetCustomerCommand): Promise<Customer | null> {
    return this.customerRepository.findById(command.customerId);
  }
}
