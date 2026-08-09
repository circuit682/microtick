import {
  AccessMethod,
  ConsumptionPolicy,
  Money,
  Plan,
  PlanType,
  ServiceLevel,
  Validity,
} from "@domain";

import type { IdentifierGenerator } from "@shared/identity/IdentifierGenerator.js";

import type { PlanRepository } from "./PlanRepository.js";

export interface CreatePlanCommand {
  name: string;
  price: number;

  validity: Validity;
  consumptionPolicy: ConsumptionPolicy;
  serviceLevel: ServiceLevel;
  accessMethod: AccessMethod;

  //
  // Temporary compatibility until the
  // persistence layer no longer requires it.
  //
  type: PlanType;
  allowanceMinutes: number;
}

export class CreatePlan {
  constructor(
    private readonly identifierGenerator: IdentifierGenerator,
    private readonly planRepository: PlanRepository,
  ) {}

  async execute(command: CreatePlanCommand): Promise<Plan> {
    const plan = Plan.create({
      id: this.identifierGenerator.generate(),

      name: command.name,

      price: Money.fromMinorUnits(command.price),

      validity: command.validity,

      consumptionPolicy: command.consumptionPolicy,

      serviceLevel: command.serviceLevel,

      accessMethod: command.accessMethod,

      //
      // Temporary compatibility.
      //
      type: command.type,
      allowanceMinutes: command.allowanceMinutes,
    });

    await this.planRepository.save(plan);

    return plan;
  }
}
