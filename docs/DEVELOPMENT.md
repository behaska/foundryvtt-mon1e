# Development

## Prerequisites (P0)
- Foundry VTT v14.370 (stable), Node.js, Git, VS Code.
- Versions used during setup: Node.js v26.11.1, npm 11.20.0, Git 2.54.0.
- Foundry `<User Data>` path (dedicated v14 install, macOS): `~/Library/Application Support/FoundryVTTV14`.
- Foundry and VS Code installations are **not verified** automatically. Foundry build actually tested: **14.369** (Setup screen, shows an update indicator); 14.370 not yet tested.

## Installing the system in Foundry
A system folder must be named after its `id` (`mon1e`), while this repository is named `foundryvtt-mon1e`. The maintainer creates a link `<User Data>/Data/systems/mon1e` pointing to this repository by hand. Nothing creates it automatically.

```
cd "<User Data>/Data/systems"
ln -s /path/to/foundryvtt-mon1e mon1e
```

## Commands
| Command | Effect |
|---|---|
| `npm run typecheck` | `tsc --noEmit` (`allowJs` + `checkJs`) |
| `npm test` | `node:test` unit tests (`tests/`) |
| `npm run check:manifest` | `scripts/check-manifest.mjs`: validate `system.json` and that referenced files exist |
| `npm run lint` | `eslint .` (config: `eslint.config.mjs`) |
| `npm run check` | typecheck, then tests, then manifest check, then lint |
| `npm run package` | `scripts/package.mjs`: build `dist/mon1e.zip`, `dist/system.json` (release manifest) and `dist/SHA256SUMS` |
| `npm run verify:package` | `scripts/verify-package.mjs`: inspect the produced ZIP (not part of `check`) |

Single test file: `node --test tests/<file>.test.mjs`.

### Manifest validation (issue #24)
`scripts/check-manifest.mjs` checks `system.json`: `id`, `title`, `description` (non-empty strings), `version` (string or number, must equal `package.json` `version`: bump both together), `compatibility` (`minimum` and `verified` numeric, `minimum <= verified <= maximum` when present), `esmodules`, `scripts` and `styles` (arrays), `languages[]` (`lang`, `name`, `path`), `documentTypes` (document type → subtype → object), `packs[].path` only when present. Every referenced path must be relative, use `/`, contain no `..` and exist on disk. Unknown keys are ignored. `--root <dir>` points the CLI at another tree.

