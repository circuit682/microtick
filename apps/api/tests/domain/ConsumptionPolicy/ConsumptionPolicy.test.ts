import { describe, expect, it } from "vitest";

import { ConsumptionPolicy } from "@domain";

describe("ConsumptionPolicy", () => {
  it("defines continuous consumption", () => {
    expect(ConsumptionPolicy.CONTINUOUS).toBe("CONTINUOUS");
  });

  it("defines usage-based consumption", () => {
    expect(ConsumptionPolicy.USAGE).toBe("USAGE");
  });

  it("contains exactly two consumption policies", () => {
    expect(Object.values(ConsumptionPolicy)).toEqual([
      ConsumptionPolicy.CONTINUOUS,
      ConsumptionPolicy.USAGE,
    ]);
  });
});
