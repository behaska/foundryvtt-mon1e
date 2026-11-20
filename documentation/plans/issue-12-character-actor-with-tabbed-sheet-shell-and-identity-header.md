# Implementation plan — Character actor with tabbed sheet shell and identity header
**Issue**: https://github.com/behaska/foundryvtt-mon1e/issues/12 (parent: #10, blocked by #11)
**ADR**: none (no ADR directory configured)
**Likely impacted modules**: `src/main.mjs`, `src/models/` (new), `src/sheets/` (new), `src/foundry/` (new, registration), `templates/` (new), `lang/` (new), `styles/` (new, minimal), `system.json`, `tsconfig.json`, `tests/`, `docs/`

Framing source: `documentation/cadrage/bootstrap/bootstraping-initial-project.md` (French), P3 (`TypeDataModel` + `CONFIG.Actor.dataModels`) and P4 (`ActorSheetV2` + `HandlebarsApplicationMixin`, `DocumentSheetConfig.registerSheet`).
Target path once plan mode ends: `documentation/plans/issue-12-character-actor-with-tabbed-sheet-shell-and-identity-header.md` (flat, English). Plan mode allows only this file; copy it there on approval.

## 1. Objective
Ship the `character` Actor type and a tabbed `ActorSheetV2` sheet. Page 1 is the first tab and shows the identity header fields, editable and persistent. The tab structure is ready for pages 2-4. Raw values only, no Mon rule invented.

## 2. Scope
### Included
- `character` Actor `TypeDataModel` with identity fields only: Name (Actor `name`, not in `system`), Species, Ancestry, Moon Signature, Kaon, Zaon, Zaon Scars, Class, Sub-Class, Level (3 rows), Might, Archetype.
- Registration: `system.json` `documentTypes.Actor.character`, `CONFIG.Actor.dataModels.character`, `DocumentSheetConfig.registerSheet`.
- Sheet shell: `HandlebarsApplicationMixin(ActorSheetV2)`, tab navigation with "Page 1" active and placeholder-free structure ready for pages 2-4 (tab list is data, adding a page = adding a part + tab entry).
- Identity form fields editable, saved through the form handler into `actor.update`.
- `lang/en.json` + `system.json` `languages`; all visible labels via i18n.
- Pure helpers (defaults, Level row normalisation) Foundry-free in `src/rules/` or `src/models/`, with `node:test`.
- Docs: `docs/DEVELOPMENT.md` in-Foundry verification record, `docs/DECISIONS.md` rows, `docs/RULES.md` only to note field storage (no rule).

