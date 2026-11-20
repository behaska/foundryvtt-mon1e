# Implementation plan — Scars and Disorders (Road, Drive, Group) on the sheet
**Issue**: https://github.com/behaska/foundryvtt-mon1e/issues/18 (parent: #10, blocked by #12 and #11, both done)
**ADR**: none (no ADR directory configured)
**Likely impacted modules**: `src/rules/tracks.mjs`, `src/rules/scars.mjs` (new), `src/models/character.mjs`, `src/sheets/character-sheet.mjs`, `templates/character-page1.hbs`, `lang/en.json`, `styles/mon1e.css`, `tests/scars.test.mjs` (new), `docs/`

Target path once plan mode ends: `documentation/plans/issue-18-scars-and-disorders-road-drive-group-on-the-sheet.md` (flat, English). Plan mode allows only this file; copy it there on approval. Target does not exist; no near-duplicate in `documentation/plans/`.

## 1. Objective
Add Road, Drive and Group Scars (gauges) and Road, Drive and Group Disorders (lists of free-text lines) to the `character` Actor. Editable on sheet page 1, persistent, labels via i18n. Raw values only.

## 2. Scope
### Included
- Three scar gauges `roadScars`, `driveScars`, `groupScars`: checked-box count (integer, default 0), adjusted with (+)/(-) like Health/Composure (RULES.md A6, A9). No state flags.
- Three disorder lists `roadDisorders`, `driveDisorders`, `groupDisorders`: ordered free-text entries (A8). Seeded with 3 blank lines (printed layout); "three is not a limit", so a (+) button appends a line.
- Pure helpers, model fields, sheet section, i18n, CSS, tests, docs record.

