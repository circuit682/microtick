import { DomainError } from "../../shared/errors/DomainError.js";
import { ErrorCode } from "../../shared/errors/ErrorCode.js";

export class PaymentDomainError extends DomainError {
  constructor(
    code: ErrorCode,
    message: string,
    metadata: Record<string, unknown> = {},
  ) {
    super(code, message, metadata);
  }
}