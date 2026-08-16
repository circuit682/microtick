import { CustomerRepository } from "@application/ports/CustomerRepository.js";
import { Customer } from "@domain";

import { prisma } from "@infrastructure/database/prisma.js";

import { CustomerMapper } from "./CustomerMapper.js";

export class PrismaCustomerRepository implements CustomerRepository {
  async save(customer: Customer): Promise<void> {
    const data = CustomerMapper.toPersistence(customer);

    await prisma.customer.upsert({
      where: {
        id: data.id,
      },
      create: data,
      update: data,
    });
  }

  async findById(id: string): Promise<Customer | null> {
    const customer = await prisma.customer.findUnique({
      where: {
        id,
      },
    });

    if (!customer) {
      return null;
    }

    return CustomerMapper.toDomain(customer);
  }

  async findByPhoneNumber(phoneNumber: string): Promise<Customer | null> {
    const customer = await prisma.customer.findUnique({
      where: {
        phoneNumber,
      },
    });

    if (!customer) {
      return null;
    }

    return CustomerMapper.toDomain(customer);
  }
}
