import { GrantInternetAccess } from "@application/access/GrantInternetAccess.js";
import type { PlanRepository } from "@application/plan/PlanRepository.js";
import type { CredentialGenerator } from "@application/ports/CredentialGenerator.js";
import type { NetworkIdentityRepository } from "@application/ports/NetworkIdentityRepository.js";
import type { PurchaseRepository } from "@application/ports/PurchaseRepository.js";
import type { UsernameGenerator } from "@application/ports/UsernameGenerator.js";

import { AuthenticationMethod, NetworkIdentity, Purchase } from "@domain";

import type { IdentifierGenerator } from "@shared";

export interface FulfilPurchaseCommand {
  paymentId: string;
  customerId: string;
  planId: string;
  purchasedAt: Date;
}

export interface FulfilPurchaseUseCase {
  execute(command: FulfilPurchaseCommand): Promise<void>;
}

export class FulfilPurchase implements FulfilPurchaseUseCase {
  constructor(
    private readonly purchaseRepository: PurchaseRepository,
    private readonly planRepository: PlanRepository,
    private readonly identifierGenerator: IdentifierGenerator,
    private readonly networkIdentityRepository: NetworkIdentityRepository,
    private readonly usernameGenerator: UsernameGenerator,
    private readonly credentialGenerator: CredentialGenerator,
    private readonly grantInternetAccess: GrantInternetAccess,
  ) {}

  async execute(command: FulfilPurchaseCommand): Promise<void> {
    const existing = await this.purchaseRepository.findByPaymentIntentId(
      command.paymentId,
    );

    if (existing !== null) {
      return;
    }

    const plan = await this.planRepository.findById(command.planId);

    if (plan === null) {
      throw new Error(`Plan '${command.planId}' was not found.`);
    }

    const purchase = Purchase.create({
      id: this.identifierGenerator.generate(),

      paymentIntentId: command.paymentId,
      customerId: command.customerId,

      planId: plan.id,
      planName: plan.name,
      planPrice: plan.price,

      validity: plan.validity,

      consumptionPolicy: plan.consumptionPolicy,

      serviceLevel: plan.serviceLevel,

      accessMethod: plan.accessMethod,

      purchasedAt: command.purchasedAt,
    });

    await this.purchaseRepository.save(purchase);

    const networkIdentity = NetworkIdentity.create({
      id: this.identifierGenerator.generate(),
      customerId: purchase.customerId,
      username: this.usernameGenerator.generate(),
      credential: this.credentialGenerator.generate(),
      authenticationMethod: AuthenticationMethod.HOTSPOT,
    });

    await this.networkIdentityRepository.save(networkIdentity);

    await this.grantInternetAccess.execute({
      purchaseId: purchase.id,
      customerId: purchase.customerId,
      plan,
      grantedAt: purchase.purchasedAt,
    });
  }
}
