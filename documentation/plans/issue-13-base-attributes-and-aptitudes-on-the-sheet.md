# Implementation plan — Base attributes and aptitudes on the sheet
**Issue**: https://github.com/behaska/foundryvtt-mon1e/issues/13 (parent: #10, blocked by #12, done)
**ADR**: none (no ADR directory configured)
**Likely impacted modules**: `src/models/character.mjs`, `src/rules/` , `src/sheets/character-sheet.mjs`, `templates/`, `lang/en.json`, `styles/mon1e.css`, `tests/`, `docs/`

Target path once plan mode ends: `documentation/plans/issue-13-base-attributes-and-aptitudes-on-the-sheet.md` (flat, English). Plan mode allows only this file; copy it there on approval.

## 1. Objective
Add the 8 base attributes and 7 base aptitudes to the `character` Actor as raw whole numbers, editable on sheet page 1, persistent, labels via i18n.

## 2. Scope
### Included
- Attributes: Strength, Toughness, Agility, Perception, Charisma, Resolve, Intelligence, Spirit.
- Aptitudes: Close Combat, Ranged Combat, Battle, Moon Magic, Spirit Magic, Kaon Magic, Cosmic Magic.
- Model fields, sheet sections on page 1 (templates), i18n labels, minimal CSS, tests, docs record.

### Out of scope
- (+) add-element button, custom labels, removal rules (maintainer decision: later issue). Skills, Brawls, Encounters, Talents, diagram, Health/Composure.
- Bounds, clamping, derived values, rolls, any Mon mechanic (RULES.md section B).
- Migrations, new Item types, build step, framework, `.ts` files.
- Editing generated files; ticking issue boxes.

## 3. Existing state
- #12 shipped (commit `5a21c54`): `CharacterData` in `src/models/character.mjs` (private helpers `integerField`, `textField`, `classLevels` ArrayField with `defaultClassLevelRows`), `CharacterSheet` with `TABS.primary` (`page1`) and parts `header`, `tabs`, `page1` (`templates/character-page1.hbs`), `lang/en.json` (`MON1E.Character.*`), `tests/identity.test.mjs` (includes a test that every `localize` key in templates exists in `lang/en.json`; its template list is hard-coded).
- `docs/RULES.md` A2 (integers), A3 (three lists of {label, value}; printed names are non-removable starting entries; (+) adds more), A9 (empty number 0). Min/max deferred (B).
- Array rows named `system.classLevels.N.field` already verified persistent in Foundry.

## 4. Architecture decisions
- Maintainer choice: store as **arrays of rows** so A3's extensible lists need no migration later.
  - `attributes`: ArrayField of `{ key: string, value: integer }`; `aptitudes` same shape.
  - Base rows are seeded by default (ordered as printed), keyed by stable ids (e.g. `strength`, `closeCombat`). Visible label for a base key comes from i18n (`MON1E.Attributes.<key>`, `MON1E.Aptitudes.<key>`), not stored. A later (+) issue adds an optional custom `label` field to rows; not added now (no speculative fields).
- Pure helpers (Foundry-free, `src/rules/`): ordered lists of base keys and a `defaultRows(keys)` builder returning `{key, value: 0}` rows. Reuse the pattern of `src/rules/identity.mjs`.
- Existing actors (created before this change) have no `attributes`/`aptitudes`: `ArrayField` `initial` applies to missing data on validation, so they get the defaults; verify in Foundry with the actor made in #12. No migration script.
- Sheet: extend `character-page1.hbs` with two sections iterating over `source.system.attributes` / `aptitudes` with input names `system.attributes.{{@index}}.value`. Key stays unchanged on submit (hidden input `system.attributes.N.key` so the array row is submitted whole; confirm at runtime whether the form handler needs it).
- Labels via `{{localize}}` built from the row key; add keys to `lang/en.json`. The i18n key test must resolve dynamic keys: extend `tests/` to check that every base key has a label in `lang/en.json`.
- Names as printed in the PDF inventory (`docs/RULES.md`): attributes in UPPERCASE there, shown in title case in i18n; label casing is presentation only, record in DECISIONS.
- Never mutate `actor.system`; edits via the existing form submit. No Foundry API beyond those already in use in #12.

## 5. Work plan
1. Gate: #12 present (`CharacterData`, page1 template); `RULES.md` A2/A3/A9 present. Else stop.
2. Tests first: `tests/` for the base key lists (8 and 7, printed order, no duplicates) and `defaultRows` (value 0, independent objects); manifest/i18n test extended so every base key has a label.
3. Implement helpers in `src/rules/` (e.g. `base-stats.mjs`); keep it in the `tsconfig.json` include (`src/rules/**`).
4. Extend `CharacterData.defineSchema` with `attributes` and `aptitudes`.
5. Add i18n labels (section titles + 15 names) to `lang/en.json`.
6. Extend `character-page1.hbs` with the two sections; minimal CSS in `styles/mon1e.css`.
7. `npm run check`.
8. In-Foundry check (section 7); fix, re-check.
9. Docs: `docs/DEVELOPMENT.md` verification record, `docs/DECISIONS.md` rows (rows-of-{key,value} shape, i18n label source, (+) deferred), `docs/RULES.md` only to note what is now stored (no rule change).
10. Wrap-up with evidence per criterion; commits: milestone code (+docs), then plan, separately.

## 6. Likely modified files
- New: `src/rules/base-stats.mjs`, `tests/base-stats.test.mjs`.
- Modified: `src/models/character.mjs`, `templates/character-page1.hbs`, `lang/en.json`, `styles/mon1e.css`, `tests/identity.test.mjs` (only if its hard-coded template list or key check needs it), `docs/DEVELOPMENT.md`, `docs/DECISIONS.md`, possibly `docs/RULES.md`.
- Do not edit by hand: `CLAUDE.md`, `AGENTS.md`, `.claude/`, `.agents/`.

## 7. Expected tests
- `node:test`: 8 attribute keys and 7 aptitude keys in printed order, no duplicates; default rows have value 0 and are independent; every key has an i18n label in `lang/en.json`.
- `npm run typecheck`, `npm test`, `npm run check` exit 0.
- In-Foundry (only coverage for model/sheet), world `mon1e-test`, Foundry build noted:
  1. Open the existing #12 actor: both sections appear with defaults 0 (no migration needed).
  2. Create a new actor: same.
  3. Edit all 15 values; close and reopen sheet; intact.
  4. Reload (F5), close and reopen world; intact.
  5. Labels localized, no raw `MON1E.*` keys; console clean.
  Record in `docs/DEVELOPMENT.md`.
- Do not claim Foundry coverage from `npm run check`.

## 8. Risks and mitigations
- Array rows with `key` not submitted → values attach to the wrong row or the row loses its key → hidden `key` input; test reload explicitly.
- Existing actors lack the new fields → rely on `initial`; verify on the #12 actor; fall back to a defaulting step only if it fails.
- A3's (+) and custom labels later may need an extra `label` field → additive change, no migration of existing rows.
- Label casing differs from PDF → presentation only; record in DECISIONS.
- Unconfirmed A answers (creator has not confirmed) → note status in DECISIONS.md; keep model small.
- Scope creep into Skills (same list shape) → separate issue.

## 9. Stop criteria
- #12 code or A2/A3/A9 answers missing.
- Needs a bound, range, derived value or rule not in `RULES.md`.
- Array submission cannot persist rows and the cause is not a template bug: stop, report console output.
- Work needs a build step, framework or Foundry types package: escalate.
