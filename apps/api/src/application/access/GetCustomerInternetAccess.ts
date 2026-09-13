import type { InternetAccess } from "@domain";

import type { InternetAccessRepository } from "@application/ports/InternetAccessRepository.js";

export interface GetCustomerInternetAccessCommand {
  customerId: string;
}

export class GetCustomerInternetAccess {
  constructor(private readonly repository: InternetAccessRepository) {}

  async execute(
    command: GetCustomerInternetAccessCommand,
  ): Promise<InternetAccess | null> {
    return this.repository.findByCustomerId(command.customerId);
  }
}
