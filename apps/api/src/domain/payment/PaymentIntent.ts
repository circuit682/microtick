import { Money } from "../money/index.js";

export interface PaymentIntentProps {
  amount: Money;
  phoneNumber: string;
}

export class PaymentIntent {
  constructor(
    private readonly props: PaymentIntentProps,
  ) {}

  get amount(): Money {
    return this.props.amount;
  }

  get phoneNumber(): string {
    return this.props.phoneNumber;
  }
}