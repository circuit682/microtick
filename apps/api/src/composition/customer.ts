import { GetCustomer } from "@application/customer/GetCustomer.js";

import { GetCustomerController } from "@http/customer/controller/GetCustomerController.js";

import { PrismaCustomerRepository } from "@infrastructure/customer/PrismaCustomerRepository.js";

export function createGetCustomerController(): GetCustomerController {
  const customerRepository = new PrismaCustomerRepository();

  const getCustomer = new GetCustomer(customerRepository);

  return new GetCustomerController(getCustomer);
}
