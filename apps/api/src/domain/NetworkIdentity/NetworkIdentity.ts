import { ErrorCode, ValidationError } from "@shared";

import { AuthenticationMethod } from "./AuthenticationMethod.js";

export interface NetworkIdentityProps {
  id: string;
  customerId: string;
  username: string;
  credential: string;
  authenticationMethod: AuthenticationMethod;
}

export class NetworkIdentity {
  private constructor(private readonly props: NetworkIdentityProps) {}

  static create(props: NetworkIdentityProps): NetworkIdentity {
    if (props.id.trim().length === 0) {
      throw new ValidationError(
        ErrorCode.NETWORK_IDENTITY_INVALID_ID,
        "Network identity id cannot be empty.",
      );
    }

    if (props.customerId.trim().length === 0) {
      throw new ValidationError(
        ErrorCode.NETWORK_IDENTITY_INVALID_CUSTOMER,
        "Network identity customer id cannot be empty.",
      );
    }

    if (props.username.trim().length === 0) {
      throw new ValidationError(
        ErrorCode.NETWORK_IDENTITY_INVALID_USERNAME,
        "Network identity username cannot be empty.",
      );
    }

    if (props.credential.length === 0) {
      throw new ValidationError(
        ErrorCode.NETWORK_IDENTITY_INVALID_CREDENTIAL,
        "Network identity credential cannot be empty.",
      );
    }

    return new NetworkIdentity({
      id: props.id.trim(),
      customerId: props.customerId.trim(),
      username: props.username.trim(),
      credential: props.credential,
      authenticationMethod: props.authenticationMethod,
    });
  }

  static reconstitute(props: NetworkIdentityProps): NetworkIdentity {
    return new NetworkIdentity(props);
  }

  get id(): string {
    return this.props.id;
  }

  get customerId(): string {
    return this.props.customerId;
  }

  get username(): string {
    return this.props.username;
  }

  get credential(): string {
    return this.props.credential;
  }

  get authenticationMethod(): AuthenticationMethod {
    return this.props.authenticationMethod;
  }
}
