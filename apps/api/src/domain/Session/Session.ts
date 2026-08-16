import { ErrorCode, ValidationError } from "@shared";

import { SessionStatus } from "./SessionStatus.js";

export interface SessionProps {
  id: string;
  customerId: string;
  createdAt: Date;
  expiresAt: Date;
  status: SessionStatus;
}

export class Session {
  private constructor(private readonly props: SessionProps) {
    this.validateInvariants(props);
  }

  static create(props: SessionProps): Session {
    return new Session(props);
  }

  static reconstitute(props: SessionProps): Session {
    return new Session(props);
  }

  private validateInvariants(props: SessionProps): void {
    if (props.id.trim().length === 0) {
      throw new ValidationError(
        ErrorCode.SESSION_INVALID_ID,
        "Session id cannot be empty.",
      );
    }

    if (props.customerId.trim().length === 0) {
      throw new ValidationError(
        ErrorCode.SESSION_INVALID_CUSTOMER,
        "Session customer id cannot be empty.",
      );
    }

    if (props.expiresAt <= props.createdAt) {
      throw new ValidationError(
        ErrorCode.SESSION_INVALID_EXPIRATION,
        "Session must expire after it is created.",
      );
    }
  }

  activate(): Session {
    if (this.status === SessionStatus.ACTIVE) {
      return this;
    }

    return Session.reconstitute({
      ...this.props,
      status: SessionStatus.ACTIVE,
    });
  }

  expire(): Session {
    if (this.status === SessionStatus.EXPIRED) {
      return this;
    }

    return Session.reconstitute({
      ...this.props,
      status: SessionStatus.EXPIRED,
    });
  }

  revoke(): Session {
    if (this.status === SessionStatus.REVOKED) {
      return this;
    }

    return Session.reconstitute({
      ...this.props,
      status: SessionStatus.REVOKED,
    });
  }

  get id(): string {
    return this.props.id;
  }

  get customerId(): string {
    return this.props.customerId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get expiresAt(): Date {
    return this.props.expiresAt;
  }

  get status(): SessionStatus {
    return this.props.status;
  }
}
