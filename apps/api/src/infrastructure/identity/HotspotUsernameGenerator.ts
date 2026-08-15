import type { UsernameGenerator } from "@application/ports/UsernameGenerator.js";
import type { IdentifierGenerator } from "@shared";

export class HotspotUsernameGenerator implements UsernameGenerator {
  constructor(private readonly identifierGenerator: IdentifierGenerator) {}

  generate(): string {
    return `mt_${this.identifierGenerator.generate()}`;
  }
}
