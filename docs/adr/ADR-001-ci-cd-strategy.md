# ADR-001: CI/CD strategy

- Status: Accepted
- Date: 2026-11-20
- Issue: #29 (milestone #21). Implemented by #23 to #28.

## Context

Mon1e is a native Foundry VTT v14 Game System: JavaScript ES Modules, no build step. The repository is public on GitHub. A pipeline is needed to gate changes and to ship an installable package, without giving automation the power to publish by itself and without claiming more than it proves.

Framing source: `documentation/cadrage/cicd/implementation-cicd.md` (French).

## Decision

1. **GitHub public repository and GitHub Actions.** No other CI service.
2. **Two workflows only.**
   - `.github/workflows/ci.yml`: runs on pull requests to `main` and on pushes to `main`, with `contents: read`.
   - `.github/workflows/release.yml`: `workflow_dispatch` only, no pull request trigger. `mode: draft` verifies `main` and creates a tag plus a **draft** release; a human publishes it; `mode: verify-published` then checks the public URLs.
3. **No build, bundler or transpile step.** The package is an archive of the source files as they are in the repository.
4. **Controlled manual release.** A push to `main` never publishes. Write permission (`contents: write`) is limited to the release workflow's draft job; fork pull requests cannot run it or obtain a write token.
5. **Foundry qualification is separate from CI.** It is a manual protocol run in Foundry v14 on the candidate ZIP before publication: [`docs/QUALIFICATION.md`](../QUALIFICATION.md).
6. **What a green pipeline proves.** Technical consistency only: typecheck, tests, manifest and package checks. It does not prove conformity to Mon rules (`docs/RULES.md` records none as confirmed) and does not prove the system works in Foundry.

## Licence

A public repository does **not** imply an open-source licence. No licence file exists. The licence for the code, and the terms under which Mon and Fringe Worlds content may appear in or alongside a public repository, are **not decided**. This ADR does not choose one. The open question is tracked in `docs/DEVELOPMENT.md` (finding F1).

## Consequences

- Publishing needs two human steps: qualification in Foundry, then publishing the draft.
- Nothing in the pipeline can regress silently into auto-publication; the workflow files are the source of truth for exact behaviour.
- Qualification stays slow and manual; it is accepted until a concrete need justifies more.

## Out of scope

Not adopted for now:

- self-hosted runners;
- Docker;
- SonarQube;
- multi-OS matrix;
- Foundry deployed per pull request, or a permanent Foundry test server;
- automatic publication to the official Foundry catalog;
- a global coverage target (a few meaningful tests on critical behaviour are preferred over an arbitrary percentage).

Revisit any of these only on a concrete need.
