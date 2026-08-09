import { ErrorCode, ValidationError } from "@shared";

import { InternetAccessStatus } from "./InternetAccessStatus.js";

export interface InternetAccessProps {
  id: string;
  purchaseId: string;
  customerId: string;
  grantedAt: Date;
  expiresAt: Date;
  status: InternetAccessStatus;
}

export class InternetAccess {
  private readonly props: InternetAccessProps;

  private constructor(props: InternetAccessProps) {
    this.validateInvariants(props);

    this.props = Object.freeze({
      ...props,
    });
  }

  static create(props: InternetAccessProps): InternetAccess {
    return new InternetAccess(props);
  }

  static reconstitute(props: InternetAccessProps): InternetAccess {
    return new InternetAccess(props);
  }

  private validateInvariants(props: InternetAccessProps): void {
    if (props.expiresAt <= props.grantedAt) {
      throw new ValidationError(
        ErrorCode.ACCESS_INVALID_EXPIRATION,
        "Internet access cannot expire before it is granted.",
      );
    }
  }

  grant(): InternetAccess {
    if (this.status === InternetAccessStatus.GRANTED) {
      return this;
    }

    return InternetAccess.reconstitute({
      ...this.props,
      status: InternetAccessStatus.GRANTED,
    });
  }

  beginProvisioning(): InternetAccess {
    if (this.status === InternetAccessStatus.PROVISIONING) {
      return this;
    }

    return InternetAccess.reconstitute({
      ...this.props,
      status: InternetAccessStatus.PROVISIONING,
    });
  }

  activate(): InternetAccess {
    if (this.status === InternetAccessStatus.ACTIVE) {
      return this;
    }

    return InternetAccess.reconstitute({
      ...this.props,
      status: InternetAccessStatus.ACTIVE,
    });
  }

  expire(): InternetAccess {
    if (this.status === InternetAccessStatus.EXPIRED) {
      return this;
    }

    return InternetAccess.reconstitute({
      ...this.props,
      status: InternetAccessStatus.EXPIRED,
    });
  }

  revoke(): InternetAccess {
    if (this.status === InternetAccessStatus.REVOKED) {
      return this;
    }

    return InternetAccess.reconstitute({
      ...this.props,
      status: InternetAccessStatus.REVOKED,
    });
  }

  fail(): InternetAccess {
    if (this.status === InternetAccessStatus.FAILED) {
      return this;
    }

    return InternetAccess.reconstitute({
      ...this.props,
      status: InternetAccessStatus.FAILED,
    });
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

  get status(): InternetAccessStatus {
    return this.props.status;
  }
}
