import { config } from "dotenv";

config({
  path: ".env.sandbox",
});

async function main() {
  console.log("DATABASE_URL =", process.env.DATABASE_URL);

  const { prisma } = await import(
    "../src/infrastructure/database/prisma.js"
  );

  const plans = await prisma.plan.findMany();

  console.log("Connected successfully.");
  console.log(plans);

  await prisma.$disconnect();
}

main().catch(console.error);