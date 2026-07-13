import { ErrorCode } from "./ErrorCode.js";

export class DomainError extends Error {
  public readonly code: ErrorCode;
  public readonly metadata: Readonly<Record<string, unknown>>;

  constructor(
    code: ErrorCode,
    message: string,
    metadata: Record<string, unknown> = {},
  ) {
    super(message);

    this.name = this.constructor.name;
    this.code = code;
    this.metadata = Object.freeze({ ...metadata });

    Object.setPrototypeOf(this, new.target.prototype);
  }
}