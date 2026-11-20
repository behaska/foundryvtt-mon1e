# Implementation plan — Progressive ESLint and Dependabot
**Issue**: https://github.com/behaska/foundryvtt-mon1e/issues/25 (parent: #21, blocked by: #23 — CI workflow, merged)
**ADR**: none (no ADR root configured)
**Likely impacted modules**: `eslint.config.js` (new), `.github/dependabot.yml` (new), `package.json`, `package-lock.json`, `docs/DEVELOPMENT.md`

Framing source: `documentation/cadrage/cicd/implementation-cicd.md`, Lot 2 ("ESLint de manière progressive… les erreurs certaines devront bloquer ; les règles de style discutables pourront être configurées séparément") and the P2 "Dependabot" row.


## 1. Objective
`npm run check` runs ESLint and is clean on the current tree. Only rules that catch certain errors block (exit 1). Style-only rules never block. Dependabot opens update PRs for npm and GitHub Actions.

## 2. Scope
### Included
- `eslint.config.js` (flat config, ESM-compatible) covering the code that exists: `src/**/*.mjs`, `scripts/**/*.mjs`, `tests/**/*.mjs`.
- Blocking ruleset = ESLint core "possible problems" only (`@eslint/js` `recommended`: `no-undef`, `no-unused-vars`, `no-dupe-keys`, `no-unreachable`, …). Adjust only what the current tree needs.
- Style rules (quotes, semicolons, indent, `prefer-const`, `no-var`, etc.): not enabled; if any is wanted later it goes in a separate non-blocking config at `warn` level with `--max-warnings` left unlimited.
- Per-folder globals: Node env for `scripts/` and `tests/`; browser + Foundry globals (`game`, `foundry`, `Hooks`, `CONFIG`, `Actor`, plus whatever `no-undef` reports in `src/`) for `src/`. Declared explicitly, not via a third-party Foundry globals package.
- `package.json`: devDependencies `eslint` and `@eslint/js` (and `globals` only if needed for Node/browser sets); script `lint`; `check` = typecheck → tests → manifest → lint (existing scripts kept).
- `.github/dependabot.yml`: `version: 2`, ecosystems `npm` and `github-actions`, directory `/`, weekly schedule, grouped minor/patch updates, small open-PR limit, commit-message prefix aligned with repo style (`chore(deps)` / `ci(deps)`).
- `docs/DEVELOPMENT.md`: new command row, what lint covers/doesn't, Dependabot note, verification record with date.

