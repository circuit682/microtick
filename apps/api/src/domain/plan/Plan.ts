import { ValidationError, ErrorCode } from "@shared";

export interface PlanProps {
  id: string;
  name: string;
  price: number;
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
    if (props.price <= 0) {
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

  get price(): number {
    return this.props.price;
  }

  get duration(): number {
    return this.props.duration;
  }

  get active(): boolean {
    return this.props.active;
  }
}