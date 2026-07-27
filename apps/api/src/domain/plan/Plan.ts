import { ErrorCode, ValidationError } from "@shared";

import { Money } from "../money/index.js";

export interface CreatePlanProps {
  id: string;
  name: string;
  price: Money;
  duration: number;
}

export interface PlanProps {
  id: string;
  name: string;
  price: Money;
  duration: number;
  active: boolean;
}

export class Plan {
  private readonly props: PlanProps;

  private constructor(props: PlanProps) {
    this.validateInvariants(props);
    this.props = Object.freeze({ ...props });
  }

  /**
   * Creates a brand-new business plan.
   *
   * New plans are active by default.
   */
  static create(props: CreatePlanProps): Plan {
    return new Plan({
      ...props,
      active: true,
    });
  }

  /**
   * Reconstitutes an existing aggregate from persistence.
   *
   * This should only be used by repositories and mappers when
   * rebuilding an existing Plan from storage.
   */
  static reconstitute(props: PlanProps): Plan {
    return new Plan(props);
  }

  /**
   * Activates an inactive plan.
   *
   * Since the aggregate is immutable, a new instance is returned.
   * If the plan is already active, the current instance is returned.
   */
  activate(): Plan {
    if (this.active) {
      return this;
    }

    return Plan.reconstitute({
      ...this.props,
      active: true,
    });
  }

  /**
   * Deactivates an active plan.
   *
   * Since the aggregate is immutable, a new instance is returned.
   * If the plan is already inactive, the current instance is returned.
   */
  deactivate(): Plan {
    if (!this.active) {
      return this;
    }

    return Plan.reconstitute({
      ...this.props,
      active: false,
    });
  }

  /**
   * Ensures the aggregate always remains in a valid state.
   */
  private validateInvariants(props: PlanProps): void {
    if (props.price.isLessThanOrEqualTo(Money.fromMinorUnits(0))) {
      throw new ValidationError(
        ErrorCode.PLAN_INVALID_PRICE,
        "Plan price must be greater than zero.",
        {
          attemptedPrice: props.price,
        },
      );
    }

    if (props.name.trim().length === 0) {
      throw new ValidationError(
        ErrorCode.PLAN_INVALID_NAME,
        "Plan name cannot be empty.",
        {
          attemptedName: props.name,
        },
      );
    }

    if (props.duration <= 0) {
      throw new ValidationError(
        ErrorCode.PLAN_INVALID_DURATION,
        "Plan duration must be greater than zero.",
        {
          attemptedDuration: props.duration,
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