### Out of scope
- Refactoring code to satisfy style preferences; Prettier/formatter; `typescript-eslint` (no `.ts`, `checkJs` already covers types).
- `tsconfig.json` scope; CI workflow edits (it already runs `npm run check`); release/packaging (#26+).
- Auto-merge of Dependabot PRs; security-update settings in the GitHub UI (repo setting, not a file).
- Linting `templates/*.hbs`, `lang/*.json`, `styles/*.css`.

## 3. Existing state
- `package.json`: scripts `typecheck`, `test`, `check:manifest`, `check`; devDependencies only `@types/node`, `typescript@7`. No ESLint, no `eslint.config.js`, no `.github/dependabot.yml`.
- Code: ~580 lines of `.mjs` (`src/{main,constants}.mjs`, `src/foundry/register.mjs`, `src/models`, `src/rules`, `src/sheets`, `scripts/check-manifest.mjs`, 8 test files). Foundry globals seen in `src`: `game`, `foundry`, `Hooks`, `CONFIG`, `Actor`, `document`, `window`.
- CI (`.github/workflows/ci.yml`): `npm ci` + `npm run check` on Node 26, actions pinned by SHA with version comments — Dependabot's github-actions ecosystem keeps those SHA pins updated.
- Node 26 locally; `package-lock.json` committed.
- Working tree already has unrelated edits (`.gitignore`, cicd brief): do not mix into this change.

## 4. Architecture decisions
- Flat config file `eslint.config.js`. `package.json` has no `"type"`, so `.js` is CommonJS; write it as ESM only if renamed `eslint.config.mjs`. Decision: use `eslint.config.mjs` (consistent with the repo's `.mjs` rule) — framing brief says `.js`, note the deviation in docs.
- Blocking = `recommended` only; nothing opinionated. Rationale: framing says certain errors block, style stays separate.
- Foundry globals declared by hand in the config, minimal list driven by actual `no-undef` output; avoid unmaintained community packages.
- `no-unused-vars`: keep as error but with `argsIgnorePattern: "^_"`; if current tree has violations, fix the trivial ones (unused import/var) in the same PR only if ≤ a handful, else downgrade that rule to `warn` and record it. Do not touch unrelated code beyond that.
- Lint command: `eslint .` with `ignores` for `node_modules`, `documentation`, `.claude`, `.agents`, `.llm-workbench`, `.idea`.
- Dependabot: one file, two `updates` entries, grouped to limit PR noise; TypeScript major bumps get their own PR (ungrouped majors) since `checkJs` behavior can shift.
- Verify ESLint v9/v10 flat-config API, Node 26 support and `@eslint/js` current version against official docs before pinning; verify `dependabot.yml` keys against GitHub docs.

## 5. Work plan
1. Check official docs: ESLint flat config + current major, Dependabot v2 schema (`groups`, `commit-message`, `open-pull-requests-limit`).
2. `npm i -D eslint @eslint/js` (+ `globals` if used); review lockfile diff.
3. Write `eslint.config.mjs`; run `npx eslint .`; classify findings: real errors → fix minimally; style-ish findings → rule not enabled / `warn`.
4. Add `lint` script; extend `check`.
5. Negative checks (manual): temporarily introduce an undefined variable → `npm run check` exits 1 at lint; introduce a style-only deviation (e.g. double vs single quotes, missing semicolon) → still green. Revert.
6. Add `.github/dependabot.yml`; validate YAML (parse locally, e.g. `node -e` with no new dep, or `gh api` schema check not required).
7. Update `docs/DEVELOPMENT.md` (commands, coverage, deviation `.mjs`, verification record).
8. PR to `main`; confirm CI `quality` green. After merge, confirm Dependabot shows in repo Insights → Dependency graph → Dependabot and opens (or can be triggered to open) PRs for both ecosystems.

## 6. Likely modified files
- New: `eslint.config.mjs`, `.github/dependabot.yml`.
- Modified: `package.json`, `package-lock.json`, `docs/DEVELOPMENT.md`; `src/**` or `tests/**` only for trivial genuine-error fixes surfaced by lint.
- Not touched: `tsconfig.json`, `system.json`, `.github/workflows/ci.yml`.

## 7. Expected tests
- `npm run lint` exit 0 on current tree; `npm run check` green end to end.
- Negative: undefined identifier → exit 1; style-only deviation → exit 0 (manual, recorded in docs).
- `npm run typecheck` unchanged and clean.
- Dependabot: no local test; acceptance verified on GitHub after merge (config accepted, version-update runs for npm and github-actions). State this honestly in the verification record.
- No Foundry runtime test: lint is static and says nothing about behavior in Foundry.

## 8. Risks and mitigations
- Hidden `no-undef` noise from Foundry globals → derive list from actual output; keep it short and commented.
- ESLint major vs Node 26 / TypeScript 7 incompatibility → check engines in docs/npm before pinning; fall back to latest supported major.
- Lint pulling in `node_modules` or tooling dirs → explicit `ignores`.
- Dependabot PR noise → weekly, grouped, `open-pull-requests-limit` small.
- Dependabot Action bumps rewriting SHA pins → expected; keeps `# vX.Y.Z` comments.
- Plan deviates from brief filename (`.js` vs `.mjs`) → documented.

## 9. Stop criteria
- Stop and ask if clean lint requires refactoring more than trivial unused vars/imports.
- Stop if ESLint cannot run on Node 26 with TypeScript 7 installed.
- Done when: `npm run check` includes lint and is green; style-only violation does not fail; `.github/dependabot.yml` merged and GitHub accepts it for npm + github-actions; docs updated; PR green on `quality`.
