import { glob } from "tinyglobby";
import { readFile, writeFile } from "node:fs/promises";
import { resolve, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

interface PackageNode {
  name: string;
  path: string;
  exports: string[];
  dependencies: string[];
  devDependencies: string[];
  peerDependencies: string[];
  internalDeps: string[];
  files: string[];
  tests: string[];
}

interface Graph {
  generated: string;
  packages: PackageNode[];
  edges: { from: string; to: string; type: string }[];
}

async function getExports(filePath: string): Promise<string[]> {
  const content = await readFile(filePath, "utf-8");
  const exports: string[] = [];

  const namedExport =
    /export\s+(?:const|let|var|function|class|interface|type|enum)\s+(\w+)/g;
  let match: RegExpExecArray | null;
  while ((match = namedExport.exec(content)) !== null) {
    exports.push(match[1]);
  }

  const defaultExport = /export\s+default\s+(\w+)/g;
  while ((match = defaultExport.exec(content)) !== null) {
    exports.push(`default ${match[1]}`);
  }

  const reExport = /export\s+\*\s+from\s+['"]([^'"]+)['"]/g;
  while ((match = reExport.exec(content)) !== null) {
    exports.push(`* from ${match[1]}`);
  }

  const namedReExport = /export\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/g;
  while ((match = namedReExport.exec(content)) !== null) {
    const names = match[1]
      .split(",")
      .map((s) =>
        s.trim()
          .split(/\s+as\s+/)[0]
          .trim(),
      )
      .filter(Boolean);
    exports.push(...names.map((n) => `${n} from ${match[2]}`));
  }

  const blockExport = /export\s+\{([^}]+)\}/g;
  while ((match = blockExport.exec(content)) !== null) {
    const names = match[1]
      .split(",")
      .map((s) =>
        s.trim()
          .split(/\s+as\s+/)[0]
          .split(":")[0]
          .trim(),
      )
      .filter(Boolean);
    exports.push(...names);
  }

  return [...new Set(exports)];
}

async function buildGraph(): Promise<Graph> {
  const packageJsonPaths = await glob("packages/**/package.json", {
    cwd: root,
    ignore: ["**/node_modules/**"],
  });
  const packages: PackageNode[] = [];
  const edges: Graph["edges"] = [];

  for (const pkgPath of packageJsonPaths) {
    const fullPath = resolve(root, pkgPath);
    const content = await readFile(fullPath, "utf-8");
    const pkg = JSON.parse(content);
    const dir = dirname(pkgPath);

    const srcFiles = await glob(`${dir}/src/**/*.ts`, {
      cwd: root,
      ignore: ["**/node_modules/**"],
    });
    const testFiles = srcFiles.filter((f) => f.includes(".test."));
    const nonTestFiles = srcFiles.filter((f) => !f.includes(".test."));

    let exports: string[] = [];
    const indexFile = nonTestFiles.find((f) => f.endsWith("/index.ts"));
    if (indexFile) {
      exports = await getExports(resolve(root, indexFile));
    }

    const deps = Object.keys(pkg.dependencies || {});
    const devDeps = Object.keys(pkg.devDependencies || {});
    const peerDeps = Object.keys(pkg.peerDependencies || {});
    const internalDeps = deps.filter((d) => d.startsWith("@tanstack/"));

    const node: PackageNode = {
      name: pkg.name,
      path: dir,
      exports,
      dependencies: deps,
      devDependencies: devDeps,
      peerDependencies: peerDeps,
      internalDeps,
      files: nonTestFiles.map((f) => relative(root, f)),
      tests: testFiles.map((f) => relative(root, f)),
    };
    packages.push(node);

    for (const dep of internalDeps) {
      edges.push({
        from: pkg.name,
        to: dep,
        type: "dependency",
      });
    }
  }

  return {
    generated: new Date().toISOString(),
    packages,
    edges,
  };
}

async function main() {
  const graph = await buildGraph();
  const outputPath = resolve(root, ".ai", "graph.json");
  await writeFile(outputPath, JSON.stringify(graph, null, 2));
  console.log(`Graph written to ${relative(root, outputPath)}`);
  console.log(`Packages: ${graph.packages.length}`);
  console.log(`Edges: ${graph.edges.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
