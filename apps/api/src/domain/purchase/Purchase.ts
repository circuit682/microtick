import { ErrorCode, ValidationError } from "@shared";

import { Money } from "../money/index.js";
import { PlanType } from "../plan/PlanType.js";

export interface CreatePurchaseProps {
  id: string;
  customerId: string;
  planId: string;
  planName: string;
  planPrice: Money;
  planType: PlanType;
  allowanceMinutes: number;
  purchasedAt: Date;
}

export interface PurchaseProps {
  id: string;
  customerId: string;
  planId: string;
  planName: string;
  planPrice: Money;
  planType: PlanType;
  allowanceMinutes: number;
  purchasedAt: Date;
}

export class Purchase {
  private readonly props: PurchaseProps;

  private constructor(props: PurchaseProps) {
    this.validateInvariants(props);
    this.props = Object.freeze({
      ...props,
    });
  }

  /**
   * Creates a brand-new purchase.
   */
  static create(
    props: CreatePurchaseProps,
  ): Purchase {
    return new Purchase(props);
  }

  /**
   * Reconstitutes an existing purchase from persistence.
   */
  static reconstitute(
    props: PurchaseProps,
  ): Purchase {
    return new Purchase(props);
  }

  /**
   * Ensures the aggregate always remains in a valid state.
   */
  private validateInvariants(
    props: PurchaseProps,
  ): void {
    if (props.customerId.trim().length === 0) {
      throw new ValidationError(
        ErrorCode.PURCHASE_INVALID_CUSTOMER,
        "Customer ID cannot be empty.",
      );
    }

    if (props.planId.trim().length === 0) {
      throw new ValidationError(
        ErrorCode.PURCHASE_INVALID_PLAN,
        "Plan ID cannot be empty.",
      );
    }

    if (props.planName.trim().length === 0) {
      throw new ValidationError(
        ErrorCode.PURCHASE_INVALID_PLAN,
        "Plan name cannot be empty.",
      );
    }

    if (
      props.planPrice.isLessThanOrEqualTo(
        Money.fromMinorUnits(0),
      )
    ) {
      throw new ValidationError(
        ErrorCode.PURCHASE_INVALID_PRICE,
        "Purchase price must be greater than zero.",
      );
    }

    if (props.allowanceMinutes <= 0) {
      throw new ValidationError(
        ErrorCode.PURCHASE_INVALID_ALLOWANCE,
        "Purchase allowance must be greater than zero.",
      );
    }
  }

  get id(): string {
    return this.props.id;
  }

  get customerId(): string {
    return this.props.customerId;
  }

  get planId(): string {
    return this.props.planId;
  }

  get planName(): string {
    return this.props.planName;
  }

  get planPrice(): Money {
    return this.props.planPrice;
  }

  get planType(): PlanType {
    return this.props.planType;
  }

  get allowanceMinutes(): number {
    return this.props.allowanceMinutes;
  }

  get purchasedAt(): Date {
    return this.props.purchasedAt;
  }
}