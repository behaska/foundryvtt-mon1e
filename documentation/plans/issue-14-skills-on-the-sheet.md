# Implementation plan — Skills on the sheet
**Issue**: https://github.com/behaska/foundryvtt-mon1e/issues/14 (parent: #10, blocked by #12, done)
**ADR**: none (no ADR directory configured)
**Likely impacted modules**: `src/rules/base-stats.mjs`, `src/models/character.mjs`, `src/sheets/character-sheet.mjs`, `templates/character-page1.hbs`, `lang/en.json`, `styles/mon1e.css`, `tests/base-stats.test.mjs`, `docs/`

Target path once plan mode ends: `documentation/plans/issue-14-skills-on-the-sheet.md` (flat, English). Plan mode allows only this file; copy it there on approval. Target does not exist; no near-duplicate in `documentation/plans/`.

## 1. Objective
Add the 21 printed skills to the `character` Actor as raw whole numbers, editable on sheet page 1, persistent, labels via i18n. Same shape and mechanism as #13 attributes/aptitudes.

## 2. Scope
### Included
- Skills in printed order (3 columns of 7, read column by column): Alchemy, Animal Ken, Arts, Athletics, Command, Communication, Craft, Divination, Empathy, Folk Lore, Healing, Land Lore, Marksmanship, Meditation, Melee, Mysteries, Stealth, Stewardship, Survival, Thievery, Vigilance.
- Model field, sheet section on page 1, i18n labels, minimal CSS, tests, docs record.

### Out of scope
- (+) add-element button, custom labels, removal rules (later issue, as in #13).
- Bounds, clamping, derived values, rolls, attribute/aptitude/skill combination (RULES.md section B).
- Brawls, Encounters, Talents, Health/Composure, diagram.
- Migrations, new Item types, build step, framework, `.ts` files.
- Editing generated files; ticking issue boxes.

## 3. Existing state
- #13 shipped: `src/rules/base-stats.mjs` (`ATTRIBUTE_KEYS`, `APTITUDE_KEYS`, `defaultStatRows`), `statRowsField(keys)` in `src/models/character.mjs`, `rows(list, group)` mapper in `CharacterSheet._prepareContext` (`attributesRows`, `aptitudesRows`), two `fieldset.stat-list` sections in `templates/character-page1.hbs` with hidden `key` + number `value` inputs, i18n groups `MON1E.Attributes` / `MON1E.Aptitudes`, and `tests/base-stats.test.mjs` (keys, defaults, i18n coverage).
- `docs/RULES.md` A2 (integers) and A3 (Skills = list of {label, value}; printed names are non-removable starting entries; (+) adds more) answered. A9 empty number = 0. Min/max still deferred (B).
- Skill labels in the PDF inventory are title case already (`Folk Lore`, `Land Lore`).

## 4. Architecture decisions
- Reuse #13 design exactly: `skills` = ArrayField of `{ key: string, value: integer }`, seeded with the 21 base rows, label from i18n (`MON1E.Skills.<key>`), not stored. No new field kinds, no `label` field (no speculative fields; A3's (+) later is additive).
- Keys camelCase, stable: `alchemy, animalKen, arts, athletics, command, communication, craft, divination, empathy, folkLore, healing, landLore, marksmanship, meditation, melee, mysteries, stealth, stewardship, survival, thievery, vigilance`.
- Add `SKILL_KEYS` to `src/rules/base-stats.mjs` (file already holds base-key lists; no new module needed). Reuse `defaultStatRows` and `statRowsField` unchanged.
- Existing actors have no `skills`: rely on ArrayField `initial` for missing data, same as #13; verify on the existing actor.
- Sheet: extend `_prepareContext` with `skillsRows` via the existing `rows` mapper (`"Skills"` group); add third `fieldset.stat-list` in `character-page1.hbs` with names `system.skills.{{index}}.key` / `.value`. Keep printed order (single list; CSS may lay out in 3 columns, presentation only).
- Never mutate `actor.system`; edits via existing form submit. No new Foundry APIs.
- Do not invent any Mon rule; no bounds.

## 5. Work plan
1. Gate: #12/#13 code present (`base-stats.mjs`, `statRowsField`, page1 template); `RULES.md` A2/A3/A9 present. Else stop.
2. Tests first in `tests/base-stats.test.mjs`: 21 skill keys in printed order, unique; default rows value 0 and independent; every skill key has an i18n label and the section title exists.
3. Add `SKILL_KEYS` to `src/rules/base-stats.mjs`.
4. `CharacterData.defineSchema`: add `skills: statRowsField(SKILL_KEYS)`; update class doc comment.
5. `lang/en.json`: `MON1E.Character.skills` ("Skills") + `MON1E.Skills.*` (21 labels).
6. `character-sheet.mjs`: add `context.skillsRows`; `character-page1.hbs`: Skills fieldset; minimal CSS (3-column grid for the skills list if `stat-list` layout does not already fit).
7. `npm run check`.
8. In-Foundry check (section 7); fix, re-check.
9. Docs: `docs/DEVELOPMENT.md` verification record; `docs/DECISIONS.md` row (skills reuse rows-of-{key,value}); `docs/RULES.md` only to note what is now stored (no rule change).
10. Wrap-up with evidence per criterion; commits: code (+docs), then plan, separately.

## 6. Likely modified files
- Modified: `src/rules/base-stats.mjs`, `src/models/character.mjs`, `src/sheets/character-sheet.mjs`, `templates/character-page1.hbs`, `lang/en.json`, `styles/mon1e.css`, `tests/base-stats.test.mjs`, `docs/DEVELOPMENT.md`, `docs/DECISIONS.md`, possibly `docs/RULES.md`.
- `tests/identity.test.mjs`: only if its hard-coded template/key check needs it (template list already includes page1).
- Do not edit by hand: `CLAUDE.md`, `AGENTS.md`, `.claude/`, `.agents/`.

## 7. Expected tests
- `node:test`: 21 skill keys, printed order, unique; default rows value 0 and independent; each key has label in `lang/en.json`; `MON1E.Character.skills` exists.
- `npm run typecheck`, `npm test`, `npm run check` exit 0.
- In-Foundry (only coverage for model/sheet), world `mon1e-test`, Foundry build noted:
  1. Open existing actor (from #12/#13): Skills section shows 21 rows at 0, no migration.
  2. Create new actor: same.
  3. Edit all 21 values; close and reopen sheet; intact.
  4. Reload (F5), close and reopen world; intact.
  5. Labels localized, no raw `MON1E.*` keys; console clean; attributes/aptitudes unaffected.
  Record in `docs/DEVELOPMENT.md`.
- Do not claim Foundry coverage from `npm run check`.

## 8. Risks and mitigations
- Row `key` not submitted → hidden `key` input (already proven in #13); re-test reload.
- Existing actors lack `skills` → `initial`; verify; defaulting step only if it fails.
- Page 1 grows long, window 640px high → sheet already `scrollable`; CSS columns only if cheap.
- Unconfirmed A answers beyond A2/A3 → note status in DECISIONS.md; keep model small.
- Scope creep into Brawls/Talents/(+) → separate issues.

## 9. Stop criteria
- #12/#13 code or A2/A3/A9 answers missing.
- Needs a bound, range, derived value or rule not in `RULES.md`.
- Array submission cannot persist rows and cause is not a template bug: stop, report console output.
- Work needs a build step, framework or Foundry types package: escalate.
