# Spec Kit — TanStack Time

This is the Spec-Driven Development (SDD) infrastructure for TanStack Time, following the [github/spec-kit](https://github.com/github/spec-kit) methodology.

## Workflow

```
/speckit.constitution  →  /speckit.specify  →  /speckit.clarify (optional)
       ↓
  /speckit.plan  →  /speckit.analyze (optional)  →  /speckit.tasks
       ↓
  /speckit.implement
```

## Directory Structure

```
.specify/
  memory/
    constitution.md      # Project principles (read first, always)
  scripts/bash/
    common.sh            # Shared utilities
    create-new-feature.sh # Scaffolds specs/<id>-<name>/
    setup-plan.sh        # Scaffolds plan.md
    setup-tasks.sh       # Scaffolds tasks.md
  templates/
    constitution-template.md
    spec-template.md
    plan-template.md
    tasks-template.md

specs/
  001-<feature>/         # Feature specs live here
    spec.md              # Functional requirements
    plan.md              # Technical implementation
    tasks.md             # Actionable task breakdown
    contracts/           # API contracts, data models

.claude/commands/
  speckit-constitution.md   # /speckit.constitution
  speckit-specify.md        # /speckit.specify
  speckit-clarify.md        # /speckit.clarify
  speckit-plan.md           # /speckit.plan
  speckit-analyze.md        # /speckit.analyze
  speckit-tasks.md          # /speckit.tasks
  speckit-implement.md      # /speckit.implement
```

## Commands

| Command                 | Purpose                          | When to run                   |
| ----------------------- | -------------------------------- | ----------------------------- |
| `/speckit.constitution` | Create/update project principles | First, before any feature     |
| `/speckit.specify`      | Write functional requirements    | For each new feature          |
| `/speckit.clarify`      | Ask clarifying questions         | After specify, before plan    |
| `/speckit.plan`         | Write technical plan             | After clarify/specify         |
| `/speckit.analyze`      | Check spec-plan-task coverage    | After tasks, before implement |
| `/speckit.tasks`        | Break plan into tasks            | After plan                    |
| `/speckit.implement`    | Execute task breakdown           | After tasks                   |

## Constitution

Read `.specify/memory/constitution.md` before any development. It defines:

- Zero comments in source code
- Headless core, thin adapters
- No Temporal leakage in public API
- Immutable inputs
- Treeshakable standalone functions
- Test-first for all public functions
