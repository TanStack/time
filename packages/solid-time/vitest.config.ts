import { defineConfig } from "vitest/config";
import solid from "vite-plugin-solid";
import packageJson from "./package.json" with { type: "json" };

export default defineConfig({
  plugins: [solid()],
  resolve: {
    conditions: ["development", "browser"],
  },
  test: {
    server: {
      deps: {
        inline: [/solid-js/, /@tanstack\/solid-store/],
      },
    },
    name: packageJson.name,
    dir: "./tests",
    watch: false,
    environment: "happy-dom",
    globals: true,
  },
});
