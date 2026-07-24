import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@application": resolve(root, "src/application"),
      "@config": resolve(root, "src/config"),
      "@domain": resolve(root, "src/domain"),
      "@http": resolve(root, "src/http"),
      "@infrastructure": resolve(root, "src/infrastructure"),
      "@shared": resolve(root, "src/shared"),
    },
  },

  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});