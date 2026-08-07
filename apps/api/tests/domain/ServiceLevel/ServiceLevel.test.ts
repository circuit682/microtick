import { describe, expect, it } from "vitest";

import { ServiceLevel } from "@domain";

describe("ServiceLevel", () => {
  it("creates a service level", () => {
    const level = ServiceLevel.create({
      name: "Residential",
    });

    expect(level.name).toBe("Residential");
  });

  it("trims surrounding whitespace", () => {
    const level = ServiceLevel.create({
      name: "  Premium  ",
    });

    expect(level.name).toBe("Premium");
  });

  it("compares two service levels", () => {
    const first = ServiceLevel.create({
      name: "Business",
    });

    const second = ServiceLevel.create({
      name: "Business",
    });

    expect(first.equals(second)).toBe(true);
  });

  it("rejects an empty name", () => {
    expect(() =>
      ServiceLevel.create({
        name: "   ",
      }),
    ).toThrow();
  });
});
