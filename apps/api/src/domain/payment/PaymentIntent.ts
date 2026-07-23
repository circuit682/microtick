import { Money } from "../money/index.js";
import { ErrorCode } from "../../shared/errors/ErrorCode.js";

import { PaymentDomainError } from "./PaymentDomainError.js";
import { PaymentStatus } from "./PaymentStatus.js";

export interface PaymentIntentProps {
  amount: Money;
  phoneNumber: string;
  reference: string;
}

export class PaymentIntent {
  private readonly props: PaymentIntentProps;

  private _status = PaymentStatus.CREATED;

  constructor(props: PaymentIntentProps) {
    this.props = Object.freeze({ ...props });
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
    return this._status;
  }

  markPending(): void {
    if (this._status !== PaymentStatus.CREATED) {
      throw new PaymentDomainError(
        ErrorCode.PAYMENT_NOT_CREATED,
        "Only newly created payments can become pending.",
      );
    }

    this._status = PaymentStatus.PENDING;
  }

  confirm(): void {
    if (this._status === PaymentStatus.COMPLETED) {
      throw new PaymentDomainError(
        ErrorCode.PAYMENT_ALREADY_COMPLETED,
        "Payment has already been completed.",
      );
    }

    if (this._status !== PaymentStatus.PENDING) {
      throw new PaymentDomainError(
        ErrorCode.PAYMENT_NOT_PENDING,
        "Only pending payments can be confirmed.",
      );
    }

    this._status = PaymentStatus.COMPLETED;
  }

  fail(): void {
    if (this._status !== PaymentStatus.PENDING) {
      throw new PaymentDomainError(
        ErrorCode.PAYMENT_NOT_PENDING,
        "Only pending payments can fail.",
      );
    }

    this._status = PaymentStatus.FAILED;
  }
}