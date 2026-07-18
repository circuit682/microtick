import { Money } from "../money/index.js";
import { PaymentStatus } from "./PaymentStatus.js";

export interface PaymentIntentProps {
  amount: Money;
  phoneNumber: string;
}

export class PaymentIntent {
  private readonly props: PaymentIntentProps;

  constructor(props: PaymentIntentProps) {
    this.props = Object.freeze({ ...props });
  }

  get amount(): Money {
    return this.props.amount;
  }

  get phoneNumber(): string {
    return this.props.phoneNumber;
  }

  get status(): PaymentStatus {
    return PaymentStatus.CREATED;
  }
}