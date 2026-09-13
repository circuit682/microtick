import type { FastifyReply, FastifyRequest } from "fastify";

import type { GetCustomerPurchases } from "@application/customer/GetCustomerPurchases.js";

export interface GetCustomerPurchasesRequest {
  Params: {
    customerId: string;
  };
}

export class GetCustomerPurchasesController {
  constructor(private readonly getCustomerPurchases: GetCustomerPurchases) {}

  async handle(
    request: FastifyRequest<GetCustomerPurchasesRequest>,
    reply: FastifyReply,
  ): Promise<void> {
    const purchases = await this.getCustomerPurchases.execute({
      customerId: request.params.customerId,
    });

    await reply.code(200).send(
      purchases.map((purchase) => ({
        id: purchase.id,
        planId: purchase.planId,
        planName: purchase.planName,
        planPriceMinor: purchase.planPrice.minorUnits,
        validity: {
          amount: purchase.validity.amount,
          unit: purchase.validity.unit,
        },
        consumptionPolicy: purchase.consumptionPolicy,
        serviceLevel: purchase.serviceLevel.name,
        accessMethod: purchase.accessMethod,
        purchasedAt: purchase.purchasedAt,
      })),
    );
  }
}
