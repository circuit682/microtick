import type { Customer } from "@domain";

import type { CustomerRepository } from "@application/ports/CustomerRepository.js";
import type { OtpVerificationService } from "@application/ports/OtpVerificationService.js";
import type { AccessTokenService } from "@application/ports/AccessTokenService.js";

import {
  CreateSession,
  type CreateSessionCommand,
} from "@application/session/CreateSession.js";

export interface AuthenticateCustomerCommand {
  phoneNumber: string;
  verificationCode: string;
  sessionExpiresAt: Date;
}

export interface AuthenticateCustomerResult {
  customer: Customer;
  sessionId: string;
  accessToken: string;
}

export interface AuthenticateCustomerUseCase {
  execute(
    command: AuthenticateCustomerCommand,
  ): Promise<AuthenticateCustomerResult>;
}

export class AuthenticateCustomer implements AuthenticateCustomerUseCase {
  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly otpVerificationService: OtpVerificationService,
    private readonly createSession: CreateSession,
    private readonly accessTokenService: AccessTokenService,
  ) {}

  async execute(
    command: AuthenticateCustomerCommand,
  ): Promise<AuthenticateCustomerResult> {
    const verified = await this.otpVerificationService.verify(
      command.phoneNumber,
      command.verificationCode,
    );

    if (!verified) {
      throw new Error("Invalid verification code.");
    }

    const customer = await this.customerRepository.findByPhoneNumber(
      command.phoneNumber,
    );

    if (customer === null) {
      throw new Error("Customer not found.");
    }

    const sessionCommand: CreateSessionCommand = {
      customerId: customer.id,
      expiresAt: command.sessionExpiresAt,
    };

    const session = await this.createSession.execute(sessionCommand);

    const accessToken = await this.accessTokenService.issue({
      customerId: customer.id,
      sessionId: session.id,
      expiresAt: session.expiresAt,
    });

    return {
      customer,
      sessionId: session.id,
      accessToken,
    };
  }
}
