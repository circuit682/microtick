import { describe, expect, it } from "vitest";

import { AccessMethod } from "@domain";

describe("AccessMethod", () => {
  it("defines wall-clock access", () => {
    expect(AccessMethod.WALL_CLOCK).toBe("WALL_CLOCK");
  });

  it("defines session-based access", () => {
    expect(AccessMethod.SESSION).toBe("SESSION");
  });

  it("contains exactly two access methods", () => {
    expect(Object.values(AccessMethod)).toEqual(["WALL_CLOCK", "SESSION"]);
  });
});
