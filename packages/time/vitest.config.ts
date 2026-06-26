import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";
import packageJson from "./package.json" with { type: "json" };

const packageDir = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  plugins: [tsconfigPaths({ root: packageDir })],
  test: {
    name: packageJson.name,
    include: ["src/**/*.test.ts", "src/**/*.spec.ts"],
    dir: "./",
    watch: false,
    environment: "happy-dom",
    globals: true,
  },
});
