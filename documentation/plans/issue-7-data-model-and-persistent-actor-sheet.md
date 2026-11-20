# Implementation plan — Data model and persistent actor sheet for the first rule
**Issue**: https://github.com/behaska/foundryvtt-mon1e/issues/7 (parent: #2, blocked by #6)
**ADR**: none (no ADR directory configured)
**Likely impacted modules**: `src/main.mjs`, `src/models/` (new), `src/sheets/` (new), `templates/` (new), `lang/` (new), `system.json`, `tsconfig.json`, `tests/`, `docs/`

Framing source: `documentation/cadrage/bootstrap/bootstraping-initial-project.md` (French), P3 (first data model, `TypeDataModel` + `CONFIG.Actor.dataModels`) and P4 (first sheet via `ActorSheetV2` + `HandlebarsApplicationMixin`, `DocumentSheetConfig.registerSheet`; validation: edit, save, reopen world).
Target path once plan mode ends: `documentation/plans/issue-7-data-model-and-persistent-actor-sheet.md` (flat, English).

## 1. Objective
For the first confirmed rule, ship the minimal Actor data model and an actor sheet. An actor can be created, edited and saved from the sheet, and its data persists after closing and reopening the world.

## 2. Scope
### Included
- `TypeDataModel` for the Actor type(s) the confirmed rule needs; Item type only if the rule needs it (issue says "if needed").
- Registration through `CONFIG.Actor.dataModels` and `system.json` `documentTypes` for the Actor type(s).
- `ActorSheetV2` + `HandlebarsApplicationMixin` sheet and Handlebars template, registered with `DocumentSheetConfig.registerSheet`.
- Localization keys for visible labels, minimal styles only if needed.
- Unit tests for pure model parts; manual in-Foundry validation of create/edit/save/reload.
- Short docs update (`DEVELOPMENT.md` verification record, `DECISIONS.md` row).

