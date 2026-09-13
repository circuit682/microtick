import { GetCustomerInternetAccess } from "@application/access/GetCustomerInternetAccess.js";
import { GetCustomer } from "@application/customer/GetCustomer.js";
import { GetCustomerPurchases } from "@application/customer/GetCustomerPurchases.js";

import { GetCustomerController } from "@http/customer/controller/GetCustomerController.js";
import { GetCustomerInternetAccessController } from "@http/customer/controller/GetCustomerInternetAccessController.js";
import { GetCustomerPurchasesController } from "@http/customer/controller/GetCustomerPurchasesController.js";

import { PrismaInternetAccessRepository } from "@infrastructure/access/PrismaInternetAccessRepository.js";
import { PrismaCustomerRepository } from "@infrastructure/customer/PrismaCustomerRepository.js";
import { PrismaPurchaseRepository } from "@infrastructure/purchase/PrismaPurchaseRepository.js";

export function createGetCustomerController(): GetCustomerController {
  const customerRepository = new PrismaCustomerRepository();

  const getCustomer = new GetCustomer(customerRepository);

  return new GetCustomerController(getCustomer);
}

export function createGetCustomerInternetAccessController(): GetCustomerInternetAccessController {
  const internetAccessRepository = new PrismaInternetAccessRepository();

  const getCustomerInternetAccess = new GetCustomerInternetAccess(
    internetAccessRepository,
  );

  return new GetCustomerInternetAccessController(getCustomerInternetAccess);
}

export function createGetCustomerPurchasesController(): GetCustomerPurchasesController {
  const purchaseRepository = new PrismaPurchaseRepository();
  const getCustomerPurchases = new GetCustomerPurchases(purchaseRepository);

  return new GetCustomerPurchasesController(getCustomerPurchases);
}
