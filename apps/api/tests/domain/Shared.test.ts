import { describe, expect, it } from "vitest";
import { ValidationError, ErrorCode } from "@shared";

describe("Shared Module", () => {
  it("exports ValidationError", () => {
    const error = new ValidationError(
      ErrorCode.PLAN_INVALID_PRICE,
      "Price must be greater than zero."
    );

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ValidationError);
  });
});