### Out of scope
- The rule mechanic itself, rolls, chat messages (issue #8+, P5).
- Choosing or altering any Mon rule, field, type or range. Everything comes from confirmed `docs/RULES.md`.
- Extra Actor/Item types, tabs, theming, compendiums, migrations.
- Build step, bundler, framework, `.ts` files.
- Editing generated files (`CLAUDE.md`, `AGENTS.md`, `.claude/`, `.agents/`); ticking issue boxes.

## 3. Existing state
- Scaffold only: `src/main.mjs` (`init` hook logs diagnostic), `src/constants.mjs` (`SYSTEM_ID`, `diagnosticMessage`), `tests/constants.test.mjs` (3 tests).
- `system.json`: id `mon1e`, v0.0.1, compat 14, `esmodules: ["src/main.mjs"]`. No `documentTypes`, `languages`, `styles`.
- `tsconfig.json` `include`: `src/constants.mjs` and `tests/**/*.mjs`. `src/main.mjs` excluded; no Foundry types installed.
- `docs/RULES.md`: sources none, confirmed none, 3 unknowns. **Issue #6 is not resolved** (no rule documents, creator has not chosen).
- Layout dirs `src/models`, `src/sheets`, `templates`, `lang` do not exist yet.

## 4. Architecture decisions
- **Hard precondition**: #6 closed, with a creator-confirmed rule in `docs/RULES.md` naming data needs (Actor/Item types, fields, ranges, defaults). Without it, stop. Do not invent types or fields.
- Model split: pure field definition/validation helpers where feasible stay Foundry-free and unit-testable; the `TypeDataModel` subclass (needs `foundry.abstract.TypeDataModel`, `foundry.data.fields`) lives in `src/models/` and is Foundry-only, not covered by `checkJs`.
- Registration in the `init` hook of `src/main.mjs`, following the existing pattern; one small registration function per concern (models, sheets) to keep `main.mjs` thin.
- Sheet: `foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.sheets.ActorSheetV2)`, `PARTS` with one template, form submission handled by the built-in `submitOnChange`/form handler so edits go through `document.update`. Never mutate `actor.system` directly.
- `documentTypes` in `system.json` must list the Actor type id(s); type id and model key must match.
- Verify every v14 API name and signature against official Foundry v14 docs before use (CLAUDE.md rule); record what was checked.
- Labels via `lang/en.json` and `game.i18n`; `system.json` `languages` entry added.
- Expand `tsconfig.json` `include` only for pure Foundry-free files; do not add Foundry types.
- State honestly in docs: `checkJs`/`node:test` do not cover model/sheet runtime behavior.

## 5. Work plan
1. Gate: read `docs/RULES.md`; confirm a creator-confirmed rule and its data needs exist. Else stop with the blocker.
2. Check v14 docs for: `TypeDataModel` + `defineSchema`, `CONFIG.Actor.dataModels`, `system.json` `documentTypes`, `ActorSheetV2`, `HandlebarsApplicationMixin`, `DocumentSheetConfig.registerSheet`, `PARTS`/`DEFAULT_OPTIONS`/`_prepareContext`, form handling. Note findings in the verification record.
3. Add pure, Foundry-free helpers (if the rule has any validation/derivation) in `src/models/` or `src/rules/`, with tests first.
4. Add the Actor `TypeDataModel` (fields exactly as confirmed) in `src/models/`.
5. Add `documentTypes` to `system.json`; add `lang/en.json` and `languages` entry.
6. Add sheet class in `src/sheets/` and template in `templates/`; labels via i18n.
7. Wire registration in `src/main.mjs` `init` hook: `CONFIG.Actor.dataModels`, unregister default sheet if needed, `DocumentSheetConfig.registerSheet`.
8. Unit tests with `node --test tests/<file>.test.mjs`; then `npm run check`.
9. Manual Foundry validation in world `mon1e-test`: create actor of the new type, open sheet, edit each field, close; confirm console has no error; close world, reopen, confirm values persisted; also reload (F5).
10. Update `docs/DEVELOPMENT.md` (verification record, new files, `checkJs` coverage), `docs/DECISIONS.md` (types and sheet choices, citing `RULES.md`), `docs/RULES.md` unknowns resolved only if the rule source says so.
11. Wrap-up: report evidence per acceptance criterion; maintainer ticks boxes. Separate commits: milestone code, docs, plan.

## 6. Likely modified files
- New: `src/models/<actor-type>.mjs`, `src/sheets/<actor-type>-sheet.mjs`, `templates/<actor-type>-sheet.hbs`, `lang/en.json`, `tests/<model>.test.mjs`.
- Modified: `src/main.mjs`, `system.json`, `tsconfig.json` (only if Foundry-free files added), `docs/DEVELOPMENT.md`, `docs/DECISIONS.md`, possibly `docs/RULES.md`.
- Do not edit by hand: `CLAUDE.md`, `AGENTS.md`, `.claude/`, `.agents/`.
- Names shown are placeholders; real names follow the confirmed rule.

## 7. Expected tests
- `node:test` for pure helpers: defaults, bounds and edge cases taken from confirmed `RULES.md`; none where the rule has no pure logic (state reason).
- `npm run typecheck`, `npm test`, `npm run check` exit 0.
- Manual Foundry runtime (the only coverage for model, registration, sheet): create, edit, save, close sheet, reload world, data intact; no console error. Record date, Foundry build, results.
- Do not claim Foundry coverage from `npm run check`.

## 8. Risks and mitigations
- #6 unresolved → whole issue blocked; do not guess types/fields. Planning is done now, implementation waits.
- Wrong v14 API usage (training-memory drift) → check official docs per API; fail visibly in console.
- Type id mismatch between `documentTypes`, `CONFIG.Actor.dataModels`, sheet registration → one constant shared across the three.
- Data not persisting (direct mutation, wrong `name` attributes in template) → edits only through form → `update`; test reload explicitly.
- Foundry 14.369 tested vs 14.370 target → note build used.
- Scope creep into rolls/derived stats → defer to P5 issue.

## 9. Stop criteria
- No confirmed rule or no data needs in `docs/RULES.md`.
- Implementation requires choosing a type, field, range or rule not in `RULES.md`.
- A v14 API cannot be confirmed in official docs.
- Persistence fails after reload and cause is not a template/registration bug: stop, report console output.
- Work needs a build step, framework or Foundry types package: out of scope, escalate.
