import { PlanRepository } from "@application/plan/PlanRepository.js";
import { Plan } from "@domain";

import { prisma } from "@infrastructure/database/prisma.js";

import { PlanMapper } from "./PlanMapper.js";

export class PrismaPlanRepository implements PlanRepository {
  async save(plan: Plan): Promise<void> {
    const data = PlanMapper.toPersistence(plan);

    await prisma.plan.upsert({
      where: {
        id: data.id,
      },
      create: data,
      update: data,
    });
  }

  async findById(id: string): Promise<Plan | null> {
    const plan = await prisma.plan.findUnique({
      where: {
        id,
      },
    });

    if (!plan) {
      return null;
    }

    return PlanMapper.toDomain(plan);
  }
}
