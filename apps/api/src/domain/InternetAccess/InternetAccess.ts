import { ValidationError, ErrorCode } from "@shared";

export interface InternetAccessProps {
  id: string;
  purchaseId: string;
  customerId: string;
  grantedAt: Date;
  expiresAt: Date;
}

export class InternetAccess {
  private constructor(private readonly props: InternetAccessProps) {}

  static create(props: InternetAccessProps): InternetAccess {
    if (props.expiresAt <= props.grantedAt) {
      throw new ValidationError(
        ErrorCode.ACCESS_INVALID_EXPIRATION,
        "Internet access cannot expire before it is granted.",
      );
    }

    return new InternetAccess(props);
  }

  get id(): string {
    return this.props.id;
  }

  get purchaseId(): string {
    return this.props.purchaseId;
  }

  get customerId(): string {
    return this.props.customerId;
  }

  get grantedAt(): Date {
    return this.props.grantedAt;
  }

  get expiresAt(): Date {
    return this.props.expiresAt;
  }
}
