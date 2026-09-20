import { describe, expect, it } from "vitest";

import {
  createCreateSessionController,
  createGetActiveSessionController,
} from "@composition/session.js";

import { CreateSessionController } from "@http/session/controller/CreateSessionController.js";
import { GetActiveSessionController } from "@http/session/controller/GetActiveSessionController.js";

describe("session composition", () => {
  it("creates the CreateSessionController", () => {
    const controller = createCreateSessionController();

    expect(controller).toBeInstanceOf(CreateSessionController);
    expect(typeof controller.handle).toBe("function");
  });

  it("creates the GetActiveSessionController", () => {
    const controller = createGetActiveSessionController();

    expect(controller).toBeInstanceOf(GetActiveSessionController);
    expect(typeof controller.handle).toBe("function");
  });
});
