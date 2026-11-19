---
name: implement-from-plan
description: >
  Implement an existing technical plan end-to-end: targeted repository inspection,
  code changes, tests, validation, and concise reporting. Project, platform, test,
  language, and architecture rules come from injected context.
argument-hint: "[plan-path]"
compatibility: "claude-code;opencode"
disable-model-invocation: true
disallowed-tools: Agent
---

# Implement from plan

Use this skill when the user provides an existing implementation plan and expects working, tested code aligned with the active project's conventions.

## Mission
Turn an approved plan into a real implementation without re-specifying decisions already made.

The skill must:
1. read the supplied plan fully;
2. inspect existing code around impacted areas;
3. implement the smallest correct change;
4. respect injected architecture, platform, coding, and persistence constraints;
5. add or update required tests;
6. validate using project-defined commands;
7. distinguish plan requirements, repository-driven adaptations, and explicit deviations.

If no plan is provided, do not invent one. Ask for a plan or use a planning skill if available.

## Required injected context
The active profile should provide or make discoverable project architecture/conventions, validation/test commands, platform constraints, testing strategy, and artifact/code language conventions as applicable. Repository code remains the source of truth for actual paths, symbols, public contracts, and patterns.

## Token/context policy
Use direct repository reads/searches and deterministic tools where possible. Collect only useful command output. For failures, retain the failing command, relevant error block, and directly involved files. Do not broadly explore the repository when the plan identifies the affected area.

## Absolute rules
1. Read the full plan before editing.
2. Do not reinvent architecture already decided by the plan.
3. If the plan is materially ambiguous, obsolete, or contradicts current code, stop before structural changes and surface the conflict.
4. Inspect existing code around impacted files before modifying it.
5. Apply all injected platform and architecture constraints.
6. Add/update tests whenever behavior, rules, calculations, parsing, mapping, transformation, or integration flow changes, unless project context defines another validation strategy.
7. Do not refactor outside scope unless directly necessary.
8. Do not add opportunistic behavior outside the plan.
9. Respect project localization/i18n rules for user-visible text.
10. Respect project persistence/data-mutation rules.
11. Do not silently change business rules not requested by the plan.

## Workflow

### Step 1 — Read and frame
Identify the objective, mentioned files/modules, affected layers, risks, fixed architecture decisions, expected behavior, and excluded behavior. Read directly referenced ADRs/specs when needed.

### Step 2 — Inspect real code
Read target files, immediate neighboring patterns, nearby tests, and relevant naming/import/structure/log/event/persistence/public-contract conventions. Look for reusable code and contracts to preserve.

### Step 3 — Break into safe changes
Prefer small ordered units: pure structures/helpers, integration/wiring, tests, localization/documentation if required, validation. Follow the plan's ordering when specified.

### Step 4 — Implement
Make the smallest correct change; follow repository architecture; avoid unnecessary abstractions and unrelated style changes; document only non-obvious decisions; keep responsibilities in the layer defined by project context.

### Step 5 — Test
Choose test levels using injected testing context and existing project patterns. For bug fixes, prefer a regression test that would fail before the fix. New behavior should have automated coverage or an explicit reason when automation is not realistic.

### Step 6 — Validate
Run targeted tests first, then additional configured validation when justified. Inspect the final diff and report honestly what was and was not validated.

## Final output
- **Implemented**: short summary + main files.
- **Tests**: commands + results.
- **Plan deviations**: only when present.
- **Remaining risks**: only when necessary.
