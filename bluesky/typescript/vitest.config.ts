import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["__tests__/**/*.test.ts"],
    coverage: {
      reporter: ["text", "json", "html"],
      include: ["*.ts"],
      exclude: ["__tests__/**", "vitest.config.ts"],
    },
    testTimeout: 30000,
  },
});
