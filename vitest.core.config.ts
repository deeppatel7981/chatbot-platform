import { defineConfig } from "vitest/config";
import { fileURLToPath } from "url";

/** Unit tests for @chatbot/core (Node — no jsdom / Next mocks). */
export default defineConfig({
  resolve: {
    alias: {
      "@chatbot/core": fileURLToPath(new URL("./packages/core/src/index.ts", import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: "node",
    include: ["packages/core/src/**/*.test.ts"],
  },
});
