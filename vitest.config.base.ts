import { defineConfig } from "vitest/config";

/**
 * 全 workspace で継承する vitest の基底設定。
 * 各 app/package の vitest.config.ts で mergeConfig して使用する。
 */
export default defineConfig({
  test: {
    globals: true,
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    passWithNoTests: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary"],
      exclude: ["**/*.test.*", "**/*.spec.*", "**/node_modules/**"],
    },
  },
});
