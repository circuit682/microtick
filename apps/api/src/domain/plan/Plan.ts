import { ValidationError, ErrorCode } from "@shared";
import { Money } from "../money/index.js";

export interface PlanProps {
  id: string;
  name: string;
  price: Money;
  duration: number;
  active: boolean;
}

export class Plan {
  private readonly props: PlanProps;

  constructor(props: PlanProps) {
    this.validate(props);
    this.props = Object.freeze({ ...props });
  }

  private validate(props: PlanProps): void {
    if (props.price.isLessThanOrEqualTo(Money.fromKES(0))) {
      throw new ValidationError(
        ErrorCode.PLAN_INVALID_PRICE,
        "Plan price must be greater than zero.",
        {
          attemptedPrice: props.price,
        },
      );
    }
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get price(): Money {
    return this.props.price;
  }

  get duration(): number {
    return this.props.duration;
  }

  get active(): boolean {
    return this.props.active;
  }
}