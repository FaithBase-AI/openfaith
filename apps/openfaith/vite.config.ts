import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    tsconfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tanstackStart({
      spa: {
        enabled: true,
      },
      target: "bun",
      tsr: {
        srcDirectory: "app",
      },
    }),
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      external: ["@effect/experimental"],
    },
  },
  server: {
    port: 3000,
  },
});