### Out of scope
- Centre diagram, Attributes, Aptitudes, Skills, Brawls, Encounters, Health/Composure, Talents, flags (later #10 children; pages 2-4).
- Bounds, clamping, derived values, rolls, any Mon mechanic (RULES.md section B).
- Item types, compendiums, migrations, theming beyond minimal CSS.
- Build step, bundler, framework, `.ts` files, Foundry types package.
- Editing generated files (`CLAUDE.md`, `AGENTS.md`, `.claude/`, `.agents/`); ticking issue boxes; closing or reducing #7 (maintainer decides).

## 3. Existing state
- Scaffold only: `src/main.mjs` (`init` hook logs diagnostic), `src/constants.mjs`, `tests/constants.test.mjs`. `system.json` has no `documentTypes`, `languages`, `styles`. `tsconfig.json` `include` covers `src/constants.mjs` and `tests/**/*.mjs`.
- No `src/models`, `src/sheets`, `templates`, `lang`, `styles`.
- `docs/RULES.md` section A1-A9 answered by maintainer on 2026-11-20 but **not confirmed by the creator**. Relevant: A1 (page 1 = one character), A2 (integers for Kaon, Zaon, Zaon Scars, Might, Level), A8 (free text; Class/Sub-Class/Level are lists of separate entries, 3 is not a limit), A9 (empty number 0, empty text blank). Min/max/negatives deferred (B).
- #7 plan (data model + sheet for the first rule) exists and overlaps; #6 unresolved. This issue supersedes the model/sheet part of #7 for the character; maintainer decides #7's fate.
- Blocked by #11 (inventory). Inventory landed in `docs/RULES.md`; creator confirmation still pending (section C).

## 4. Architecture decisions
- **Gate**: #11 done and A1/A2/A8/A9 answers present in `RULES.md`. Creator confirmation pending is acceptable only if the maintainer says so; record "unconfirmed" in DECISIONS.md. Otherwise stop.
- Name lives on the Actor document (`name`), not in `system`. Sheet header edits `name` via the form.
- Fields as stored (all from RULES.md answers, nothing new):
  - Strings: `species`, `ancestry`, `moonSignature`, `archetype`.
  - Integers (`NumberField`, `integer: true`, initial 0, no min/max, per A2/A9/B): `kaon`, `zaon`, `zaonScars`, `might`.
  - Class/Sub-Class/Level: one `ArrayField` of row objects `{ class, subClass, level }` (text, text, integer initial 0). Initial value = 3 empty rows (matches printed layout). Not a limit: no cap in the model; adding rows via (+) is left to a later issue unless trivially in scope. **Open choice, see section 8.**
- Tab structure: ApplicationV2 `tabs` config with a `TABS` group; each page one template part (`PARTS`) toggled by tab. Page 1 is the only tab now; pages 2-4 added by appending a tab entry + part. No empty placeholder tabs shown to the user.
- Keep Foundry code thin: `src/main.mjs` calls `registerModels()` and `registerSheets()` from `src/foundry/` in `init`. Pure normalisation (e.g. default Level rows, integer coercion helper) in `src/rules/`, Foundry-free, tested.
- Never mutate `actor.system`; edits via form submit (`submitOnChange`) → `document.update`. Input `name` attributes must be `system.<field>` paths; array rows `system.levels.0.class` style (verify how v14 form data handles arrays; use `foundry.utils.expandObject` behavior as documented).
- Verify every v14 API name against official docs before use: `TypeDataModel.defineSchema`, `foundry.data.fields.{StringField,NumberField,ArrayField,SchemaField}`, `CONFIG.Actor.dataModels`, `system.json` `documentTypes`, `ActorSheetV2`, `HandlebarsApplicationMixin`, `PARTS`/`TABS`/`DEFAULT_OPTIONS`/`_prepareContext`, `DocumentSheetConfig.registerSheet`. Record what was checked.
- One shared constant for the type id `character` across `documentTypes`, `dataModels`, sheet registration.
- i18n keys namespaced `MON1E.*`; `lang/en.json` with `system.json` `languages` entry.
- `tsconfig.json` `include` extended only for Foundry-free files; state honestly that `checkJs` does not cover model/sheet/registration.

## 5. Work plan
1. Gate: read `docs/RULES.md` (A1, A2, A8, A9 present). Stop if missing.
2. Check v14 docs for the APIs listed in section 4; note findings.
3. Tests first for pure helpers (default Level rows, integer coercion), then implement in `src/rules/`.
4. Add `src/models/character.mjs` (`TypeDataModel` subclass, `defineSchema` per section 4) and `src/foundry/register.mjs` (models + sheets); keep `src/main.mjs` thin.
5. `system.json`: add `documentTypes.Actor.character`, `languages`, `styles` (if CSS added).
6. `lang/en.json`: labels for tab "Page 1", every identity field, Level row headings.
7. `src/sheets/character-sheet.mjs` + `templates/character-sheet.hbs` (header with name, tab nav, page 1 part with identity fields). Minimal `styles/mon1e.css` only if layout needs it.
8. Wire registration in the `init` hook; unregister core default sheet for `character` if needed via `registerSheet` options.
9. `node --test`, `npm run typecheck`, `npm run check`.
10. Manual Foundry validation in world `mon1e-test` (see section 7).
11. Docs: `docs/DEVELOPMENT.md` verification record (date, Foundry build, results, `checkJs` coverage); `docs/DECISIONS.md` rows (type `character`, Level row structure, tab approach, creator confirmation status); `docs/RULES.md` only to mark which fields are stored.
12. Wrap-up: evidence per acceptance criterion; maintainer ticks boxes. Separate commits: code, docs, plan.

## 6. Likely modified files
- New: `src/models/character.mjs`, `src/sheets/character-sheet.mjs`, `src/foundry/register.mjs`, `src/rules/<helper>.mjs`, `templates/character-sheet.hbs`, `lang/en.json`, `styles/mon1e.css` (if needed), `tests/<helper>.test.mjs`.
- Modified: `src/main.mjs`, `system.json`, `tsconfig.json` (only for Foundry-free files), `docs/DEVELOPMENT.md`, `docs/DECISIONS.md`, possibly `docs/RULES.md`.
- Do not edit by hand: `CLAUDE.md`, `AGENTS.md`, `.claude/`, `.agents/`.
- Names are proposals; follow existing local conventions if they differ.

## 7. Expected tests
- `node:test` for pure helpers: defaults (0 / blank / 3 empty Level rows), integer coercion edge cases. No bounds tests (none confirmed).
- `npm run typecheck`, `npm test`, `npm run check` exit 0.
- Manual Foundry runtime (only coverage for model, registration, sheet):
  1. Create actor type `character`; sheet opens on Page 1 tab.
  2. Edit every field (name, species, ancestry, moon signature, kaon, zaon, zaon scars, class/sub-class/level rows, might, archetype); close sheet; reopen, values intact.
  3. Reload world (F5) and close/reopen world; values intact.
  4. Console shows no error or deprecation warning.
  5. Labels show i18n text, no raw keys.
  6. Tab strip works; structure accepts a second tab without rework (reviewed in code, not shipped).
  Record date, Foundry build, results in `docs/DEVELOPMENT.md`.
- Do not claim Foundry coverage from `npm run check`.

## 8. Risks and mitigations
- Creator has not confirmed the A answers → record status "unconfirmed" in DECISIONS.md; field set may change, keep model small.
- Class/Sub-Class/Level shape ambiguous (one list of `{class, subClass, level}` rows vs three parallel lists) → chosen: one list of rows, as the sheet prints rows across three columns; confirm with maintainer before coding if unsure. Wrong choice costs a migration.
- Overlap with #7 → do not duplicate work; maintainer decides closing/reducing #7; cross-reference in DECISIONS.md.
- v14 API drift (training-memory) → check official docs per API; fail visibly in console.
- Array field form handling (row inputs not persisting) → test reload explicitly; fall back to per-row update only if the form handler cannot express it.
- Type id mismatch across `documentTypes` / `dataModels` / sheet registration → one shared constant.
- Tested on Foundry 14.369 vs 14.370 target → note build used.
- Scope creep into pages 2-4 fields or mechanics → defer, RULES.md section B.

## 9. Stop criteria
- #11 inventory or A answers missing from `RULES.md`.
- Implementation needs a type, range, bound or derived value not in `RULES.md`.
- A v14 API cannot be confirmed in official docs.
- Persistence fails after reload and cause is not a template/registration bug: stop, report console output.
- Work needs a build step, framework or Foundry types package: out of scope, escalate.
