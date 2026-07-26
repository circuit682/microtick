import { ValidationError, ErrorCode } from "@shared";

export class Money {
  private constructor(
    private readonly _minorUnits: number,
  ) {}

  static fromMinorUnits(
    minorUnits: number,
  ): Money {
    if (!Number.isFinite(minorUnits)) {
      throw new ValidationError(
        ErrorCode.MONEY_INVALID_AMOUNT,
        "Money minor units must be a finite number.",
        {
          attemptedMinorUnits: minorUnits,
        },
      );
    }

    if (!Number.isInteger(minorUnits)) {
      throw new ValidationError(
        ErrorCode.MONEY_INVALID_AMOUNT,
        "Money minor units must be a whole number.",
        {
          attemptedMinorUnits: minorUnits,
        },
      );
    }

    if (minorUnits < 0) {
      throw new ValidationError(
        ErrorCode.MONEY_NEGATIVE_AMOUNT,
        "Money minor units cannot be negative.",
        {
          attemptedMinorUnits: minorUnits,
        },
      );
    }

    return new Money(minorUnits);
  }

  get minorUnits(): number {
    return this._minorUnits;
  }

  equals(other: Money): boolean {
    return this.minorUnits === other.minorUnits;
  }

  add(other: Money): Money {
    return Money.fromMinorUnits(
      this.minorUnits + other.minorUnits,
    );
  }

  subtract(other: Money): Money {
    return Money.fromMinorUnits(
      this.minorUnits - other.minorUnits,
    );
  }

  isZero(): boolean {
    return this.minorUnits === 0;
  }

  isGreaterThan(other: Money): boolean {
    return this.minorUnits > other.minorUnits;
  }

  isLessThan(other: Money): boolean {
    return this.minorUnits < other.minorUnits;
  }

  isGreaterThanOrEqualTo(
    other: Money,
  ): boolean {
    return (
      this.isGreaterThan(other) ||
      this.equals(other)
    );
  }

  isLessThanOrEqualTo(
    other: Money,
  ): boolean {
    return (
      this.isLessThan(other) ||
      this.equals(other)
    );
  }
}