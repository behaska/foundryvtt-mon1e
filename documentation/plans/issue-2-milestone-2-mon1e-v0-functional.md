# Implementation plan — Milestone 2: Mon1e v0 functional
**Issue**: https://github.com/behaska/foundryvtt-mon1e/issues/2
**ADR**: none (no ADR directory configured)
**Likely impacted modules**: `system.json`, `src/main.mjs`, `src/models/` (new), `src/rules/` (new), `src/sheets/` (new), `templates/` (new), `styles/` (new), `lang/` (new), `tests/`, `tsconfig.json`, `package.json`, `docs/`

Framing source: `documentation/cadrage/bootstrap/bootstraping-initial-project.md` (in French), phases **P3 to P6**.

## 1. Objective
Deliver Mon1e v0: a first real data model, a persistent actor sheet and a first confirmed Mon mechanic, all with tests, packaged as a ZIP that installs and runs in a clean Foundry environment.

This plan is phase-level on purpose. The brief forbids choosing Actor/Item types, fields or the first mechanic before the Mon rules are confirmed by their author. Nothing about the rules is invented here.

## 2. Scope
### Included
- **P3**: minimal `Actor` (and possibly `Item`) types and their `TypeDataModel`, registered through `CONFIG.Actor.dataModels` / `CONFIG.Item.dataModels`.
- **P4**: first `ActorSheetV2` + Handlebars sheet registered with `DocumentSheetConfig.registerSheet`; create, edit, save, reload scenario.
- **P5**: one confirmed rule as a pure, testable function; integrated into the sheet, roll system or chat only as far as needed.
- **P6**: final checks, permissions review, ZIP packaging, clean-install test.
- `docs/RULES.md` (confirmed vs unknown rules) and `docs/DECISIONS.md`.

### Out of scope
- Any rule, type or field not confirmed by the rules author.
- Further mechanics, additional sheets, compendium content.
- CI/CD and GitHub Actions (deferred until the first distribution works), bundler or framework, manifest-URL auto-install.

## 3. Existing state
- Milestone 1 (#1) delivered `system.json`, `src/main.mjs`, `src/constants.mjs`, `tsconfig.json` (`checkJs` limited to pure code and tests), `node:test` tests and `npm run check`.
- No models, sheets, rules, templates, styles or lang files.
- No Mon rules documents in the repository.
- The manual Foundry verification of milestone 1 (system listed, world started, `init` message) is not confirmed yet.

## 4. Architecture decisions
- Vertical slices: each feature crosses data, rules, Foundry integration, UI and tests, only as far as needed (brief §6).
- Rules engine in `src/rules/`, independent of Foundry, unit-tested with `node:test`. Foundry integration lives in `src/foundry/` or the sheet layer and is tested in the real runtime.
- Create `src/models|rules|sheets`, `templates/`, `styles/`, `lang/` only when the current slice needs them (brief §7).
- User-visible text goes through localization in `lang/`; project language is English.
- Use native Foundry v14 APIs only; verify them against the official v14 documentation.
- **Open, blocking decisions** (owner input required, recorded in `docs/RULES.md`): which Actor/Item types, which fields, which first mechanic.

## 5. Work plan
0. **Prerequisites**: milestone 1 validated in Foundry; rules inventory provided by the Mon author (sources, confirmed rules, unknowns).
1. **P3 — Rules inventory**: write `docs/RULES.md` splitting confirmed rules from unknowns; select the minimum data needed for the first feature.
2. **P3 — Models**: define the first `TypeDataModel`(s) and declare the types in `system.json`; register them in the `init` hook; unit-test schema defaults and validation where testable without Foundry.
3. **P3 — Type checking**: extend the `tsconfig.json` scope to new pure modules; keep Foundry-dependent files out and state the coverage in `docs/DEVELOPMENT.md`.
4. **P4 — Sheet**: implement the `ActorSheetV2` class with `HandlebarsApplicationMixin`, its template and registration; add language strings and minimal styles.
5. **P4 — Persistence check (manual)**: create an actor, edit fields, save, close and reopen the world, confirm data is retained.
6. **P5 — Mechanic**: with the mechanic confirmed by the author, write tests first, then the pure function in `src/rules/`.
7. **P5 — Integration**: wire the function to the sheet and, if the rule requires it, to rolls and chat; verify in Foundry; the author validates the result against the rule.
8. **P6 — Stabilize**: run `npm run check`; review permissions (who can view/edit the sheet); fix defects found.
9. **P6 — Package**: prepare the manifest fields needed for a distributable archive, build the ZIP, bump the version, update docs and `DECISIONS.md`.
10. **P6 — Clean-install test**: install the ZIP manually in a clean Foundry environment, create a world, run the sheet and mechanic scenarios.
11. **Wrap-up**: tick the milestone criteria in issue #2 (outside this plan); commit milestone code separately from generated files.

## 6. Likely modified files
- Created: `src/models/*`, `src/rules/*`, `src/sheets/*`, `templates/*`, `styles/*`, `lang/en.json`, `tests/*`, `docs/RULES.md`, `docs/DECISIONS.md`.
- Modified: `system.json` (document types, languages, styles), `src/main.mjs`, `tsconfig.json`, `package.json`, `docs/DEVELOPMENT.md`.
- Do not edit by hand: `CLAUDE.md`, `AGENTS.md`, `.claude/`, `.agents/` (generated by `llm sync`, versioned).

## 7. Expected tests
- Unit tests (`node:test`) for models where Foundry-independent and for every rule function, including edge cases listed in `docs/RULES.md`.
- `npm run check` passes (typecheck + tests).
- Manual Foundry scenarios: sheet create/edit/save/reload persistence, permissions per role, mechanic through sheet/roll/chat.
- Clean-install test of the ZIP.
- Each result reported as passed / failed / not run.

## 8. Risks and mitigations
- Unconfirmed rules: nothing in P3 or P5 starts without author confirmation; unknowns stay in `docs/RULES.md`.
- Foundry v14 behavior not covered by `checkJs`: verify in the real runtime and state the real coverage.
- Scope creep toward additional mechanics or sheets: one feature at a time, explicit out of scope.
- Noisy diffs from generated files: rerun `llm sync` and commit them separately.
- Packaging unknowns (hosting, manifest URL): ZIP-only for v0; installation by URL stays out of scope.

## 9. Stop criteria
- Mon rules not confirmed: stop before P3 data choices and before P5.
- Milestone 1 not validated in Foundry: stop, do not start P3.
- Sheet data does not persist after reload: do not start P5.
- Clean-install test fails: do not tag or distribute v0.
- Any rule that must be guessed or silently changed: stop and ask the author.
