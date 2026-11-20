# Implementation plan — Talents on the sheet
**Issue**: https://github.com/behaska/foundryvtt-mon1e/issues/19 (parent: #10, blocked by #12 and #11, both done)
**ADR**: none (no ADR directory configured)
**Likely impacted modules**: `src/rules/talents.mjs` (new), `src/models/character.mjs`, `src/sheets/character-sheet.mjs`, `templates/character-page1.hbs`, `lang/en.json`, `styles/mon1e.css`, `tests/talents.test.mjs` (new), `docs/`

Target path once plan mode ends: `documentation/plans/issue-19-talents-on-the-sheet.md` (flat, English). Plan mode allows only this file; copy it there on approval. Target does not exist; no near-duplicate in `documentation/plans/`.

## 1. Objective
Add Talents to the `character` Actor: an open-ended list of rows, each a label (text) and a value (whole number). Rows can be added and removed from page 1. Editable, persistent, labels via i18n. Raw values only.

## 2. Scope
### Included
- Item vs list decision: **embedded list** `system.talents` of `{ label, value }` rows, not Items. Recorded in `docs/DECISIONS.md`.
- (+) adds a blank row, a per-row remove button deletes that row.
- Pure helpers, model field, sheet section, i18n, CSS, tests, docs record.

### Out of scope
- Confirmation of Item vs list by the Mon creator (acceptance criterion): not doable in code. Decision rests on `RULES.md` A4 (answered by the maintainer, unconfirmed by the creator). Report as open in the wrap-up.
- Talent effects, prerequisites, descriptions, roll integration (RULES.md section B "Rolls").
- Two-column PDF layout (#20); the sheet renders a simple list, a CSS two-column grid is optional presentation only.
- Skills/Attributes (+) button, scars/disorders removal, migrations, new Item types, build step, `.ts` files.

## 3. Existing state
- `RULES.md` A4: a Talent is a label (text) and a value (number), no limit, added with a (+) button. A2: short Talent line is an integer. Inventory (line 81): two columns of rows, long line then short line, no printed label.
- `statRowsField`/`SchemaField` rows in `src/models/character.mjs` and `classLevels` (`{class, subClass, level}`) show the proven index-bound array-of-schema pattern (`system.classLevels.N.x`).
- #18 shipped sheet action `addDisorder` (append via full-array `document.update`) and `src/rules/scars.mjs` with seed helper. Same pattern reused here; no remove action exists yet.
- `RULES.md` line 133 defers how Talents combine in rolls.

## 4. Architecture decisions
- Embedded list: no Item type, no sidebar entries, no compendium; data stays on the Actor, migration-free, matches A4 and the Skills/classLevels style. Items would add a type, a sheet and drag/drop for no confirmed need.
- Model: `talents: new ArrayField(new SchemaField({ label: textField(), value: integerField() }), { initial: () => defaultTalentRows() })`.
- Pure module `src/rules/talents.mjs`: `defaultTalentRows()` (fresh array each call), `blankTalent()` (`{label:"", value:0}`), `removeRow(rows, index)` (returns new array, ignores out-of-range index). Foundry-free, unit-tested.
- Seed: 14 blank rows (the printed 2 columns × 7 rows) as a presentation seed, NOT a limit (A4). Flag this choice in DECISIONS.md; alternative is an empty list.
- Sheet actions: `addTalent` and `removeTalent` (`data-index`). Both build a new array from `this.document.toObject().system.talents` (plain copy, never mutate `system` in place) and call `document.update({ "system.talents": next })`. Validate index is an integer in range.
- Verify against Foundry v14 docs before coding: ArrayField of SchemaField replace-update persists; form binding `system.talents.N.label|value`; index shift after removal re-renders correctly.
- Context: `context.talents = system.talents.map((row, index) => ({ index, number: index + 1, label: row.label, value: row.value }))`.
- i18n: `MON1E.Character.talents`, `MON1E.Talents.label`, `MON1E.Talents.value`, `MON1E.Talents.add`, `MON1E.Talents.remove`, reusing the row `number` for aria-labels.
- Presentation: "Talents" fieldset in `character-page1.hbs`, text input + number input + remove button per row, (+) at the end; minimal CSS.

## 5. Work plan
1. Gate: #12 and #18 code present (`character-sheet.mjs`, `addDisorder`, `character-page1.hbs`); RULES.md A2, A4, A9 present. Else stop.
2. Tests first, `tests/talents.test.mjs`: `defaultTalentRows()` returns 14 blank rows, fresh array and fresh row objects per call; `blankTalent()` shape; `removeRow` removes the right index, returns a new array, leaves input untouched, ignores bad indexes; every talent i18n key exists in `lang/en.json`.
3. Create `src/rules/talents.mjs`.
4. `CharacterData.defineSchema`: add `talents`; update class doc.
5. `lang/en.json`: labels.
6. Sheet: add `addTalent`/`removeTalent` actions, extend `_prepareContext`.
7. `character-page1.hbs` Talents fieldset; CSS.
8. `npm run check`.
9. In-Foundry check (section 7); fix, re-check.
10. Docs: `docs/DECISIONS.md` row (embedded list vs Items, seed of 14); `docs/RULES.md` "Stored for talents" note (raw label + integer, unconfirmed by creator, no effect); `docs/DEVELOPMENT.md` verification record.
11. Wrap-up with evidence per criterion, flagging the creator-confirmation of Item vs list as open. Commits: code (+docs), then plan, separately.

## 6. Likely modified files
- New: `src/rules/talents.mjs`, `tests/talents.test.mjs`.
- Modified: `src/models/character.mjs`, `src/sheets/character-sheet.mjs`, `templates/character-page1.hbs`, `lang/en.json`, `styles/mon1e.css`, `docs/DEVELOPMENT.md`, `docs/DECISIONS.md`, `docs/RULES.md`.
- Do not edit by hand: `CLAUDE.md`, `AGENTS.md`, `.claude/`, `.agents/`.

## 7. Expected tests
- `node:test`: seed rows, blank row, `removeRow`, i18n coverage.
- `npm run typecheck`, `npm test`, `npm run check` exit 0.
- In-Foundry (only coverage for model, sheet, persistence), world `mon1e-test`, Foundry build noted:
  1. Existing actor opens: 14 blank talent rows, no migration, console clean.
  2. New actor: same.
  3. Type label and value in several rows, (+) adds a row, remove a middle row (rows below shift, values stay with their row); close and reopen sheet; intact.
  4. Reload (F5), close and reopen world; intact.
  5. Labels localized, no raw `MON1E.*`; other sections unaffected.
  Record in `docs/DEVELOPMENT.md`.
- Do not claim Foundry coverage from `npm run check`.

## 8. Risks and mitigations
- Creator has not confirmed Item vs list → list chosen from A4, flagged unconfirmed; migrating to Items later needs a data migration, noted in DECISIONS.md.
- Removal re-indexes inputs while `submitOnChange` may fire → remove action updates the whole array once, then re-render; verify in-world no stale value reappears.
- Existing actors lack `talents` → schema `initial` fills; verify on an existing actor.
- Empty-value inputs coerce to 0 (A9) → matches `integerField`.
- Scope creep into talent mechanics or layout → belongs to section B / #20.

## 9. Stop criteria
- #12, #18 code or RULES.md A2/A4/A9 missing.
- Needs a rule not in `RULES.md` (bounds, effects, prerequisites).
- Array replace or index binding does not persist and cause is not a template bug: stop, report console output.
- Work needs a build step, framework or Foundry types package: escalate.
