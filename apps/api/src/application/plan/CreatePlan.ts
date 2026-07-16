import { Money, Plan } from "@domain";

export interface CreatePlanCommand {
  id: string;
  name: string;
  price: number;
  duration: number;
  active: boolean;
}

export class CreatePlan {
  execute(command: CreatePlanCommand): Plan {
    return new Plan({
      id: command.id,
      name: command.name,
      price: Money.fromKES(command.price),
      duration: command.duration,
      active: command.active,
    });
  }
}