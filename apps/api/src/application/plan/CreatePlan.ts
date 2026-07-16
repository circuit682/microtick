import { Money, Plan } from "@domain";

import type { PlanRepository } from "./PlanRepository.js";

export interface CreatePlanCommand {
  id: string;
  name: string;
  price: number;
  duration: number;
  active: boolean;
}

export class CreatePlan {
  constructor(
    private readonly planRepository: PlanRepository,
  ) {}

  async execute(command: CreatePlanCommand): Promise<Plan> {
    const plan = new Plan({
      id: command.id,
      name: command.name,
      price: Money.fromKES(command.price),
      duration: command.duration,
      active: command.active,
    });

    await this.planRepository.save(plan);

    return plan;
  }
}