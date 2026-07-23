import { ValidationError, ErrorCode } from "@shared";

export interface InternetAccessProps {
  customerId: string;
  planId: string;
  grantedAt: Date;
  expiresAt: Date;
}

export class InternetAccess {
  private constructor(
    private readonly props: InternetAccessProps,
  ) {}

  static create(props: InternetAccessProps): InternetAccess {
    if (props.expiresAt <= props.grantedAt) {
      throw new ValidationError(
        ErrorCode.ACCESS_INVALID_EXPIRATION,
        "Internet access cannot expire before it is granted.",
      );
    }

    return new InternetAccess(props);
  }

  get customerId(): string {
    return this.props.customerId;
  }

  get planId(): string {
    return this.props.planId;
  }

  get grantedAt(): Date {
    return this.props.grantedAt;
  }

  get expiresAt(): Date {
    return this.props.expiresAt;
  }
}