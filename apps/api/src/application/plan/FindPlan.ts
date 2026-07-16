import { Plan } from "@domain";

import type { PlanRepository } from "./PlanRepository.js";

export class FindPlan {
  constructor(
    private readonly planRepository: PlanRepository,
  ) {}

  async execute(id: string): Promise<Plan | null> {
    return this.planRepository.findById(id);
  }
}