### Out of scope
- Confirming scar box counts with the creator (acceptance criterion): not doable in code. Sheet draws the placeholder minimum (`DISPLAY_MIN_BOXES`, 6, not a rule); the "3 per the PDF" in the issue stays an unconfirmed open question in `RULES.md`. Report it in the wrap-up as an unmet-by-code criterion needing the creator.
- Any link or effect between Scars and Disorders, bounds, clamping, derived values (RULES.md section B).
- Removing or reordering disorder lines (not requested; revisit when needed).
- Talents (#19), faithful layout (#20), migrations, new Item types, build step, `.ts` files.

## 3. Existing state
- #16 shipped `trackField(stateKeys)`, `adjustFilled`, `boxesToDraw`, `DISPLAY_MIN_BOXES` in `src/rules/tracks.mjs`; sheet action `adjustTrack` with `TRACKS = ["health","composure"]`; template renders gauges via `healthTrack`/`composureTrack` context built by the `track()` closure in `_prepareContext`.
- `textField()`, `integerField()`, array fields (`classLevels`, bound as `system.classLevels.N.x`) exist in `src/models/character.mjs`.
- `RULES.md` line 129 already lists "Relation between Scars and Disorders, and whether three lines is a limit" as deferred.
- No (+) add-row action exists yet in the sheet (only `adjustTrack`).

## 4. Architecture decisions
- Scars reuse `trackField([])` (filled only; empty state list). Keeps one gauge concept, `system.roadScars.filled`.
- Generalize `adjustTrack`: `TRACKS` becomes `["health","composure","roadScars","driveScars","groupScars"]`. Export the key list from a pure module (`src/rules/scars.mjs`: `SCAR_KEYS`, `DISORDER_KEYS`, `defaultDisorderLines()` returning 3 blanks) so tests cover it.
- Disorders: `ArrayField(StringField({required:true, blank:true, initial:""}))` with `initial: () => defaultDisorderLines()`. Bind each line as `name="system.roadDisorders.N"`. New sheet action `addDisorder` (`data-list`) appends `""` via `document.update` with a full new array (never mutate `system` in place); validate `data-list` against `DISORDER_KEYS`.
- Verify against Foundry v14 docs before coding: ArrayField of StringField form binding by index, and that updating an ArrayField with a replaced array persists.
- Context: refactor `track()` closure to also serve scars (no state rows), plus a `disorders` row list `{ key, label, lines: [{index, value}] }`.
- i18n: `MON1E.Tracks.roadScars|driveScars|groupScars`, `MON1E.Disorders.roadDisorders|driveDisorders|groupDisorders`, `MON1E.Disorders.add`.
- Presentation: one "Scars and Disorders" fieldset per group (Road, Drive, Group) in `character-page1.hbs`; styling minimal in `styles/mon1e.css`.

## 5. Work plan
1. Gate: #12, #16, #17 code present (`trackField`, `adjustTrack`, `character-page1.hbs`); RULES.md A6, A8, A9 present. Else stop.
2. Tests first, `tests/scars.test.mjs`: `SCAR_KEYS` and `DISORDER_KEYS` exact and in order (road, drive, group); `defaultDisorderLines()` returns 3 blank strings and a fresh array each call; every key has an i18n label in `lang/en.json`.
3. Create `src/rules/scars.mjs`.
4. `CharacterData.defineSchema`: add scar tracks and disorder arrays; update class doc.
5. `lang/en.json`: labels.
6. Sheet: extend `TRACKS`, add `addDisorder` action, extend `_prepareContext`.
7. `character-page1.hbs`: scar gauges (reuse the track markup, ideally as a partial or loop) and disorder inputs with (+) button. CSS.
8. `npm run check`.
9. In-Foundry check (section 7); fix, re-check.
10. Docs: `docs/DEVELOPMENT.md` verification record; `docs/DECISIONS.md` row (scars as gauges, disorders as open-ended seeded list); `docs/RULES.md` note under "Stored for ..." that Scars/Disorders are stored raw, unconfirmed by creator, scar box count still unconfirmed.
11. Wrap-up with evidence per criterion, flagging the creator-confirmation criterion as open. Commits: code (+docs), then plan, separately.

## 6. Likely modified files
- New: `src/rules/scars.mjs`, `tests/scars.test.mjs`.
- Modified: `src/models/character.mjs`, `src/sheets/character-sheet.mjs`, `templates/character-page1.hbs`, `lang/en.json`, `styles/mon1e.css`, `docs/DEVELOPMENT.md`, `docs/DECISIONS.md`, `docs/RULES.md`.
- Do not edit by hand: `CLAUDE.md`, `AGENTS.md`, `.claude/`, `.agents/`.

## 7. Expected tests
- `node:test`: key lists and order, default disorder lines, i18n coverage.
- `npm run typecheck`, `npm test`, `npm run check` exit 0.
- In-Foundry (only coverage for model, sheet, persistence), world `mon1e-test`, Foundry build noted:
  1. Existing actor opens: scars 0, three blank lines per group, no migration, console clean.
  2. New actor: same.
  3. (+)/(-) each scar gauge, type in each disorder line, press (+) to add a fourth line and fill it; close and reopen sheet; intact.
  4. Reload (F5), close and reopen world; intact.
  5. Labels localized, no raw `MON1E.*`; Health, Composure, diagram unaffected.
  Record in `docs/DEVELOPMENT.md`.
- Do not claim Foundry coverage from `npm run check`.

## 8. Risks and mitigations
- Creator has not confirmed scar box counts or the line count → raw values, placeholder display minimum, flagged in RULES.md.
- Existing actors lack new data → schema `initial` fills; verify on an existing actor.
- ArrayField index binding or array replace not persisting → verify in-world; fall back to the `classLevels` pattern already proven.
- Concurrent update of whole array overwrites a line → acceptable single-user sheet; submitOnChange per field limits exposure.
- Scope creep into Scar/Disorder mechanics or layout → belongs to section B / #20.

## 9. Stop criteria
- #12, #16, #17 code or RULES.md A6/A8/A9 missing.
- Needs a bound, clamp, derived value or any rule not in `RULES.md`.
- Fields do not persist and cause is not a template bug: stop, report console output.
- Work needs a build step, framework or Foundry types package: escalate.
