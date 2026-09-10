import { ErrorCode, ValidationError } from "@shared";

import { InternetAccessStatus } from "./InternetAccessStatus.js";

export interface InternetAccessProps {
  id: string;
  purchaseId: string;
  customerId: string;
  grantedAt: Date;
  expiresAt: Date;
  status: InternetAccessStatus;
  consumedMinutes?: number;
  usageSessionId?: string;
  usageRecordedThrough?: Date;
}

export class InternetAccess {
  private readonly props: InternetAccessProps;

  private constructor(props: InternetAccessProps) {
    this.validateInvariants(props);

    this.props = Object.freeze({
      ...props,
      consumedMinutes: props.consumedMinutes ?? 0,
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

  recordUsage(connectedAt: Date, disconnectedAt: Date): InternetAccess {
    if (disconnectedAt < connectedAt) {
      throw new ValidationError(
        ErrorCode.ACCESS_INVALID_USAGE,
        "Internet access usage cannot end before it starts.",
      );
    }

    const usageMinutes =
      (disconnectedAt.getTime() - connectedAt.getTime()) / 60000;

    return InternetAccess.reconstitute({
      ...this.props,
      consumedMinutes: this.consumedMinutes + usageMinutes,
    });
  }

  recordSessionUsage(
    sessionId: string,
    connectedAt: Date,
    observedAt: Date,
  ): InternetAccess {
    if (observedAt < connectedAt) {
      throw new ValidationError(
        ErrorCode.ACCESS_INVALID_USAGE,
        "Internet access usage cannot end before it starts.",
      );
    }

    const isSameSession = this.props.usageSessionId === sessionId;
    const previousObservation = isSameSession
      ? this.props.usageRecordedThrough
      : undefined;
    const usageStart = previousObservation ?? connectedAt;

    if (
      isSameSession &&
      previousObservation !== undefined &&
      observedAt <= previousObservation
    ) {
      return this;
    }

    const usageMinutes = (observedAt.getTime() - usageStart.getTime()) / 60000;

    return InternetAccess.reconstitute({
      ...this.props,
      consumedMinutes: this.consumedMinutes + usageMinutes,
      usageSessionId: sessionId,
      usageRecordedThrough: observedAt,
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

  get consumedMinutes(): number {
    return this.props.consumedMinutes ?? 0;
  }

  get usageSessionId(): string | undefined {
    return this.props.usageSessionId;
  }

  get usageRecordedThrough(): Date | undefined {
    return this.props.usageRecordedThrough;
  }
}
