import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    environment: "node",        // pure-math tests don't need DOM
    include: ["__tests__/**/*.test.ts"],
    testTimeout: 10000,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./"),
    },
  },
});