import { ErrorCode, ValidationError } from "@shared";

export interface CustomerProps {
  id: string;
  phoneNumber: string;
}

export class Customer {
  private constructor(private readonly props: CustomerProps) {}

  static create(props: CustomerProps): Customer {
    const id = props.id.trim();
    const phoneNumber = props.phoneNumber.trim();

    if (id.length === 0) {
      throw new ValidationError(
        ErrorCode.CUSTOMER_INVALID_ID,
        "Customer id cannot be empty.",
      );
    }

    if (phoneNumber.length === 0) {
      throw new ValidationError(
        ErrorCode.CUSTOMER_INVALID_PHONE_NUMBER,
        "Customer phone number cannot be empty.",
      );
    }

    return new Customer({
      id,
      phoneNumber,
    });
  }

  static reconstitute(props: CustomerProps): Customer {
    return new Customer(props);
  }

  get id(): string {
    return this.props.id;
  }

  get phoneNumber(): string {
    return this.props.phoneNumber;
  }
}
