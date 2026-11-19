# Implementation plan — Mon1e system recognized by Foundry and test world starts
**Issue**: https://github.com/behaska/foundryvtt-mon1e/issues/3 (parent: #1)
**ADR**: none (no ADR directory configured)
**Likely impacted modules**: `system.json`, `src/main.mjs`, `src/constants.mjs`, `docs/DEVELOPMENT.md` (all already exist)

Framing source: `documentation/cadrage/bootstrap/bootstraping-initial-project.md` (French), phases **P0 and P1**.

## 1. Objective
Prove end to end that Foundry VTT 14.370 recognizes the `mon1e` system, a disposable test world starts with it, and the `init` diagnostic message appears with no blocking console error.

## 2. Scope
### Included
- P0: confirm Foundry 14.370, Node.js, Git; identify the `<User Data>` path.
- P1: valid `system.json`, ES module entry point logging on `init`, system visible in Foundry, test world created and started.
- Record the real verification result (passed / failed / not run) in `docs/DEVELOPMENT.md`.

### Out of scope
- `typecheck` / `test` / `check` commands (issue #4), development workflow and rules docs (#5).
- Data models, Actor/Item types, sheets, mechanics, packaging (#6 to #9).
- Any Mon rule.

## 3. Existing state
- Code side is largely done (commit `60c9e09`, `d5f0562`): `system.json` has id `mon1e`, type `system`, compatibility minimum/verified 14, version 0.0.1, `esmodules: ["src/main.mjs"]`.
- `src/main.mjs` logs `diagnosticMessage(game.system.version)` in `Hooks.once("init")`; the message builder lives in `src/constants.mjs` (pure, tested).
- `docs/DEVELOPMENT.md` still says the `<User Data>` path is "to be filled in" and that Foundry/VS Code are not verified.
- Nothing proves yet that Foundry loads the system. All four acceptance criteria need real-runtime evidence.
- CLAUDE.md "Project state" is stale (says scaffold only); not part of this issue, route via `update-context`.

## 4. Architecture decisions
- No new code expected: this issue is verification. Change code only if verification fails (manifest or entry point defect).
- Foundry integration is verified in the real runtime, not by `checkJs` (`src/main.mjs` is excluded from typecheck).
- The link `<User Data>/Data/systems/mon1e` → repository is created **by the maintainer** (decision from the issue #1 plan); the agent creates nothing in `<User Data>`.
- Check the manifest fields and `init` hook usage against official Foundry v14 docs before any change.
- Test world is disposable and lives in `<User Data>`, never committed.

## 5. Work plan
1. **P0**: maintainer confirms Foundry 14.370 build, Node.js and Git versions, and gives the `<User Data>` path.
2. **Manifest review**: re-check `system.json` against the Foundry v14 manifest spec (required fields, `compatibility`, `esmodules` path relative to the system root). Fix only if a defect is found.
3. **Link**: maintainer creates `<User Data>/Data/systems/mon1e` → repository, confirms. Stop here until confirmed.
4. **Recognition**: start Foundry, confirm "Mon1e for Foundry VTT" is listed under Game Systems.
5. **World**: create a disposable test world with Mon1e, launch it.
6. **Console check**: open the browser console, confirm the `init` diagnostic message with the system version, and no blocking error (note warnings).
7. **Failure path**: if any step fails, diagnose (folder name ≠ id, manifest JSON error, module path, console error), fix minimally, rerun from step 4.
8. **Record**: update `docs/DEVELOPMENT.md` with versions, `<User Data>` path convention (no personal info beyond what the maintainer approves), the test-world procedure and the verification result with date.
9. **Wrap-up**: tick the four acceptance criteria on issue #3 (outside this plan), check Git state.

## 6. Likely modified files
- Modified: `docs/DEVELOPMENT.md` (verification result, User Data path, versions).
- Modified only on failure: `system.json`, `src/main.mjs`, `src/constants.mjs`, `tests/constants.test.mjs`.
- Do not edit by hand: `CLAUDE.md`, `AGENTS.md`, `.claude/`, `.agents/`.

## 7. Expected tests
- Manual in Foundry (primary): system listed; test world created and started; `init` message visible; no blocking console error. Record each as passed / failed / not run.
- Regression: `npm test` still passes if `src/constants.mjs` changes (command belongs to #4 but already exists).
- `checkJs` does not cover `src/main.mjs` or Foundry APIs; state this honestly in the record.

## 8. Risks and mitigations
- Folder name ≠ `id`: Foundry does not detect the system → link must be named `mon1e`; ask for confirmation, never assume.
- `compatibility.verified: 14` declared but not tested on 14.370 → record the actual version tested.
- Agent cannot drive the Foundry UI reliably → steps 1, 3 to 6 are maintainer-run; agent only asks for results and console output.
- Scope drift into #4/#5 (scripts, docs) → keep doc edits limited to verification record.

## 9. Stop criteria
- Foundry 14.370 unavailable or not launchable: stop after P0, report.
- Link not confirmed by the maintainer: do nothing in `<User Data>`, do not claim verification.
- System still not listed after fixing path and id: stop and diagnose before touching anything else.
- Any request for data models, sheets or Mon rules: out of scope, escalate.
