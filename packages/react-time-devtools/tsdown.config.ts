import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["./src/index.ts", "./src/production.ts"],
  format: ["esm", "cjs"],
  unbundle: true,
  dts: true,
  sourcemap: true,
  clean: true,
  minify: false,
  fixedExtension: false,
  exports: true,
  esbuild: {
    jsx: "automatic",
  },
  publint: {
    strict: true,
  },
});
