import { describe, expect, it } from "vitest";

import { Money } from "@domain";

describe("Money", () => {
  describe("Construction", () => {
    it("should create a valid Money instance from Kenyan Shilling minor units", () => {
      // Given
      const amount = 500;

      // When
      const money = Money.fromMinorUnits(amount);

      // Then
      expect(money).toBeDefined();
    });

    it("should create a zero-value Money instance", () => {
      // Given
      const amount = 0;

      // When
      const money = Money.fromMinorUnits(amount);

      // Then
      expect(money).toBeDefined();
    });

    it("should reject negative monetary values", () => {
      // Given
      const amount = -1;

      // When / Then
      expect(() => Money.fromMinorUnits(amount)).toThrow();
    });

    it("should reject NaN monetary values", () => {
      // Given
      const amount = Number.NaN;

      // When / Then
      expect(() => Money.fromMinorUnits(amount)).toThrow();
    });

    it("should reject positive infinity", () => {
      // Given
      const amount = Number.POSITIVE_INFINITY;

      // When / Then
      expect(() => Money.fromMinorUnits(amount)).toThrow();
    });

    it("should reject undefined monetary values", () => {
      // Given
      const amount = undefined as unknown as number;

      // When / Then
      expect(() => Money.fromMinorUnits(amount)).toThrow();
    });

    it("should reject null monetary values", () => {
      // Given
      const amount = null as unknown as number;

      // When / Then
      expect(() => Money.fromMinorUnits(amount)).toThrow();
    });
  });

  describe("Identity", () => {
    it("should preserve the supplied amount", () => {
      // Given
      const amount = 500;

      // When
      const money = Money.fromMinorUnits(amount);

      // Then
      expect(money.minorUnits).toBe(amount);
    });
  });

  describe("Equality", () => {
    it("should consider two money values with the same amount equal", () => {
      // Given
      const first = Money.fromMinorUnits(500);
      const second = Money.fromMinorUnits(500);

      // Then
      expect(first.equals(second)).toBe(true);
    });

    it("should consider two money values with different amounts not equal", () => {
      // Given
      const first = Money.fromMinorUnits(500);
      const second = Money.fromMinorUnits(1000);

      // Then
      expect(first.equals(second)).toBe(false);
    });
  });

  describe("Arithmetic", () => {
    describe("Addition", () => {
      it("should add two monetary values", () => {
        // Given
        const first = Money.fromMinorUnits(500);
        const second = Money.fromMinorUnits(200);

        // When
        const result = first.add(second);

        // Then
        expect(result.equals(Money.fromMinorUnits(700))).toBe(true);
      });

      it("should not mutate the original monetary values during addition", () => {
        // Given
        const first = Money.fromMinorUnits(500);
        const second = Money.fromMinorUnits(200);

        // When
        const result = first.add(second);

        // Then
        expect(first.equals(Money.fromMinorUnits(500))).toBe(true);
        expect(second.equals(Money.fromMinorUnits(200))).toBe(true);
        expect(result.equals(Money.fromMinorUnits(700))).toBe(true);
      });
    });

    describe("Subtraction", () => {
      // Upcoming subtraction tests will live here.
      it("should subtract one monetary value from another", () => {
        // Given
        const first = Money.fromMinorUnits(700);
        const second = Money.fromMinorUnits(200);

        // When
        const result = first.subtract(second);

        // Then
        expect(result.equals(Money.fromMinorUnits(500))).toBe(true);
      });

      it("should not mutate the original monetary values during subtraction", () => {
        // Given
        const first = Money.fromMinorUnits(700);
        const second = Money.fromMinorUnits(200);

        // When
        const result = first.subtract(second);

        // Then
        expect(first.equals(Money.fromMinorUnits(700))).toBe(true);
        expect(second.equals(Money.fromMinorUnits(200))).toBe(true);
        expect(result.equals(Money.fromMinorUnits(500))).toBe(true);
      });

      it("should reject subtraction that results in a negative monetary value", () => {
        // Given
        const first = Money.fromMinorUnits(200);
        const second = Money.fromMinorUnits(700);

        // When / Then
        expect(() => first.subtract(second)).toThrow();
      });
    });
  });
  describe("Queries", () => {
    it("should identify a zero monetary value", () => {
      // Given
      const money = Money.fromMinorUnits(0);

      // Then
      expect(money.isZero()).toBe(true);
    });
  });
  it("should determine whether one monetary value is greater than another", () => {
    // Given
    const larger = Money.fromMinorUnits(700);
    const smaller = Money.fromMinorUnits(500);

    // Then
    expect(larger.isGreaterThan(smaller)).toBe(true);
  });
  it("should determine whether one monetary value is less than another", () => {
    // Given
    const smaller = Money.fromMinorUnits(500);
    const larger = Money.fromMinorUnits(700);

    // Then
    expect(smaller.isLessThan(larger)).toBe(true);
  });
  it("should determine whether one monetary value is greater than or equal to another", () => {
    // Given
    const first = Money.fromMinorUnits(700);
    const second = Money.fromMinorUnits(700);

    // Then
    expect(first.isGreaterThanOrEqualTo(second)).toBe(true);
  });
  it("should determine whether one monetary value is less than or equal to another", () => {
    // Given
    const first = Money.fromMinorUnits(500);
    const second = Money.fromMinorUnits(500);

    // Then
    expect(first.isLessThanOrEqualTo(second)).toBe(true);
  });
});
