import { Money, Plan, PlanType } from "@domain";

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
      type: command.type,
      allowanceMinutes: command.allowanceMinutes,
    });

    await this.planRepository.save(plan);

    return plan;
  }
}