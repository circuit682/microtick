import { Plan } from "@domain";

export interface PlanRepository {
  save(plan: Plan): Promise<void>;

  findById(id: string): Promise<Plan | null>;
}