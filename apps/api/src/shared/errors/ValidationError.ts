import { DomainError } from "./DomainError.js";
import { ErrorCode } from "./ErrorCode.js";

export class ValidationError extends DomainError {
  constructor(
    code: ErrorCode,
    message: string,
    metadata: Record<string, unknown> = {},
  ) {
    super(code, message, metadata);
  }
}