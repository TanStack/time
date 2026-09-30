---
title: Agent Skills
id: agent-skills
---

# Agent Skills

`@tanstack/time`, `@tanstack/react-time` and `@tanstack/solid-time` ship [Agent Skills](https://agentskills.io) in their npm tarballs under `skills/`. Each skill is versioned with the package, so your coding agent reads guidance that matches the version you have installed.

| Skill | Use it for |
| --- | --- |
| `@tanstack/time#core` | `createCalendar`, features, date helpers |
| `@tanstack/time#booking` | Slot rules, `getSlots`, `book`, `hold`, server-side `generateSlots` |
| `@tanstack/react-time#react` | `useCalendar`, move and resize controllers |
| `@tanstack/solid-time#solid` | Solid `createCalendar`, accessors, resize handles |

Skills are discovered and loaded with [TanStack Intent](https://github.com/TanStack/intent).

## Discovery does not run package code

`intent list` and `intent load` read `package.json` and `SKILL.md` files from your installed dependencies. They do not import or execute package code. Pin the CLI as a dev dependency instead of running `@latest`:

```bash
npm install -D @tanstack/intent
```

## Allow only the sources you trust

Without configuration, Intent surfaces skills from every installed package that ships them, including transitive dependencies. Add an explicit allowlist to your `package.json`:

```json
{
  "intent": {
    "skills": ["@tanstack/time", "@tanstack/react-time"],
    "exclude": ["@tanstack/time#booking"]
  }
}
```

- `skills` lists the packages, or single `package#skill` entries, that may be surfaced. An empty array permits nothing. `"*"` permits everything and is not recommended.
- `exclude` removes packages or single skills, and accepts `*` wildcards such as `@tanstack/time#experimental-*`.
- A package outside the allowlist is refused: `intent load dotenv#dotenv` fails with `package "dotenv" is not listed in intent.skills`.

Check what is visible and what is hidden:

```bash
npx intent list
npx intent list --show-hidden
```

## Load only what the task needs

Let the agent load one skill at a time rather than all of them up front:

```bash
npx intent load @tanstack/time#booking
```

`npx intent install` writes loading guidance into your agent config file (`CLAUDE.md`, `AGENTS.md`, `.cursorrules` and similar). Review the diff before committing it.

## Editor hooks are a convenience

`npx intent hooks install` adds hooks for Claude Code, Copilot and Codex that surface matching skills and check that one was loaded before edits. Hooks only nudge the agent. They do not stop it from reading files in `node_modules` directly, and they only run in agents that support them. The `intent.skills` allowlist is enforced by the Intent CLI, not by your editor, so review third-party skill content as you would any other dependency.
