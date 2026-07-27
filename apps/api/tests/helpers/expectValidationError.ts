import { expect } from "vitest";

import { ErrorCode, ValidationError } from "@shared";

export function expectValidationError(
  action: () => unknown,
  code: ErrorCode,
): void {
  try {
    action();

    expect.fail("Expected ValidationError to be thrown.");
  } catch (error) {
    expect(error).toBeInstanceOf(ValidationError);

    const validationError = error as ValidationError;

    expect(validationError.code).toBe(code);
  }
}