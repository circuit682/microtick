import { describe, expectTypeOf, it } from "vitest";

import type { PlanRepository } from "@application/plan/PlanRepository.js";

describe("PlanRepository", () => {
  it("should define a contract for saving plans", () => {
    expectTypeOf<PlanRepository>().toBeObject();
  });
});