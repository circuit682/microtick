import { Money } from "../money/index.js";
import { ErrorCode } from "../../shared/errors/ErrorCode.js";

import { PaymentDomainError } from "./PaymentDomainError.js";
import { PaymentStatus } from "./PaymentStatus.js";

export interface PaymentIntentProps {
  id: string;
  planId: string;
  amount: Money;
  phoneNumber: string;
  reference: string;
  status: PaymentStatus;
}

export interface CreatePaymentIntentProps {
  id: string;
  planId: string;
  amount: Money;
  phoneNumber: string;
  reference: string;
}

export class PaymentIntent {
  private constructor(private readonly props: PaymentIntentProps) {}

  static create(props: CreatePaymentIntentProps): PaymentIntent {
    return new PaymentIntent({
      ...props,
      status: PaymentStatus.CREATED,
    });
  }

  static reconstitute(props: PaymentIntentProps): PaymentIntent {
    return new PaymentIntent(props);
  }

  get id(): string {
    return this.props.id;
  }

  get planId(): string {
    return this.props.planId;
  }

  get amount(): Money {
    return this.props.amount;
  }

  get phoneNumber(): string {
    return this.props.phoneNumber;
  }

  get reference(): string {
    return this.props.reference;
  }

  get status(): PaymentStatus {
    return this.props.status;
  }

  markPending(): void {
    if (this.props.status !== PaymentStatus.CREATED) {
      throw new PaymentDomainError(
        ErrorCode.PAYMENT_NOT_CREATED,
        "Only newly created payments can become pending.",
      );
    }

    this.props.status = PaymentStatus.PENDING;
  }

  confirm(): void {
    if (this.props.status === PaymentStatus.COMPLETED) {
      throw new PaymentDomainError(
        ErrorCode.PAYMENT_ALREADY_COMPLETED,
        "Payment has already been completed.",
      );
    }

    if (this.props.status !== PaymentStatus.PENDING) {
      throw new PaymentDomainError(
        ErrorCode.PAYMENT_NOT_PENDING,
        "Only pending payments can be confirmed.",
      );
    }

    this.props.status = PaymentStatus.COMPLETED;
  }

  fail(): void {
    if (this.props.status !== PaymentStatus.PENDING) {
      throw new PaymentDomainError(
        ErrorCode.PAYMENT_NOT_PENDING,
        "Only pending payments can fail.",
      );
    }

    this.props.status = PaymentStatus.FAILED;
  }
}
