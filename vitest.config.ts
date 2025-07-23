import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    testTimeout: 120000, // 2 minutes for container tests
    hookTimeout: 120000,
    teardownTimeout: 120000,
    setupFiles: [],
  },
  resolve: {
    alias: {
      "@openfaith/adapter-core": path.resolve(
        __dirname,
        "./adapters/adapter-core",
      ),
      "@openfaith/auth": path.resolve(__dirname, "./packages/auth"),
      "@openfaith/be-shared": path.resolve(__dirname, "./packages/be-shared"),
      "@openfaith/bun-test": path.resolve(__dirname, "./packages/bun-test"),
      "@openfaith/ccb": path.resolve(__dirname, "./adapters/ccb"),
      "@openfaith/db": path.resolve(__dirname, "./packages/db"),
      "@openfaith/domain": path.resolve(__dirname, "./packages/domain"),
      "@openfaith/email": path.resolve(__dirname, "./backend/email"),
      "@openfaith/openfaith": path.resolve(__dirname, "./apps/openfaith"),
      "@openfaith/pco": path.resolve(__dirname, "./adapters/pco"),
      "@openfaith/schema": path.resolve(__dirname, "./packages/schema"),
      "@openfaith/server": path.resolve(__dirname, "./backend/server"),
      "@openfaith/shard-manager": path.resolve(
        __dirname,
        "./backend/shard-manager",
      ),
      "@openfaith/shared": path.resolve(__dirname, "./packages/shared"),
      "@openfaith/ui": path.resolve(__dirname, "./packages/ui"),
      "@openfaith/workers": path.resolve(__dirname, "./backend/workers"),
      "@openfaith/zero": path.resolve(__dirname, "./packages/zero"),
      "@openfaith/zero-effect": path.resolve(
        __dirname,
        "./packages/zero-effect",
      ),
    },
  },
  define: {
    // Mock bun-specific globals for vitest
    Bun: "undefined",
    "process.isBun": "false",
  },
  optimizeDeps: {
    exclude: ["bun"],
  },
  esbuild: {
    define: {
      "process.isBun": "false",
    },
  },
});
