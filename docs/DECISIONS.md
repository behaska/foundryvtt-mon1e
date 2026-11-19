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
