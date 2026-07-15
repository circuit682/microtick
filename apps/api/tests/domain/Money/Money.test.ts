import { describe, expect, it } from "vitest";

import { Money } from "@domain";

describe("Money", () => {
  it("should create a valid Money instance from Kenyan Shilling minor units", () => {
    // Given
    const amount = 500;

    // When
    const money = Money.fromKES(amount);

    // Then
    expect(money).toBeDefined();
  });
  it("should reject negative monetary values", () => {
  // Given
  const amount = -1;

  // When / Then
  expect(() => Money.fromKES(amount)).toThrow();
});
it("should create a zero-value Money instance", () => {
  // Given
  const amount = 0;

  // When
  const money = Money.fromKES(amount);

  // Then
  expect(money).toBeDefined();
});
it("should reject NaN monetary values", () => {
  // Given
  const amount = Number.NaN;

  // When / Then
  expect(() => Money.fromKES(amount)).toThrow();
});
});