Source: the Foundry system development article (https://foundryvtt.com/article/system-development/). That page does not mention v14 (examples use `minimum: 12`), so field names and required status are **not confirmed against a v14-specific page**; only fields it documents are enforced. It does not document a pack `path`.

Not covered: that Foundry actually loads the system, release fields (`manifest`, `download`, `url`), and `tsconfig` scope (unchanged; the script is typechecked only through the test that imports it).

Verification, 2026-11-20: `npm run check` **passed** (48 tests). With `styles/mon1e.css` moved away, `npm run check` exits 1 and `node scripts/check-manifest.mjs` prints `styles: file not found: styles/mon1e.css`. With `package.json` version set to 0.0.2, `check:manifest` exits 1 with a version mismatch message. Both changes were reverted.

### Packaging (issue #26)
`npm run package` validates the manifest, then zips an explicit file list: everything under `src/`, `templates/`, `styles/`, `lang/` (dotfiles excluded) plus every path `system.json` references, with the release `system.json` at the ZIP root. Sources are only read. The release manifest is the source manifest plus `url`, `manifest`, `download` and `bugs`; those GitHub URLs are **targets, not verified to exist** until a release is published. Tooling: system `zip`/`unzip` (macOS, `ubuntu-latest`), no npm dependency; Windows is not supported. `dist/` is git-ignored and eslint-ignored.

`npm run verify:package` inspects the real ZIP: `system.json` at the root and equal to `dist/system.json`, manifest validation (reusing `check-manifest`: required files present, version equals `package.json`), no entry outside the shipped directories or any hidden file (so no `node_modules`, `tests`, `scripts`, `docs`, `package.json`), every relative `import` of a shipped `.mjs` present, and `SHA256SUMS` matching the recomputed hashes. CI runs both after `npm run check` and uploads `dist/` as the `mon1e-package` artifact: the same output a release would publish.

Limits: dynamic or computed imports and runtime-built template paths are not detected (templates are covered by the directory allowlist); ZIP bytes embed file mtimes, so the checksum identifies one build, not a reproducible one; a new top-level source directory must be added to `PACKAGE_DIRS` in `scripts/package.mjs`. Install and load in Foundry v14 is **not** tested here. Contract source: the Foundry system development article (not confirmed v14-specific); ZIP root layout follows the documented install behaviour of extracting into `systems/<id>/`.

Verification, 2026-11-20: `npm run check` **passed** (61 tests). `npm run package && npm run verify:package` exit 0 on macOS (17 entries, `system.json` at root, `shasum -a 256 -c dist/SHA256SUMS` OK, `system.json`/`package.json` hashes unchanged). Negative runs exit 1: `src/main.mjs` removed from the ZIP (`esmodules: file not found: src/main.mjs`), a `tests/` entry added (`unexpected entry`), `SHA256SUMS` tampered (`mismatch`). CI artifact: not yet verified, pending the PR run.

### Lint and Dependabot (issue #25)
`eslint.config.mjs` (flat config; `.mjs` instead of the `.js` named in the framing brief, to match the repo's ES module convention) lints `src/`, `scripts/` and `tests/` with `@eslint/js` `recommended` only, plus `no-unused-vars` ignoring `_`-prefixed args. These are rules that catch certain errors, and they block. Style rules (quotes, semicolons, indent, `prefer-const`, `no-var`) are not enabled and never block. Foundry globals used by `src/` (`game`, `foundry`, `Hooks`, `CONFIG`, `Actor`) are declared by hand in the config. Not linted: `templates/`, `lang/`, `styles/`, `documentation/`, tooling folders.

`.github/dependabot.yml` opens weekly update PRs for `npm` and `github-actions` (minor/patch grouped, majors separate, max 5 open each). Dependabot is only verified on GitHub after merge to `main`; nothing local tests it.

Verification, 2026-11-20 (ESLint 10.15, Node 26.11.1): `npm run check` **passed** with lint clean on the current tree. An undefined identifier in `src/` makes `npm run lint` exit 1. A file with single quotes, no semicolons and `var` lints clean. Both temporary files were removed. Dependabot acceptance on GitHub: **not yet verified**.

## Daily loop
1. Edit under `src/` (changes are picked up through the symlink, no copy or build).
2. `npm run check`.
3. Reload the test world `mon1e-test` in Foundry and read the browser console (F12) for errors and the `mon1e |` log lines.
4. Commit once behavior is verified in Foundry.

## `checkJs` coverage
Current scope (`tsconfig.json`): `src/constants.mjs`, `src/rules/` and `tests/`. `src/main.mjs`, `src/foundry/`, `src/models/` and `src/sheets/` are **excluded**: they use the Foundry global API (`Hooks`, `CONFIG`, `foundry.*`), and no type declarations are installed for it. Foundry APIs are verified inside Foundry itself.

Not covered by `checkJs` (needs an in-Foundry check): `src/main.mjs`, the data model, sheet and registration, and every Foundry global or API (`Hooks`, `game`, `CONFIG`, documents, data models, sheets). `node:test` tests only exercise pure code and the manifest file; they do not cover Foundry integration. A green `npm run check` says nothing about runtime behavior in Foundry.

### Verification record: quality commands (issue #4)
Date: 2026-11-19. Clean `npm ci`, Node.js v26.11.1, TypeScript 7.0.2.
- `npm run typecheck`: **passed** (exit 0, nothing emitted); exits 1 on an injected type error.
- `npm test`: **passed** (3 tests, exit 0, `tests/` discovered); exits 1 on a failing assertion.
- `npm run check`: **passed** (exit 0); exits 1 when typecheck fails, tests are not run.

## Conventions
- Project language is English (code, comments, logs, tests, docs, plans, commits).
- JavaScript ES Modules (`.mjs`), JSDoc, no build step or bundler.
- Pure game logic independent of Foundry, tested with `node:test`.
- `CLAUDE.md`, `AGENTS.md`, `.claude/` and `.agents/` are generated by `llm sync` and versioned; do not edit them by hand.

## Verification record: system loads in Foundry (issue #3)
Date: 2026-11-19. Manual run by the maintainer, console output pasted.
- Link `<User Data>/Data/systems/mon1e` -> repository: **passed** (verified on disk).
- System listed and test world `mon1e-test` started: **passed** (world exists, loaded to the canvas).
- `init` message `mon1e | system loaded (v0.0.1)` from `main.mjs`: **passed**.
- Blocking console error: **none**. One non-blocking warning: `WebGL context was lost` (Foundry/GPU, unrelated to the system).
- Foundry build tested: **14.369**, not 14.370 as targeted. Re-run after updating.
- Coverage: manual runtime check only; `checkJs` does not cover `src/main.mjs`.

## Verification record: character actor and tabbed sheet, page 1 identity (issue #12)
Automated, 2026-11-20: `npm run check` **passed** (9 tests: row defaults, manifest `documentTypes` and `languages`, every `localize` key used by templates exists in `lang/en.json`). This does not cover the model, sheet or registration.

v14 API names checked against the official v14 API docs (14.370 pages): `foundry.abstract.TypeDataModel` (static `defineSchema`, `LOCALIZATION_PREFIXES`), `foundry.applications.sheets.ActorSheetV2` (static `TABS`, `tabGroups`, `_prepareTabs`), `ApplicationTabsConfiguration` (`tabs`, `initial`, `labelPrefix`), `DocumentSheetV2` `form.{submitOnChange, closeOnSubmit, handler}`, `DocumentSheetConfig.registerSheet(documentClass, scope, sheetClass, options)`.
**Not confirmed from the docs** (check at runtime): the `SheetRegistrationOptions` properties (`types`, `makeDefault`, `label`), the `foundry.applications.api.HandlebarsApplicationMixin` page (404), `PARTS` shape, tab label localization from `labelPrefix`, and how array rows named `system.classLevels.N.field` are submitted.

In-Foundry check in world `mon1e-test` (2026-11-20, manual run by the maintainer, screenshots):
- Actor of type Character created; sheet opens on the "Page 1" tab: **passed** (after a fix: the tab label first showed the raw key `MON1E.Sheet.Tabs.page1`; now an explicit `label` passed through `localize`).
- Fields edited (species, ancestry, moon signature, kaon, zaon, zaon scars, might, archetype, first class/sub-class/level row) and **persistence reported OK** by the maintainer: **passed**.
- Console: no error, no deprecation warning: **passed** (reported by the maintainer).
- Persistence after closing and reopening the world: **passed** (reported by the maintainer).
- Rows 2 and 3 of Class / Sub-Class / Level edit and persist: **passed**.
- Foundry build not recorded.

Steps run:
1. Create an Actor of type Character; the sheet opens on the "Page 1" tab.
2. Edit every field (name, species, ancestry, moon signature, kaon, zaon, zaon scars, might, archetype, the 3 class/sub-class/level rows); close and reopen the sheet; values intact.
3. Reload (F5), then close and reopen the world; values intact.
4. Console: no error or deprecation warning; no raw `MON1E.*` keys visible.
Record date, Foundry build and results here.

## Verification record: base attributes and aptitudes (issue #13)
Automated, 2026-11-20: `npm run check` **passed** (15 tests: 8 attribute and 7 aptitude keys in printed order, unique, default rows value 0 and independent, every key has an i18n label). Does not cover the model, sheet or `_prepareContext`.

In-Foundry check in world `mon1e-test` (2026-11-20, manual run by the maintainer, screenshot and rendered HTML):
- The issue #12 actor (created before this change) shows both sections with 8 attributes and 7 aptitudes, no migration: **passed**.
- Labels localized (Base Attributes, Base Aptitudes, 15 names), no raw `MON1E.*` key: **passed**.
- Edited non-zero values are rendered, and each row submits its hidden `key` input: **passed** (seen in the rendered HTML).
- Persistence after closing and reopening the world: **passed** (reported by the maintainer).
- A new actor starts with all 15 values at 0: **passed** (reported by the maintainer).
- **Not confirmed yet**: clean console (answer was ambiguous); Foundry build.

Steps:
1. Open the existing issue #12 actor: the Base Attributes and Base Aptitudes sections show 8 and 7 fields at 0 (existing actors get defaults through `initial`; no migration).
2. Create a new actor: same.
3. Edit all 15 values; close and reopen the sheet; values intact.
4. Reload (F5), then close and reopen the world; values intact.
5. Labels localized, no raw `MON1E.*` keys, console clean. Note the Foundry build.


## Verification record: skills (issue #14)
Automated, 2026-11-20: `npm run check` **passed** (16 tests). Covers the 21 skill keys in printed order, unique, and the i18n labels. Does not cover the model, sheet or `_prepareContext`.

In-Foundry check in world `mon1e-test` (2026-11-20, manual run by the maintainer, reported as all passed):
- Skills section shows 21 localized fields; no raw `MON1E.*` key: **passed**.
- Edited values display and persist after closing and reopening the world: **passed**.
- Console: no error: **passed**.
- Scroll fix (CSS): sheet scrolls, header and tab pinned: **passed**.
- Foundry build not recorded.

Steps:
1. Open an existing actor (created before this change): the Skills section shows 21 fields at 0 (defaults through `initial`; no migration).
2. Create a new actor: same.
3. Edit all 21 values; close and reopen the sheet; values intact.
4. Reload (F5), then close and reopen the world; values intact.
5. Labels localized, no raw `MON1E.*` keys, console clean, attributes and aptitudes unaffected. Note the Foundry build.
6. Scroll: a vertical scrollbar appears inside the sheet, Name and tab stay pinned, the last Skills row (Vigilance) is reachable, scroll position survives an edit re-render.


## Verification record: brawls and encounters (issue #15)
Automated, 2026-11-20: `npm run check` **passed** (17 tests). Covers the key lists in printed order and the i18n labels and group titles. Does not cover the model, sheet or template.

In-Foundry check in world `mon1e-test` (2026-11-20, manual run by the maintainer, reported as all passed): 4 fields shown and localized, values persist after reload, console clean. Foundry build not recorded.

Steps:
1. Open an existing actor (created before this change): Brawls (Armour, Weapon) and Encounters (Philosophy, Adornment) show 4 fields at 0 (schema `initial`; no migration).
2. Create a new actor: same.
3. Edit all 4 values; close and reopen the sheet; values intact.
4. Reload (F5), then close and reopen the world; values intact.
5. Labels localized, no raw `MON1E.*` keys, console clean, attributes, aptitudes and skills unaffected.


## Verification record: health and composure (issue #16)
Automated, 2026-11-20: `npm run check` **passed** (23 tests). Covers state key order, `adjustFilled`, `boxesToDraw` and i18n labels. Does not cover the model, sheet, template or the (+)/(-) buttons.

In-Foundry check in world `mon1e-test` (2026-11-20, manual run by the maintainer, reported as all passed): gauges and 6 state flags shown and localized, values persist after reload, console clean. Foundry build not recorded.

Steps:
1. Open an existing actor (created before this change): Health and Composure show the placeholder boxes unchecked and the 6 state checkboxes off (schema `initial`; no migration).
2. Create a new actor: same.
3. (+) checks boxes in sequence; (+) past the drawn boxes adds one; (-) removes one and stops at 0.
4. Toggle each of the 6 state checkboxes independently; close and reopen the sheet; intact.
5. Reload (F5), then close and reopen the world; filled counts and states intact.
6. Labels localized, no raw `MON1E.*` keys, console clean, other sections unaffected. Unchecked state checkboxes persist as false.

## Verification record: centre diagram (issue #17)
Automated, 2026-11-20: `npm run check` **passed** (27 tests). Covers the number and flag key lists in printed order, no duplicate keys and the i18n labels. Does not cover the model, sheet or template.

In-Foundry check in world `mon1e-test` (2026-11-20, manual run by the maintainer, reported as all passed): diagram numbers, texts and 8 flags shown and localized, values persist after reload, console clean. Foundry build not recorded.

Steps:
1. Open an existing actor (created before this change): Willpower, Burden, Charge, Discord, Group Focus show 0, Focus Statement and Group Archetype are blank, the 8 flags are off (schema `initial`; no migration).
2. Create a new actor: same.
3. Edit each number, both texts (Focus Statement is multiline), toggle each of the 8 flags independently; close and reopen the sheet; intact.
4. Reload (F5), then close and reopen the world; intact. Unchecked flags persist as false.
5. Labels localized, no raw `MON1E.*` keys, console clean, Health, Composure and stats unaffected.

## Verification record: scars and disorders (issue #18)
Automated, 2026-11-20: `npm run check` **passed** (31 tests). Covers scar and disorder key order, `defaultDisorderLines` and the i18n labels. Does not cover the model, sheet, template or the (+)/(-) and add-line buttons.

In-Foundry check in world `mon1e-test` (2026-11-20, manual run by the maintainer, reported as all passed): scar gauges and disorder lines shown and localized, values persist after reload, console clean. Foundry build not recorded.

Steps:
1. Open an existing actor (created before this change): the 3 scar gauges show placeholder boxes unchecked, each disorder list shows 3 blank lines (schema `initial`; no migration).
2. Create a new actor: same.
3. (+)/(-) on each scar gauge (past the drawn boxes adds one, stops at 0); type in each disorder line; press (+) to add a fourth line and fill it; close and reopen the sheet; intact.
4. Reload (F5), then close and reopen the world; intact.
5. Labels localized, no raw `MON1E.*` keys, console clean, Health, Composure and diagram unaffected.

## Verification record: talents (issue #19)
Automated, 2026-11-20: `npm run check` **passed** (36 tests). Covers `blankTalent`, `defaultTalentRows`, `removeRow` and the i18n labels. Does not cover the model, sheet, template or the add/remove buttons.

In-Foundry check in world `mon1e-test` (2026-11-20, manual run by the maintainer, reported as all passed): talent rows shown and localized, add and remove work, values persist after reload, console clean. Foundry build not recorded.

Steps:
1. Open an existing actor (created before this change): the Talents section shows 14 blank rows (schema `initial`; no migration).
2. Create a new actor: same.
3. Type a label and a value in several rows; press (+) to add a row and fill it; remove a middle row (rows below shift up, each value stays with its label); close and reopen the sheet; intact.
4. Reload (F5), then close and reopen the world; intact.
5. Labels localized, no raw `MON1E.*` keys, console clean, other sections unaffected.

## Verification record: sheet look (issue #20)
Automated, 2026-11-20: `npm run check` **passed** (36 tests, unchanged). Covers nothing in CSS or templates; there is no automated check of the visual result.

In-Foundry check in world `mon1e-test` (2026-11-20, manual run by the maintainer, reported as all passed): sheet layout shown, console clean, data displayed and persisted after reload. Foundry build not recorded.

Steps:
1. Open an actor: the sheet opens at 900x780, header and tabs stay pinned, the page scrolls, console clean.
2. Compare with `Character Sheet ALPHA Page 1.pdf` page 1: identity / archetype / class band, cross diagram with hexagons (Willpower, Burden, Charge, Discord, Group Focus) and flags, Road/Drive/Group scars and disorders at the sides, attributes, aptitudes, brawls, encounters, health, composure, skills in 3 columns, talents in 2.
3. Regression: edit a value in every section, use each track (+)/(-), add a disorder line, add and remove a talent; close and reopen, then reload (F5); intact.
4. Tab through the hexagon inputs: focus is visible. Labels localized, no raw `MON1E.*` keys.
5. Narrow the window: nothing overlaps or becomes unreachable. Check light and dark themes.

Known gaps against the paper: Burden and Charge edge box tracks are not drawn (not stored); the MON logo is not used (rights unconfirmed); the layout is an approximation by eye, not pixel-exact.

## Baseline audit (issue #22)
Date: 2026-11-20. Read-only audit before any CI work (#21). No functional change.

Severity: **blocking** = prevents CI/CD or leaks data; **important** = fix before CI or release; **optional** = hygiene.

### Reproducible baseline
- Node.js v26.11.1, npm 11.20.0, TypeScript 7.0.2 (`npx tsc -v`).
- `npm ci`: 4 packages added, 0 vulnerabilities.
- `npm run check`: **passed** (exit 0; typecheck clean, 36 tests, 0 fail).
- Not covered: Foundry runtime. Foundry build last tested: 14.369.

### Inventory
- `.github/`: absent. No workflow, no CI.
- `system.json`: id `mon1e`, version 0.0.1, compatibility 14/14, `esmodules`, `styles` and `languages` paths all exist on disk. No `url`, `manifest` or `download` field.
- GitHub (`gh`, read-only): public, default branch `main`, no licence detected, 0 tags, 0 releases, `main` not protected, Actions enabled with all actions allowed (no SHA pinning required), secret scanning, push protection and Dependabot security updates all disabled.
- History: 38 commits scanned with `gitleaks git`, no leaks found. Scope: committed history only, not the working tree or GitHub settings.
- Tracked noise: `.idea/` (5 files: `.gitignore`, `.iml`, `material_theme_project_new.xml`, `modules.xml`, `vcs.xml`) and `.llm-workbench/project.json` (absolute local path `/Users/.../.llm-workbench`).
- `documentation/cadrage/cicd/implementation-cicd.md` is staged but not committed.

### Findings
| # | Finding | Severity | Follow-up |
|---|---|---|---|
| F1 | No licence for the code; none decided for Mon / Fringe Worlds content. A public repo is not open source by default. | important | Maintainer decision (open question below). |
| F2 | `main` has no branch protection. | important | Enable before relying on CI as a gate. |
| F3 | `system.json` has no `url`, `manifest` or `download`, so no installable release is possible. | important | Needed by the release issue, not by CI. |
| F4 | Secret scanning, push protection and Dependabot are disabled on a public repo. | important | Maintainer enables in repo settings. |
| F5 | Generated guidance said the repo has no `system.json` and no working commands. | important | **Fixed** here, see below. |
| F6 | `.idea/` tracked; the `.gitignore` template does not cover `modules.xml`, `.iml` or the theme file. | optional | Untrack in a follow-up. |
| F7 | `.llm-workbench/project.json` holds a machine-specific absolute path. | optional | Decide whether to keep it versioned. |
| F8 | Actions allow every action, no SHA pinning. | optional | Restrict when the first workflow lands. |
| F9 | Foundry 14.370 targeted, 14.369 tested. | optional | Re-run the manual check after updating. |
| F10 | `package.json` has no `engines` field; the Node version is only recorded here. | optional | Decide when CI picks a Node version. |

No blocking finding.

### Stale guidance fix (F5)
Source: `project-guidance.md` in the external workbench (`~/.llm-workbench/projects/mon1e/context/`), edited and committed there, then `llm sync` regenerated `CLAUDE.md` and `AGENTS.md`. The source is not versioned in this repo. The "Project state" and "Commands" sections now describe the working system and the three commands. Check: no remaining "No working commands" or "no `system.json`" text in either generated file.

### Open question for the maintainer
**Licence**: which licence applies to the Mon1e code, and under what terms may Mon and Fringe Worlds content (names, labels, rules, logo, sheet layout) appear in or alongside a public repository? Not answered here; no licence file added. Needs the Mon creator's position before any release.
