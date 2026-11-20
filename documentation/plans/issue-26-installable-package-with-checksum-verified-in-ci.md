# Implementation plan — Installable package with checksum, verified in CI
**Issue**: https://github.com/behaska/foundryvtt-mon1e/issues/26 (parent: #21, blocked by: #24 — merged)
**ADR**: none (no ADR root configured)
**Likely impacted modules**: `scripts/package.mjs` (new), `scripts/verify-package.mjs` (new), `tests/package.test.mjs` (new), `package.json`, `.gitignore`, `.github/workflows/ci.yml`, `docs/DEVELOPMENT.md`

Framing source: `documentation/cadrage/cicd/implementation-cicd.md`, Lot 3 (`npm run package`, `npm run verify:package`, `dist/{mon1e.zip, system.json, SHA256SUMS}`).

## 1. Objective
`npm run package` builds `dist/mon1e.zip` from an explicit allowlist, plus a release `dist/system.json` and `dist/SHA256SUMS`. `npm run verify:package` inspects the produced ZIP and fails on a missing required file or a forbidden one. CI runs both and uploads `dist/` as an artifact with exactly the contents a release would publish. Versioned sources are never modified.

## 2. Scope
### Included
- `scripts/package.mjs`: pure `buildPackagePlan(manifest, opts)` returning the explicit file list and the release manifest object; thin CLI that writes `dist/`.
- File list derived from an explicit allowlist: `system.json` (release version), every path in `esmodules`/`styles`/`languages[].path` (read from the source manifest), plus allowlisted directories `src/`, `templates/`, `styles/`, `lang/`. Nothing else (no `tests/`, `scripts/`, `docs/`, `documentation/`, `node_modules`, dotfiles, `package*.json`, configs).
- Release `system.json`: copy of source manifest with release-only fields added (`manifest`, `download`, `url`, `bugs` as applicable), written to `dist/system.json` and inside the ZIP at its root. Source `system.json` untouched.
- `dist/SHA256SUMS`: `sha256sum`-format lines (`<hex>  <file>`) for `mon1e.zip` and `system.json`.
- `scripts/verify-package.mjs`: pure `verifyPackage({ entries, manifest, ... })` returning error strings, plus CLI that lists the real ZIP and checks: `system.json` at ZIP root and parseable; ZIP manifest equals `dist/system.json`; every `esmodules`/`styles`/`languages` path present; every file the ESM entry graph needs present (static `import` specifiers from `src/`); no entry under `node_modules/`, `tests/`, `scripts/`, `docs/`, `documentation/`, `.git*`, `.github/`, `package*.json`; `SHA256SUMS` matches recomputed hashes; version in manifest equals `package.json`.
- `package.json`: scripts `package`, `verify:package` (not added to `check`, per framing: "packaging stays separate commands").
- `.gitignore`: add `dist/`.
- `ci.yml`: after `npm run check`, steps `npm run package`, `npm run verify:package`, `actions/upload-artifact` of `dist/` (SHA-pinned like existing actions).
- `tests/package.test.mjs`: unit tests with injected data, no disk.
- `docs/DEVELOPMENT.md`: commands, what is and is not proven, verification record.

