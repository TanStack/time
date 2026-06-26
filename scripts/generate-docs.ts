import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { generateReferenceDocs } from "@tanstack/typedoc-config";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

await generateReferenceDocs({
  packages: [
    {
      name: "time",
      entryPoints: [resolve(__dirname, "../packages/time/src/index.ts")],
      tsconfig: resolve(__dirname, "../packages/time/tsconfig.docs.json"),
      outputDir: resolve(__dirname, "../docs/reference"),
    },
    {
      name: "react-time",
      entryPoints: [resolve(__dirname, "../packages/react-time/src/index.ts")],
      tsconfig: resolve(__dirname, "../packages/react-time/tsconfig.docs.json"),
      outputDir: resolve(__dirname, "../docs/framework/react/reference"),
      exclude: ["packages/time/**/*"],
    },
    {
      name: "solid-time",
      entryPoints: [resolve(__dirname, "../packages/solid-time/src/index.ts")],
      tsconfig: resolve(__dirname, "../packages/solid-time/tsconfig.docs.json"),
      outputDir: resolve(__dirname, "../docs/framework/solid/reference"),
      exclude: ["packages/time/**/*"],
    },
  ],
});

console.log("\n✅ All markdown files have been processed!");

process.exit(0);
