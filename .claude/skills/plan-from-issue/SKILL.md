---
name: plan-from-issue
description: >
  Produce a versionable technical implementation plan from an issue, issue URL,
  issue number, or scoped brief. Uses injected project context for plan paths,
  architecture rules, domain mappings, language, and tracker conventions.
argument-hint: "[issue-url|issue-number|brief]"
compatibility: "claude-code;opencode"
disable-model-invocation: true
disallowed-tools: Agent
---

# Plan from issue

Use this skill when the user asks for an implementation plan from an issue or scoped brief.

## Mission

Produce a short, actionable implementation plan and write it as a versionable Markdown artifact in the location defined by the active project context.

The skill must:
1. understand the issue or brief;
2. read only the project context needed for the task;
3. identify the functional or business domain;
4. choose a stable domain path using the active project's domain mapping;
5. draft an actionable plan;
6. determine the target path using the project's planning convention;
7. check for collisions;
8. create the Markdown file;
9. return the exact created path.

## Required injected context

The active profile must provide, directly or through project context:
- `planning.root`;
- `planning.path_strategy`;
- `planning.filename_strategy`;
- optional `planning.template`;
- optional `architecture.adr_root`;
- optional `domain_mapping`;
- optional `artifact_language`.

If a required convention cannot be discovered from the repository or injected context, stop instead of inventing it.

## Absolute rules

1. Never implement or modify source code.
2. Never modify tracker issues.
3. Never run tests.
4. Never create a branch, commit, or pull/merge request.
5. Do not broaden the issue scope.
6. Inspect the existing plan root to respect local format and avoid collisions.
7. Read only ADRs directly relevant to the requested scope.
8. Never overwrite an existing plan silently.
9. If the target exists, return `BLOCKED: target plan file already exists: <path>`.
10. If the domain path is ambiguous and project context does not resolve it, return `BLOCKED: ambiguous business-domain path for plan directory.`
11. If the issue/brief is insufficient for a reliable plan, return the ambiguity instead of inventing details.

## Process

### 1. Understand the input
Identify, when available: issue reference, title, request type, business scope, acceptance criteria, and dependencies. If issue content cannot be accessed and the provided information is insufficient, block with a short request for the missing information.

### 2. Read minimal context
Read only the configured plan root, explicitly referenced files, directly relevant ADRs, and nearby tests only when needed to define expected validation. Do not scan the whole repository.

### 3. Determine the domain path
Apply injected `planning.path_strategy` and `domain_mapping`. Reuse an existing matching functional/business path when possible; avoid catch-all directories; block if multiple paths are equally plausible.

### 4. Determine the filename
Apply injected `planning.filename_strategy`. Unless project context says otherwise, prefer a short kebab-case slug based on the title and include the issue identifier when one exists.

### 5. Draft the plan
Use injected `planning.template` when present. Otherwise use:

```md
# Implementation plan — <Title>
**Issue**: <reference if available>
**ADR**: <reference if applicable>
**Likely impacted modules**: <paths if known>

## 1. Objective
## 2. Scope
### Included
### Out of scope
## 3. Existing state
## 4. Architecture decisions
## 5. Work plan
## 6. Likely modified files
## 7. Expected tests
## 8. Risks and mitigations
## 9. Stop criteria
```

Do not include implementation code.

### 6. Check collisions
List existing files in the target directory, confirm the exact target does not exist, and check obvious near-duplicates.

### 7. Create the file
Write the final plan to the selected target path.

### 8. Final response
Return only `Created <path>` or `BLOCKED: <reason>`.

## Context/token policy
Do not read the whole repository, all ADRs, or all tests. Load complementary context only for a concrete decision. Prefer deterministic repository inspection over inference. Block rather than guess missing project conventions.
