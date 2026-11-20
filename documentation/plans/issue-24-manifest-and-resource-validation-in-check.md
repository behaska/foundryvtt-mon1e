# Implementation plan — Manifest and resource validation in check
**Issue**: https://github.com/behaska/foundryvtt-mon1e/issues/24 (parent: #21, blocked by: #23 — CI workflow, already on branch `ci/issue-23-quality-workflow`)
**ADR**: none (no ADR root configured)
**Likely impacted modules**: `scripts/check-manifest.mjs` (new), `tests/check-manifest.test.mjs` (new), `package.json`, `docs/DEVELOPMENT.md`

Framing source: `documentation/cadrage/cicd/implementation-cicd.md`, Lot 2 (`scripts/check-manifest.mjs`, "selon les propriétés réellement applicables de l'API v14").

## 1. Objective
`npm run check` fails when `system.json` is invalid against the v14 manifest contract, when any file it references is missing on disk, or when `package.json` and `system.json` versions differ. Failure case covered by a unit test.

## 2. Scope
### Included
- `scripts/check-manifest.mjs`: pure `validateManifest(manifest, ctx)` returning a list of error strings, plus a thin CLI that reads `system.json` and `package.json`, checks the disk, prints each error, exits 1 on any.
- Checks: `id` non-empty string; `title`, `description` strings; `version` string (semver-like); `compatibility.minimum` and `verified` present, `minimum` <= `verified` (and `maximum` if present); `esmodules` and `styles` arrays of existing relative paths; `languages[]` each with `lang`, `name`, `path` existing; `documentTypes` object whose entries (`Actor`, `Item`, …) map type id → object; `package.json.version === system.json.version`.
- Resource-existence check on every path in `esmodules`, `styles`, `languages[].path` (plus `scripts`, `packs[].path` if ever present, validated only when the key exists).
- `package.json`: new script `check:manifest`; `check` = typecheck, then tests, then manifest check (existing scripts kept).
- `tests/check-manifest.test.mjs`: unit tests on `validateManifest` with injected `fileExists` (no disk), including the missing-resource failing case and the version-mismatch case; one test that the real repo manifest yields zero errors.
- `docs/DEVELOPMENT.md`: list the new command, state what it covers and that it does not prove Foundry loads the system.

### Out of scope
- `tsconfig.json` scope (stays unchanged, per issue); ESLint; release manifest fields (`manifest`, `download`, `url`: Lot 3); packaging; Foundry runtime checks; asserting any Mon rule or which document types must exist.
- Template (`.hbs`) and i18n-key coverage (already tested elsewhere).
- Changing `system.json` content, CI workflow (it already runs `npm run check`).

## 3. Existing state
- `system.json`: id `mon1e`, version `0.0.1`, compatibility 14/14, `esmodules` `src/main.mjs`, `styles` `styles/mon1e.css`, `languages` en → `lang/en.json`, `documentTypes.Actor.character`. All referenced files exist.
- `package.json` version `0.0.1`; `check` = `npm run typecheck && npm test`; `test` = `node --test tests/`.
- `tsconfig.json` includes only `src/constants.mjs`, `src/rules/**`, `tests/**`. Tests importing `scripts/check-manifest.mjs` pull it into the typecheck transitively, so its JSDoc must typecheck under `strict`; no `include` edit needed.
- `tests/constants.test.mjs` already reads `system.json` via `readFile(new URL("../system.json", import.meta.url))` — reuse that pattern. No `scripts/` dir yet.
- CI (#23) runs `npm ci` + `npm run check`, so the new step is gated automatically.

## 4. Architecture decisions
- Pure core / thin shell, same as `src/rules`: `validateManifest` takes plain data and a `fileExists(path)` predicate, no `fs` import in the pure function; CLI (guarded by `import.meta.url === pathToFileURL(process.argv[1]).href`) does the I/O. Lets tests cover the failure case without temp dirs.
- Optional CLI arg `--root <dir>` (default repo root) so a single CLI test can point at a temp dir with a missing file and assert exit code 1 — only if it stays small; otherwise rely on unit tests (acceptance requires "a unit test").
- Wire into `check` via a separate `check:manifest` script so it can run alone; order typecheck → tests → manifest (cheapest failure signal first is typecheck; manifest is fast so order is not critical).
- Paths validated as relative, no leading `/`, no `..` segments, forward slashes; existence resolved against the repo root.
- Only fields documented for v14 are validated; unknown extra keys are not errors (forward compatibility). Before coding, re-check the v14 manifest field list against the official docs (`https://foundryvtt.com/article/system-development/` and v14 API `PackageManifest`/`SystemData`); record any field not confirmed in `docs/DEVELOPMENT.md` instead of enforcing it.
- Version rule is equality only, no semver bump policy.

## 5. Work plan
1. Verify v14 manifest field list and required/optional status from the official docs; note the sources.
2. Write failing tests first (`tests/check-manifest.test.mjs`): valid manifest → `[]`; missing `esmodules` file → error naming the path; missing style; missing language file; bad `compatibility` order; missing `id`; `package.json`/`system.json` version mismatch; path with `..`; real repo manifest → `[]`.
3. Implement `scripts/check-manifest.mjs` (`validateManifest` + CLI) until tests pass.
4. Add `check:manifest` and extend `check` in `package.json`.
5. Manual negative check: temporarily rename `styles/mon1e.css`, run `npm run check`, confirm exit 1 and clear message, restore; same with a version mismatch. Record in docs.
6. Run `npm run check` green; confirm `tsc` still passes with unchanged `tsconfig.json`.
7. Update `docs/DEVELOPMENT.md` (commands table, coverage note, verification record with date).
8. PR to `main`; confirm CI `quality` job passes (and optionally that a throwaway commit with a missing resource turns it red).

## 6. Likely modified files
- New: `scripts/check-manifest.mjs`, `tests/check-manifest.test.mjs`.
- Modified: `package.json` (scripts only), `docs/DEVELOPMENT.md`.
- Not touched: `tsconfig.json`, `system.json`, `src/`, `.github/workflows/ci.yml`.

## 7. Expected tests
- `node --test tests/check-manifest.test.mjs`: all cases in step 2 pass; the missing-resource case asserts a non-empty error list mentioning the path.
- `npm run check` green on a clean tree; red (exit 1) with a missing referenced file or mismatched versions (manual negative runs, step 5).
- `npm run typecheck` still clean with the unchanged `tsconfig` scope.
- No Foundry runtime test: this validates files and JSON shape only, not that Foundry loads the system.

## 8. Risks and mitigations
- Enforcing a field Foundry v14 does not require → false CI failures; mitigate by validating only doc-confirmed fields and treating the rest as optional.
- `scripts/` pulled into typecheck transitively → type errors in a Node script; mitigate with strict JSDoc types and `@types/node` already present.
- CLI entry-point guard wrong on Windows paths → use `pathToFileURL`.
- Version check blocks releases where only one file is bumped → intended; document that both must be bumped together.
- Duplicate coverage with `constants.test.mjs` manifest assertions → leave them, they test a different contract (id, documentTypes vs. constants).

## 9. Stop criteria
- Stop and ask if the official v14 docs contradict a field assumption (e.g. `compatibility` shape, `documentTypes` format).
- Stop if making the script typecheck would require editing `tsconfig.json` (issue says scope stays unchanged).
- Done when: missing resource fails `npm run check`, unit test covers it, version consistency is checked, docs updated, PR green on `quality`.
