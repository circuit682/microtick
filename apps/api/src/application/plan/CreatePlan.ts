import {
  AccessMethod,
  Money,
  Plan,
  PlanType,
  ServiceLevel,
  Validity,
  ValidityUnit,
} from "@domain";

import type { IdentifierGenerator } from "@shared/identity/IdentifierGenerator.js";

import type { PlanRepository } from "./PlanRepository.js";

export interface CreatePlanCommand {
  name: string;
  price: number;
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

      validity: Validity.create({
        amount: command.type === PlanType.TIME ? 1 : command.allowanceMinutes,
        unit:
          command.type === PlanType.TIME
            ? ValidityUnit.DAYS
            : ValidityUnit.MINUTES,
      }),

      serviceLevel: ServiceLevel.create({
        name: "Residential",
      }),

      accessMethod:
        command.type === PlanType.TIME
          ? AccessMethod.WALL_CLOCK
          : AccessMethod.SESSION,

      // Temporary compatibility.
      type: command.type,
      allowanceMinutes: command.allowanceMinutes,
    });

    await this.planRepository.save(plan);

    return plan;
  }
}
