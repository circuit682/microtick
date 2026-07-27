import { ulid } from "ulid";

import { IdentifierGenerator } from "@shared";

export class UlidIdentifierGenerator
  implements IdentifierGenerator
{
  generate(): string {
    return ulid();
  }
}