import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    testNamePattern: "(spec|test)\\.[jt]sx?$",
  },
});
