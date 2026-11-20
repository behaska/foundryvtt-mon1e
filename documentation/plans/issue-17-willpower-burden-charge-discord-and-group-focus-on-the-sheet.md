# Implementation plan — Willpower, Burden/Charge, Discord and Group Focus on the sheet
**Issue**: https://github.com/behaska/foundryvtt-mon1e/issues/17 (parent: #10, blocked by #12, done)
**ADR**: none (no ADR directory configured)
**Likely impacted modules**: `src/rules/diagram.mjs` (new), `src/models/character.mjs`, `templates/character-page1.hbs`, `lang/en.json`, `styles/mon1e.css`, `tests/diagram.test.mjs` (new), `docs/`

Target path once plan mode ends: `documentation/plans/issue-17-willpower-burden-charge-discord-and-group-focus-on-the-sheet.md` (flat, English). Plan mode allows only this file; copy it there on approval. Target does not exist; no near-duplicate in `documentation/plans/`.

## 1. Objective
Add the central-diagram data to the `character` Actor: five numbers (Willpower, Burden, Charge, Discord, Group Focus), two free texts (Focus Statement, Group Archetype) and eight independent flags. Editable on sheet page 1, persistent, labels via i18n. Raw values only.

## 2. Scope
### Included
- Integers (default 0, RULES.md A5, A9): `willpower`, `burden`, `charge`, `discord`, `groupFocus`.
- Texts (default blank, A8): `focusStatement` (multiline, per the PDF text area), `groupArchetype`.
- Flags (default false, A7), printed order: Wayward, Road Fanatic, Drive Fanatic, Aimless, Burdened, Laden, Radical, Shaken. Stored in one group `diagramFlags` (not `flags`, to avoid confusion with Foundry's document `flags`).
- Pure key list, model fields, sheet section, i18n, CSS, tests, docs record.

### Out of scope (user decision: "values only")
- Burden and Charge edge box gauges (RULES.md A6). No open issue covers them: log as an open gap in `RULES.md` and report it in the wrap-up so a follow-up issue can be created. Not created here (no tracker changes).
- Road/Drive/Group Scars and Disorders (#18), Talents (#19), faithful layout (#20), hexagon visuals.
- Any effect of the flags, any link between diagram values, derived/computed values, bounds or clamping (RULES.md section B).
- Migrations, new Item types, build step, framework, `.ts` files.

## 3. Existing state
- #13-#16 shipped: `integerField()`, `textField()`, `flagField()`, `integerGroupField(keys)`, `trackField` in `src/models/character.mjs`; key lists in `src/rules/base-stats.mjs` and `src/rules/tracks.mjs`; page 1 template binds `name="system.x.y"` from `source.system`; `submitOnChange` form; `BooleanField` already used for track states.
- `flagField()` and `textField()` already reusable; checkbox pattern exists in the Health/Composure states (`character-page1.hbs`).
- `_prepareContext` in `src/sheets/character-sheet.mjs` builds localized label rows for lists and tracks.
- `docs/RULES.md` A5 (numbers), A7 (independent booleans), A8 (free text), A9 (defaults): answered but **unconfirmed by the creator** (section C). Page-1 inventory lists the centre diagram.

## 4. Architecture decisions
- Model: `willpower, burden, charge, discord, groupFocus` as `integerField()`; `focusStatement, groupArchetype` as `textField()`; `diagramFlags: SchemaField` of `flagField()` per key. No total, no derived value stored.
- `src/rules/diagram.mjs` (pure, no Foundry): `DIAGRAM_NUMBER_KEYS` and `DIAGRAM_FLAG_KEYS` (frozen, printed order). Reuse the existing `integerGroupField` for the numbers if it keeps the schema flat-readable; otherwise top-level fields. Pick one at implementation and keep `system.*` names stable (public contract).
- Sheet: no new action needed. Numbers, texts and flags bind directly via `name="system.…"`. `_prepareContext` adds a `diagramFlags` array `{ key, label, checked }` for the eight checkboxes, localized.
- i18n: `MON1E.Character.willpower|burden|charge|discord|groupFocus|focusStatement|groupArchetype|diagram`, `MON1E.Flags.<key>` for the eight flags.
- Presentation: one "Diagram" fieldset grouping numbers, flags and texts; hexagon look is #20.
- Verify `<textarea>` binding and checkbox submit in ApplicationV2 forms against Foundry v14 docs; both patterns partly proven (checkboxes in #16).

## 5. Work plan
1. Gate: #12-#16 code present (`integerField`, `flagField`, `textField`, page-1 template); RULES.md A5, A7, A8, A9 present. Else stop.
2. Tests first, `tests/diagram.test.mjs`: number and flag key lists exact and in printed order; no duplicates; every key and the group title has an i18n label in `lang/en.json`.
3. Create `src/rules/diagram.mjs`.
4. `CharacterData.defineSchema`: add the fields; update class doc.
5. `lang/en.json`: labels.
6. Sheet `_prepareContext`: localized flag rows.
7. `character-page1.hbs`: Diagram fieldset (numbers, textarea, text, eight checkboxes). Minimal CSS in `styles/mon1e.css`.
8. `npm run check`.
9. In-Foundry check (section 7); fix, re-check.
10. Docs: `docs/DEVELOPMENT.md` verification record; `docs/DECISIONS.md` row (diagram fields stored raw, flags grouped, edge gauges deferred); `docs/RULES.md` note: what is stored, still unconfirmed by creator, Burden/Charge edge gauges not yet stored.
11. Wrap-up with evidence per criterion. Commits: code (+docs), then plan, separately.

## 6. Likely modified files
- New: `src/rules/diagram.mjs`, `tests/diagram.test.mjs`.
- Modified: `src/models/character.mjs`, `src/sheets/character-sheet.mjs`, `templates/character-page1.hbs`, `lang/en.json`, `styles/mon1e.css`, `docs/DEVELOPMENT.md`, `docs/DECISIONS.md`, `docs/RULES.md`.
- Do not edit by hand: `CLAUDE.md`, `AGENTS.md`, `.claude/`, `.agents/`.

## 7. Expected tests
- `node:test`: key lists and order, i18n coverage.
- `npm run typecheck`, `npm test`, `npm run check` exit 0.
- In-Foundry (only coverage for model, sheet, persistence), world `mon1e-test`, Foundry build noted:
  1. Existing actor opens: numbers 0, texts blank, flags unchecked, no migration, console clean.
  2. New actor: same.
  3. Edit each number, both texts (incl. multiline Focus Statement), toggle each of the eight flags independently; close and reopen sheet; intact.
  4. Reload (F5), close and reopen world; intact.
  5. Labels localized, no raw `MON1E.*`; other sections (Health, Composure, stats) unaffected.
  Record in `docs/DEVELOPMENT.md`.
- Do not claim Foundry coverage from `npm run check`.

## 8. Risks and mitigations
- Answers A5/A7/A8 unconfirmed by creator → raw values only, no rule encoded; flagged in RULES.md.
- Burden/Charge edge gauges missing → explicit out-of-scope, recorded gap, follow-up issue suggested; adding later reuses `trackField` without migration of existing fields.
- Existing actors lack new data → schema `initial` fills; verify on an existing actor.
- Unchecked checkbox not submitted → same pattern works in #16; confirm in-world.
- Scope creep into hexagon layout or effects → belongs to #20 / section B.

## 9. Stop criteria
- #12-#16 code or RULES.md A5/A7/A8/A9 missing.
- Needs a bound, clamp, derived value, flag effect or any rule not in `RULES.md`.
- Fields do not persist and cause is not a template bug: stop, report console output.
- Work needs a build step, framework or Foundry types package: escalate.
