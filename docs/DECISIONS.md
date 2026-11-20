# Decisions

| Date | Decision | Reason |
|---|---|---|
| 2026-11-19 | Repository stays named `foundryvtt-mon1e`; the maintainer links `<User Data>/Data/systems/mon1e` to it by hand. | Foundry requires the folder name to match the system id `mon1e`. |
| 2026-11-19 | Project language is English (the French framing brief is unchanged). | Maintainer decision. |
| 2026-11-19 | Generated files (`CLAUDE.md`, `AGENTS.md`, `.claude/`, `.agents/`) are versioned. | Maintainer decision; commit them separately from milestone code. |
| 2026-11-19 | Milestone 1 validated in Foundry: system loads, `init` hook runs, diagnostic message logged. | Console output provided by the maintainer. |
| 2026-11-19 | Native Game System: JavaScript ES Modules (`.mjs`), JSDoc with `checkJs`, no build step, bundler or framework. `typescript` is a dev dependency for `checkJs` only. | Framing brief (P0-P2); no concrete need for more. |
| 2026-11-19 | `checkJs` covers `src/constants.mjs` and `tests/` only; `src/main.mjs` is excluded and no Foundry type declarations are installed. | Foundry globals have no declarations; Foundry APIs are verified in Foundry itself (issue #4). |
| 2026-11-19 | Documentation set: root `README.md`, plus `docs/DEVELOPMENT.md`, `docs/DECISIONS.md`, `docs/RULES.md`, kept short. | Framing brief section 7 (issue #5). |
| 2026-11-20 | Actor type `character` with a tabbed `ActorSheetV2` sheet (header + one tab per page); page 1 identity fields only: species, ancestry, moonSignature, archetype (text); kaon, zaon, zaonScars, might (integers). Name is the Actor `name`. Raw values, no bounds. | Issue #12; `docs/RULES.md` A1, A2, A8, A9 (answers from the maintainer, **not yet confirmed by the Mon creator**). |
| 2026-11-20 | Class / Sub-Class / Level stored as one list `classLevels` of `{class, subClass, level}` rows, 3 empty rows initially, no cap. | A8 says lists of separate entries; the sheet prints them as rows. Shape is a maintainer-level assumption; change before more data exists if the creator disagrees. |
| 2026-11-20 | Issue #12 overlaps #7 (model and sheet). #7 is left open; the maintainer decides whether to close or reduce it. | Issue #12 note. |

