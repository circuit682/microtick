import { ErrorCode, ValidationError } from "@shared";

import {
  AccessMethod,
  ConsumptionPolicy,
  Money,
  ServiceLevel,
  Validity,
} from "@domain";

import { PlanType } from "./PlanType.js";

export interface CreatePlanProps {
  id: string;
  name: string;
  price: Money;

  validity: Validity;
  consumptionPolicy: ConsumptionPolicy;
  serviceLevel: ServiceLevel;
  accessMethod: AccessMethod;

  // Temporary compatibility.
  type: PlanType;
  allowanceMinutes: number;
}

export interface PlanProps {
  id: string;
  name: string;
  price: Money;

  validity: Validity;
  consumptionPolicy: ConsumptionPolicy;
  serviceLevel: ServiceLevel;
  accessMethod: AccessMethod;

  // Temporary compatibility.
  type: PlanType;
  allowanceMinutes: number;

  active: boolean;
}

export class Plan {
  private readonly props: PlanProps;

  private constructor(props: PlanProps) {
    this.validateInvariants(props);

    this.props = Object.freeze({
      ...props,
    });
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
   * Used only by repositories.
   */
  static reconstitute(props: PlanProps): Plan {
    return new Plan(props);
  }

  /**
   * Activates an inactive plan.
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
   * Aggregate invariants.
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

    //
    // Temporary compatibility until Validity
    // fully replaces allowanceMinutes.
    //
    if (props.allowanceMinutes <= 0) {
      throw new ValidationError(
        ErrorCode.PLAN_INVALID_ALLOWANCE,
        "Plan allowance must be greater than zero.",
        {
          attemptedAllowanceMinutes: props.allowanceMinutes,
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

  get validity(): Validity {
    return this.props.validity;
  }

  get consumptionPolicy(): ConsumptionPolicy {
    return this.props.consumptionPolicy;
  }

  get serviceLevel(): ServiceLevel {
    return this.props.serviceLevel;
  }

  get accessMethod(): AccessMethod {
    return this.props.accessMethod;
  }

  /**
   * Temporary compatibility.
   */
  get type(): PlanType {
    return this.props.type;
  }

  /**
   * Temporary compatibility.
   */
  get allowanceMinutes(): number {
    return this.props.allowanceMinutes;
  }

  get active(): boolean {
    return this.props.active;
  }
}
