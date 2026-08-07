import { ValidationError, ErrorCode } from "@shared";

import { ValidityUnit } from "./ValidityUnit.js";

export interface ValidityProps {
  amount: number;
  unit: ValidityUnit;
}

export class Validity {
  private constructor(private readonly props: ValidityProps) {}

  static create(props: ValidityProps): Validity {
    if (!Number.isInteger(props.amount) || props.amount <= 0) {
      throw new ValidationError(
        ErrorCode.PLAN_INVALID_DURATION,
        "Plan validity must be greater than zero.",
      );
    }

    return new Validity(props);
  }

  get amount(): number {
    return this.props.amount;
  }

  get unit(): ValidityUnit {
    return this.props.unit;
  }

  equals(other: Validity): boolean {
    return this.amount === other.amount && this.unit === other.unit;
  }

  toMinutes(): number {
    switch (this.unit) {
      case ValidityUnit.MINUTES:
        return this.amount;

      case ValidityUnit.HOURS:
        return this.amount * 60;

      case ValidityUnit.DAYS:
        return this.amount * 24 * 60;
    }
  }
}
