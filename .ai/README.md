# AI Infrastructure

Generated and maintained for AI agents working on TanStack Time.

## Graphify

`pnpm run graphify` generates `.ai/graph.json` — a machine-readable graph of the monorepo (packages, exports, dependencies, files, tests).

## Spec Kit

`.ai/spec-kit/` contains domain-specific specifications:

- `architecture.md` — monorepo structure, package relationships, build system
- `testing.md` — test framework, commands, coverage expectations
- `api-design.md` — input/output contracts, method signatures, design philosophy
- `calendar-domain.md` — Temporal API, event model, recurrence, availability, views

## Agent Context

`.ai/AGENTS.md` — top-level instructions for AI agents. Read this first.
