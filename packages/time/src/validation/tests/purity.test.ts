import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const PURE_DIRS = [
  "src/validation",
  "src/projection",
  "src/recurrence",
  "src/workingTime",
  "src/solver",
];

const FORBIDDEN = [
  { pattern: /@tanstack\/store/, why: "state store" },
  { pattern: /~\/client/, why: "event client" },
  { pattern: /~\/kernel/, why: "kernel" },
  { pattern: /~\/calendar\/calendar/, why: "CalendarCore" },
  { pattern: /\b(?:document|window)\./, why: "DOM" },
];

function sourceFiles(dir: string): Array<string> {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      return entry === "tests" ? [] : sourceFiles(path);
    }
    return path.endsWith(".ts") ? [path] : [];
  });
}

describe("pure cores (ADR 0004)", () => {
  const files = PURE_DIRS.flatMap((dir) => sourceFiles(dir));

  it("finds the cores to check", () => {
    expect(files.length).toBeGreaterThan(10);
  });

  it.each(FORBIDDEN)("depends on no $why", ({ pattern }) => {
    const offenders = files.filter((file) =>
      pattern.test(readFileSync(file, "utf8")),
    );

    expect(offenders).toEqual([]);
  });
});
