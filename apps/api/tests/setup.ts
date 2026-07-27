// import { config } from "dotenv";

// // Load the sandbox environment before any tests are imported.
// config({
//   path: ".env.sandbox",
// });
// console.log("DATABASE_URL =", process.env.DATABASE_URL);
import { config } from "dotenv";

config({
  path: ".env.sandbox",
});

console.log(
  "Loaded from:",
  process.cwd() + "/.env.sandbox",
);

console.log(
  "DATABASE_URL:",
  process.env.DATABASE_URL,
);