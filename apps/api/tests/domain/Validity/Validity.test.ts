import { describe, expect, it } from "vitest";

import { Validity, ValidityUnit } from "@domain";

describe("Validity", () => {
  it("creates a validity", () => {
    const validity = Validity.create({
      amount: 30,
      unit: ValidityUnit.MINUTES,
    });

    expect(validity.amount).toBe(30);
    expect(validity.unit).toBe(ValidityUnit.MINUTES);
  });

  it("converts hours into minutes", () => {
    const validity = Validity.create({
      amount: 2,
      unit: ValidityUnit.HOURS,
    });

    expect(validity.toMinutes()).toBe(120);
  });

  it("converts days into minutes", () => {
    const validity = Validity.create({
      amount: 1,
      unit: ValidityUnit.DAYS,
    });

    expect(validity.toMinutes()).toBe(1440);
  });

  it("compares two validities", () => {
    const first = Validity.create({
      amount: 30,
      unit: ValidityUnit.MINUTES,
    });

    const second = Validity.create({
      amount: 30,
      unit: ValidityUnit.MINUTES,
    });

    expect(first.equals(second)).toBe(true);
  });

  it("rejects zero duration", () => {
    expect(() =>
      Validity.create({
        amount: 0,
        unit: ValidityUnit.MINUTES,
      }),
    ).toThrow();
  });
});
