import { describe, expect, it } from "vitest";

import { HotspotUsernameGenerator } from "@infrastructure/identity/HotspotUsernameGenerator.js";

describe("HotspotUsernameGenerator", () => {
  it("should generate a username with the mt_ prefix", () => {
    const identifierGenerator = {
      generate: () => "01K2ABCD3EFGH4IJK5LMNOPQRS",
    };

    const generator = new HotspotUsernameGenerator(identifierGenerator);

    expect(generator.generate()).toBe("mt_01K2ABCD3EFGH4IJK5LMNOPQRS");
  });

  it("should generate different usernames when the identifier generator produces different identifiers", () => {
    const identifiers = [
      "01K2ABCD3EFGH4IJK5LMNOPQRS",
      "01K2ABCD3EFGH4IJK5LMNOPQRT",
    ];

    let index = 0;

    const identifierGenerator = {
      generate: () => identifiers[index++]!,
    };

    const generator = new HotspotUsernameGenerator(identifierGenerator);

    const first = generator.generate();
    const second = generator.generate();

    expect(first).not.toBe(second);
    expect(first).toMatch(/^mt_01K2ABCD3EFGH4IJK5LMNOPQRS$/);
    expect(second).toMatch(/^mt_01K2ABCD3EFGH4IJK5LMNOPQRT$/);
  });

  it("should satisfy the UsernameGenerator contract", () => {
    const identifierGenerator = {
      generate: () => "01K2ABCD3EFGH4IJK5LMNOPQRS",
    };

    const generator: import("@application/ports/UsernameGenerator.js").UsernameGenerator =
      new HotspotUsernameGenerator(identifierGenerator);

    expect(generator.generate()).toBe("mt_01K2ABCD3EFGH4IJK5LMNOPQRS");
  });
});
