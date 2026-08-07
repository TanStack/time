import { existsSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const SRC = resolve("src");
const ENTRY = join(SRC, "index.ts");

interface Reference {
  specifier: string;
  names: Array<string> | null;
}

const CLAUSE =
  /(?:^|\n)[ \t]*(?:import|export)[ \t]+([\s\S]*?)[ \t]*from[ \t]*["']([^"']+)["']/g;

function referencesIn(source: string): Array<Reference> {
  const references: Array<Reference> = [];

  for (const [, clause, specifier] of source.matchAll(CLAUSE)) {
    const text = clause!.trim();
    if (text.startsWith("type ") || text.startsWith("type*")) continue;
    if (text === "*" || text.startsWith("* as")) {
      references.push({ specifier: specifier!, names: null });
      continue;
    }

    const braces = text.match(/\{([\s\S]*)\}/);
    if (!braces) {
      references.push({ specifier: specifier!, names: [text] });
      continue;
    }

    const names = braces[1]!
      .split(",")
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0 && !entry.startsWith("type "))
      .map((entry) => entry.split(/\s+as\s+/)[0]!.trim());

    const defaultImport = text
      .slice(0, text.indexOf("{"))
      .replace(",", "")
      .trim();
    if (defaultImport.length > 0) names.push(defaultImport);
    if (names.length > 0) references.push({ specifier: specifier!, names });
  }

  return references;
}

function resolveModule(from: string, specifier: string): string | null {
  const base = specifier.startsWith("~/")
    ? join(SRC, specifier.slice(2))
    : specifier.startsWith(".")
      ? join(dirname(from), specifier)
      : null;
  if (base === null) return null;

  for (const candidate of [`${base}.ts`, join(base, "index.ts")]) {
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

const sources = new Map<string, string>();

function read(file: string): string {
  let source = sources.get(file);
  if (source === undefined) {
    source = readFileSync(file, "utf8");
    sources.set(file, source);
  }
  return source;
}

const RE_EXPORT =
  /(?:^|\n)[ \t]*export[ \t]+(?:type[ \t]+)?(?:\*(?:[ \t]+as[ \t]+\w+)?|\{[\s\S]*?\})[ \t]*from[ \t]*["'][^"']+["'];?/g;

function isReExportOnly(file: string): boolean {
  const source = read(file);
  const rest = source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|\n)[ \t]*\/\/[^\n]*/g, "")
    .replace(RE_EXPORT, "")
    .trim();

  return source.trim().length > 0 && rest.length === 0;
}

function declares(file: string, name: string): boolean {
  const source = read(file);
  if (
    new RegExp(
      `export (?:declare )?(?:async )?(?:function|const|let|var|class|interface|type|enum) ${name}\\b`,
    ).test(source)
  ) {
    return true;
  }
  if (new RegExp(`export \\{[^}]*\\b${name}\\b[^}]*\\}`).test(source)) {
    return true;
  }
  if (!isReExportOnly(file)) return false;

  for (const reference of referencesIn(source)) {
    if (reference.names !== null) continue;

    const target = resolveModule(file, reference.specifier);
    if (target && declares(target, name)) return true;
  }

  return false;
}

function linkedFrom(entry: string, names: Array<string>): Set<string> {
  const linked = new Set<string>();

  const visit = (file: string, wanted: Array<string> | null) => {
    if (isReExportOnly(file)) {
      for (const reference of referencesIn(read(file))) {
        const target = resolveModule(file, reference.specifier);
        if (!target) continue;

        if (reference.names === null) {
          if (wanted === null) {
            visit(target, null);
            continue;
          }
          const needed = wanted.filter((name) => declares(target, name));
          if (needed.length > 0) visit(target, needed);
          continue;
        }

        const exposed =
          wanted === null
            ? reference.names
            : reference.names.filter((name) => wanted.includes(name));
        if (exposed.length > 0) visit(target, exposed);
      }
      return;
    }

    if (linked.has(file)) return;
    linked.add(file);

    for (const reference of referencesIn(read(file))) {
      const target = resolveModule(file, reference.specifier);
      if (target) visit(target, reference.names);
    }
  };

  visit(entry, names);
  return linked;
}

describe("feature linking", () => {
  const linked = linkedFrom(ENTRY, [
    "createCalendar",
    "calendarFeatures",
    "dayEventLayoutFeature",
  ]);
  const paths = [...linked].map((file) => relative(SRC, file));

  it("links the modules the composition actually uses", () => {
    expect(paths).toContain("calendar/calendar.ts");
    expect(paths).toContain("calendar/features/dayLayout.ts");
    expect(paths).toContain("kernel/kernel.ts");
    expect(paths).toContain("projection/bucketByDay.ts");
  });

  it("links no working-time code", () => {
    expect(
      paths.filter(
        (path) =>
          path.startsWith("workingTime/") ||
          path.startsWith("validation/availability/") ||
          path === "calendar/features/workingTime.ts" ||
          path === "calendar/features/availability.ts",
      ),
    ).toEqual([]);
  });

  it("links the working-time feature when it is composed", () => {
    const withWorkingTime = linkedFrom(ENTRY, [
      "createCalendar",
      "calendarFeatures",
      "workingTimeFeature",
    ]);

    expect([...withWorkingTime].map((file) => relative(SRC, file))).toContain(
      "workingTime/resolve.ts",
    );
  });
});
