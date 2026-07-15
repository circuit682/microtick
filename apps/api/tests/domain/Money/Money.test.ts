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
});