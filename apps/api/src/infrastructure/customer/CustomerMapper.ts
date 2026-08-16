import type { Customer as PrismaCustomer } from "@generated/prisma/client.js";

import { Customer } from "@domain";

export class CustomerMapper {
  static toDomain(customer: PrismaCustomer): Customer {
    return Customer.reconstitute({
      id: customer.id,
      phoneNumber: customer.phoneNumber,
    });
  }

  static toPersistence(customer: Customer): {
    id: string;
    phoneNumber: string;
  } {
    return {
      id: customer.id,
      phoneNumber: customer.phoneNumber,
    };
  }
}
