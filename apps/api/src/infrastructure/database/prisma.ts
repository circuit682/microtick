import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@generated/prisma/client.js";

import { env } from "@config/env.js";

const adapter = new PrismaPg({
  connectionString: env.database.url,
});

export const prisma = new PrismaClient({
  adapter,
});