### Out of scope
- `release.yml`, tags, GitHub Release, publication, immutability (Lot 4, #27+).
- Installing the ZIP in Foundry (manual recette, Lot 5/#9); CI green still does not mean Foundry loads the system.
- Changing source `system.json`, `tsconfig.json` scope, ESLint rules, adding Mon rules.
- Deterministic/reproducible ZIP bytes beyond sorted entries (see risks).

## 3. Existing state
- `system.json` v0.0.1: `esmodules` `src/main.mjs`, `styles` `styles/mon1e.css`, `languages` `lang/en.json`; no `manifest`/`download`/`url` fields.
- `src/` has `constants.mjs`, `main.mjs`, `foundry/`, `models/`, `rules/`, `sheets/`; `templates/*.hbs` loaded at runtime by the sheets, so they are required in the ZIP though not listed in the manifest.
- `scripts/check-manifest.mjs` (from #24) exports `validateManifest`, has `--root` CLI option and the `pathToFileURL` entry guard — reuse its manifest read helpers and path rules.
- `package.json`: `check` = typecheck, test, `check:manifest`, lint. `private: true`, version `0.0.1`.
- CI `ci.yml`: one `quality` job on `ubuntu-latest`, Node 26, `npm ci` + `npm run check`; `contents: read`.
- No ZIP npm dependency installed; `/usr/bin/zip` available on macOS; `zip`/`unzip` are preinstalled on `ubuntu-latest`.
- `dist/` not ignored yet. Working tree has unrelated uncommitted changes (`.gitignore`, cadrage doc): add `dist/` without disturbing them.

## 4. Architecture decisions
- Pure core / thin shell, as in `src/rules` and `check-manifest`: `buildPackagePlan` and `verifyPackage` take plain data; fs/zip/hash I/O only in the CLI parts.
- ZIP tool: system `zip`/`unzip` via `child_process.execFileSync` (array args, no shell). No new npm dependency, per framing ("no library imposed on principle"). Entries added from a sorted explicit list with `zip -X` (no extra attributes). Alternative if portability bites: `fflate`, only with user approval.
- Templates are not in the manifest, so the allowlist is directory-based (`src`, `templates`, `styles`, `lang`) plus manifest-derived paths; verify then asserts both that manifest paths exist and that nothing outside the allowlist is present.
- Release manifest generation reads `system.json`, never writes it. Release URL fields come from a single constant in the script (`https://github.com/behaska/foundryvtt-mon1e/releases/...`); framing marks those URLs as future targets, so they are not claimed verified. Version tag in `download` taken from manifest `version`.
- ZIP layout: files at archive root (`system.json`, `src/...`), not nested in a `mon1e/` folder — Foundry extracts into `systems/<id>/`. Verify asserts this.
- Same-contents guarantee for CI: the artifact is `dist/` produced by the very same `npm run package` a release would run; `verify:package` runs before upload.
- Node ≥ 26 only as CI; scripts use `node:` builtins (`crypto`, `fs`, `child_process`).
- Typecheck: tests import the scripts, pulling them into `tsc` transitively; JSDoc must pass `strict` without editing `tsconfig.json`.

## 5. Work plan
1. Confirm v14 package install contract from official docs (manifest `manifest`/`download` fields, ZIP root layout); record sources in `docs/DEVELOPMENT.md`.
2. Failing tests first (`tests/package.test.mjs`): plan includes manifest-referenced files and `templates/`; plan excludes `tests/`, `node_modules`, `docs/`; release manifest adds release fields and keeps `id`/`version`/`compatibility`; input manifest object not mutated; `verifyPackage` fails when `system.json` not at root, when an `esmodules` file is missing (acceptance 1), when a forbidden path is present, when ZIP manifest differs from `dist/system.json`, when `SHA256SUMS` mismatches; passes on a valid entry list.
3. Implement `scripts/package.mjs` until package tests pass; implement `scripts/verify-package.mjs`.
4. Add `package`, `verify:package` to `package.json`; add `dist/` to `.gitignore`.
5. Local macOS run: `npm run package && npm run verify:package`; extract ZIP to a temp dir, confirm `system.json` at root; `git status` shows sources unchanged (acceptance 4).
6. Negative runs: build ZIP omitting `src/main.mjs` (temporary allowlist edit or crafted ZIP) → verify exits 1; add a `tests/` entry → exits 1; tamper `SHA256SUMS` → exits 1. Revert all, record in docs.
7. Update `ci.yml`: package, verify, upload `dist/` artifact (`if-no-files-found: error`, SHA-pinned action, keep `contents: read`).
8. Update `docs/DEVELOPMENT.md` (commands, coverage, limits, verification record with date).
9. `npm run check` green; PR to `main`; confirm CI job green and download the artifact to compare its listing/hashes with the local `dist/`.

## 6. Likely modified files
- New: `scripts/package.mjs`, `scripts/verify-package.mjs`, `tests/package.test.mjs`.
- Modified: `package.json` (scripts only), `.gitignore` (add `dist/`), `.github/workflows/ci.yml`, `docs/DEVELOPMENT.md`.
- Not touched: `system.json`, `tsconfig.json`, `src/`, `templates/`, `lang/`, `styles/`.

## 7. Expected tests
- `node --test tests/package.test.mjs`: all cases of step 2 pass, including the missing-required-file failure.
- `npm run check` stays green (new tests included, typecheck still clean on unchanged `tsconfig`).
- Manual: `npm run package && npm run verify:package` exit 0 on macOS; step-6 negative runs exit 1; `unzip -l dist/mon1e.zip` shows `system.json` at root; `git status` clean of source changes; `shasum -a 256 -c dist/SHA256SUMS` passes from `dist/`.
- CI: `quality` job green, artifact present with `mon1e.zip`, `system.json`, `SHA256SUMS`; a throwaway commit removing a required file turns it red.
- No Foundry runtime test: install in Foundry v14 is out of scope.

## 8. Risks and mitigations
- Allowlist drifts when new top-level source dirs appear → verify checks every manifest-referenced file plus entry-graph imports, so a new module outside the allowlist fails fast; document how to extend.
- Dynamic `import()` or runtime-loaded template paths not caught by static analysis → templates covered by directory allowlist; document the limit.
- ZIP bytes differ between runs (mtimes), so checksum is per build, not reproducible → acceptable here; CI artifact checksum is the reference. Normalize mtimes only if cheap, else note as follow-up.
- `zip`/`unzip` absent on some machine → fail with a clear message; Windows not supported yet (issue asks macOS + CI Linux).
- Release URLs in `download` point to not-yet-existing releases → label as targets in docs; do not assert they resolve.
- `SHA256SUMS` format mismatch with `sha256sum`/`shasum -c` → verified in step 9 manually and in verify script.
- Unrelated uncommitted edits in `.gitignore` → edit only the added line, review the diff before commit.

## 9. Stop criteria
- Stop and ask if official v14 docs require a different ZIP root layout or manifest URL fields than assumed.
- Stop and ask if `zip`/`unzip` cannot be relied on in CI or on macOS and an npm ZIP dependency becomes necessary.
- Stop if satisfying typecheck needs a `tsconfig.json` scope change.
- Done when: omitting a required file fails `verify:package` (unit-tested), ZIP extracts with `system.json` at root, CI uploads the verified `dist/` artifact, sources are unmodified after packaging, docs updated, PR green.
