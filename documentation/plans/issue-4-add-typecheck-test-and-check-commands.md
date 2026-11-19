# Implementation plan — Add typecheck, test and check commands
**Issue**: https://github.com/behaska/foundryvtt-mon1e/issues/4 (parent: #1, blocked by #3)
**ADR**: none (no ADR directory configured)
**Likely impacted modules**: `package.json`, `tsconfig.json`, `tests/constants.test.mjs`, `docs/DEVELOPMENT.md` (all already exist)

Framing source: `documentation/cadrage/bootstrap/bootstraping-initial-project.md` (French), phase **P2**.

## 1. Objective
Quality baseline without transpilation: `npm run typecheck`, `npm test`, `npm run check` all run and pass locally, and the real `checkJs` coverage is stated explicitly, with uncovered Foundry APIs flagged as needing in-Foundry checks.

## 2. Scope
### Included
- Confirm `typescript` is a dev dependency used only for `checkJs` (no `.ts` file, no emitted JS).
- Confirm `tsconfig.json` (`allowJs` + `checkJs`, `noEmit`).
- Confirm the three scripts and that they pass; at least one real test on a pure function.
- Confirm the documented `checkJs` coverage statement (includes what is not covered).

### Out of scope
- Foundry type declarations or community types library (brief: do not add yet).
- Extending `checkJs` to `src/main.mjs`.
- CI, linters, formatters, bundler.
- Dev workflow doc beyond the commands table (issue #5), data models and rules (#6+).
- Any Mon rule.

## 3. Existing state
Most of the issue already landed in commit `60c9e09` and is documented in `docs/DEVELOPMENT.md`:
- `package.json` scripts: `typecheck` = `tsc --noEmit`, `test` = `node --test tests/`, `check` = `npm run typecheck && npm test`. Dev deps: `typescript ^7.0.2`, `@types/node ^26.6.6`.
- `tsconfig.json`: `allowJs`, `checkJs`, `noEmit`, `strict`, NodeNext; `include` = `src/constants.mjs`, `tests/**/*.mjs` (`src/main.mjs` excluded on purpose).
- `tests/constants.test.mjs`: 3 `node:test` tests (pure `diagnosticMessage` twice, manifest/`SYSTEM_ID` consistency).
- `docs/DEVELOPMENT.md`: commands table and "`checkJs` coverage" section naming `src/constants.mjs` + `tests/` as covered, `src/main.mjs` as excluded because no Foundry declarations are installed.
- Not yet shown: proof the three commands pass in a clean state (never run as part of #4). Issue #4 acceptance boxes are unchecked.

## 4. Architecture decisions
- Plan is mainly a **verification** plan: change files only where a check fails or a doc gap is found.
- Keep `src/main.mjs` excluded from `checkJs`; extending it is deferred until Foundry API declarations are examined (brief P2).
- No community Foundry types package.
- `checkJs` stays `strict`; do not loosen options to make things pass.
- Verify any change to scripts or tsconfig against current TypeScript 7 and Node docs, not memory.

## 5. Work plan
1. Run from a clean state (`rm -rf node_modules && npm ci`, or at minimum `npm ci`) to prove the lockfile is enough.
2. Run `npm run typecheck`; expect exit 0, no emitted file. Confirm `tsc` binary resolves with TypeScript 7.
3. Run `npm test`; expect 3 passing tests, exit 0. Check that `node --test tests/` really discovers `tests/constants.test.mjs` on the installed Node (directory-argument handling differs between Node versions); if it runs 0 tests or errors, switch to an explicit glob/file form and note it.
4. Run `npm run check`; expect typecheck then test, exit 0.
5. Negative checks (temporary, reverted): introduce a type error in `src/constants.mjs` and a failing assertion to confirm each command exits non-zero, and that `check` stops at the first failure. Do not commit.
6. Check coverage statement: `docs/DEVELOPMENT.md` must say what `checkJs` covers (`src/constants.mjs`, `tests/`), what it does not (`src/main.mjs`, every Foundry global: `Hooks`, `game`, `CONFIG`, documents, sheets), and that those need in-Foundry checks. Add the missing wording only if absent; mention that Node tests do not cover Foundry integration.
7. Confirm no `.ts` file and no build output tracked; `node_modules/` ignored.
8. Record results (command, exit code, test count, Node/TypeScript versions) in `docs/DEVELOPMENT.md` if not already present.
9. Wrap-up: report evidence so the maintainer ticks the two acceptance criteria on issue #4 (outside this plan); check Git state.

## 6. Likely modified files
- Modified (only if gaps found): `docs/DEVELOPMENT.md`.
- Modified only on failure: `package.json`, `tsconfig.json`, `tests/constants.test.mjs`, `src/constants.mjs`.
- Do not edit by hand: `CLAUDE.md`, `AGENTS.md`, `.claude/`, `.agents/`.

## 7. Expected tests
- `npm run typecheck`: exit 0.
- `npm test`: 3 tests pass; at least one on a pure function (`diagnosticMessage`).
- `npm run check`: exit 0, and non-zero when either part fails (negative check).
- Foundry-side: nothing new; `src/main.mjs` and Foundry APIs stay manual in-runtime checks (already recorded for #3).

## 8. Risks and mitigations
- `node --test tests/` directory argument may not discover tests on Node 26 → verify in step 3, use explicit glob if needed.
- TypeScript 7 changes (`tsc` native port, option defaults) could break `NodeNext`/`types` settings → run clean, read the error, fix minimally.
- False sense of safety from a green `check` → coverage section must be explicit that Foundry code is unchecked.
- Scope drift into Foundry typings or #5 docs → forbidden by section 2.

## 9. Stop criteria
- Any command fails and the cause is not a local config defect: stop and report with exact output.
- A fix would require Foundry type declarations or a new dependency: stop, ask the maintainer.
- Any request touching data models, sheets or Mon rules: out of scope, escalate.
