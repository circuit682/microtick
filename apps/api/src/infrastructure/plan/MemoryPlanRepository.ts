import { PlanRepository } from "@application/plan/PlanRepository.js";
import { Plan } from "@domain";

export class MemoryPlanRepository implements PlanRepository {
  private readonly plans = new Map<string, Plan>();

  async save(plan: Plan): Promise<void> {
    this.plans.set(plan.id, plan);
  }
}