import { ValidationError, ErrorCode } from "@shared";

export class Money {
  private constructor() {}

  static fromKES(amount: number): Money {
    if (!Number.isFinite(amount)) {
      throw new ValidationError(
        ErrorCode.MONEY_INVALID_AMOUNT,
        "Money amount must be a finite number.",
        {
          attemptedAmount: amount,
        },
      );
    }

    if (amount < 0) {
      throw new ValidationError(
        ErrorCode.MONEY_NEGATIVE_AMOUNT,
        "Money amount cannot be negative.",
        {
          attemptedAmount: amount,
        },
      );
    }

    return new Money();
  }
}