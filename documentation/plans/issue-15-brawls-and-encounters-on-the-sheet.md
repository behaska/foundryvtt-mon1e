# Implementation plan — Brawls and Encounters on the sheet
**Issue**: https://github.com/behaska/foundryvtt-mon1e/issues/15 (parent: #10, blocked by #12, done)
**ADR**: none (no ADR directory configured)
**Likely impacted modules**: `src/rules/base-stats.mjs`, `src/models/character.mjs`, `templates/character-page1.hbs`, `lang/en.json`, `styles/mon1e.css`, `tests/base-stats.test.mjs`, `docs/`

Target path once plan mode ends: `documentation/plans/issue-15-brawls-and-encounters-on-the-sheet.md` (flat, English). Plan mode allows only this file; copy it there on approval. Target does not exist; no near-duplicate in `documentation/plans/`.

## 1. Objective
Add Brawls (Armour, Weapon) and Encounters (Philosophy, Adornment) to the `character` Actor as raw whole numbers, editable on sheet page 1, persistent, labels via i18n.

## 2. Scope
### Included
- Four integer fields in two groups, as printed (`docs/RULES.md` "Brawls and Encounters"): Brawls: Armour, Weapon; Encounters: Philosophy, Adornment.
- Model fields, sheet section on page 1, i18n labels, minimal CSS, tests, docs record.

### Out of scope
- (+) add-element button, custom entries (A3 covers only Attributes/Aptitudes/Skills; none stated for Brawls/Encounters).
- Bounds, clamping, derived values, rolls, how Brawls/Encounters combine with other stats (RULES.md section B).
- Talents, Health/Composure, diagram, flags.
- Migrations, new Item types, build step, framework, `.ts` files.
- Editing generated files; ticking issue boxes.

## 3. Existing state
- #13/#14 shipped: `integerField()` and `statRowsField(keys)` in `src/models/character.mjs`; `base-stats.mjs` holds `ATTRIBUTE_KEYS`, `APTITUDE_KEYS`, `SKILL_KEYS`, `defaultStatRows`; page 1 template has three `fieldset.stat-list` sections; i18n groups `MON1E.Attributes/Aptitudes/Skills`; `tests/base-stats.test.mjs` checks keys, defaults, i18n coverage.
- `docs/RULES.md`: Brawls/Encounters printed as two groups of two short lines each. A2: integers. A9: empty number = 0. A3 lists are only Attributes/Aptitudes/Skills. Min/max deferred (B).

## 4. Architecture decisions
- Fixed, non-removable, non-extensible: model as two `SchemaField`s, not rows lists: `brawls: { armour, weapon }`, `encounters: { philosophy, adornment }`, each `integerField()` (initial 0). Simpler than rows; no `key` plumbing; missing data on existing actors filled by schema initial, no migration (verify).
- Add `BRAWL_KEYS = ["armour","weapon"]` and `ENCOUNTER_KEYS = ["philosophy","adornment"]` to `src/rules/base-stats.mjs`; model builds its schemas from them so keys have one source and tests can check i18n coverage purely.
- Sheet: no `_prepareContext` change needed if template names inputs `system.brawls.armour` etc. directly; labels via `{{localize "MON1E.Brawls.armour"}}`. Add two small fieldsets (or one section with two groups) in `character-page1.hbs`; reuse `stat-list` styling where it fits.
- i18n: `MON1E.Character.brawls`, `MON1E.Character.encounters` (group titles), `MON1E.Brawls.*`, `MON1E.Encounters.*`.
- Never mutate `actor.system`; edits via existing form submit. No new Foundry APIs.
- No Mon rule invented; no bounds.

## 5. Work plan
1. Gate: #12/#13/#14 code present (`integerField`, `base-stats.mjs`, page1 template); `RULES.md` A2/A9 present. Else stop.
2. Tests first in `tests/base-stats.test.mjs`: key lists exact and in printed order; every key has an i18n label; both group titles exist.
3. Add `BRAWL_KEYS`, `ENCOUNTER_KEYS` to `src/rules/base-stats.mjs`.
4. `CharacterData.defineSchema`: add `brawls`, `encounters` SchemaFields; update class doc comment.
5. `lang/en.json`: group titles + 4 labels.
6. `character-page1.hbs`: Brawls and Encounters fieldsets with number inputs (`step="1"`); minimal CSS only if needed.
7. `npm run check`.
8. In-Foundry check (section 7); fix, re-check.
9. Docs: `docs/DEVELOPMENT.md` verification record; `docs/DECISIONS.md` row (fixed SchemaFields, not lists, why); `docs/RULES.md` only to note what is now stored (no rule change).
10. Wrap-up with evidence per criterion; commits: code (+docs), then plan, separately.

## 6. Likely modified files
- Modified: `src/rules/base-stats.mjs`, `src/models/character.mjs`, `templates/character-page1.hbs`, `lang/en.json`, `styles/mon1e.css` (if needed), `tests/base-stats.test.mjs`, `docs/DEVELOPMENT.md`, `docs/DECISIONS.md`, possibly `docs/RULES.md`.
- `tests/identity.test.mjs`: only if hard-coded checks need it.
- Do not edit by hand: `CLAUDE.md`, `AGENTS.md`, `.claude/`, `.agents/`.

## 7. Expected tests
- `node:test`: key lists and order; i18n labels and group titles present.
- `npm run typecheck`, `npm test`, `npm run check` exit 0.
- In-Foundry (only coverage for model/sheet), world `mon1e-test`, Foundry build noted:
  1. Open existing actor: 4 fields show 0, no migration, console clean.
  2. New actor: same.
  3. Edit all 4; close and reopen sheet; intact.
  4. Reload (F5), close and reopen world; intact.
  5. Labels localized, no raw `MON1E.*` keys; attributes/aptitudes/skills unaffected.
  Record in `docs/DEVELOPMENT.md`.
- Do not claim Foundry coverage from `npm run check`.

## 8. Risks and mitigations
- Existing actors lack the new schema data → schema initial; verify on existing actor; defaulting step only if it fails.
- Nested field names `system.brawls.armour` not persisted → re-test reload; check form submit path.
- Page 1 grows long → sheet already `scrollable`.
- Scope creep into (+) lists/Talents → separate issues.

## 9. Stop criteria
- #12/#13/#14 code or A2/A9 answers missing.
- Needs a bound, range, derived value or rule not in `RULES.md`.
- Nested fields cannot persist and cause is not a template bug: stop, report console output.
- Work needs a build step, framework or Foundry types package: escalate.
