---
name: implement
description: "Implement one tracked piece of work in its shared Workstream worktree, verify it, and leave a durable GitHub handoff for review."
disable-model-invocation: true
---

# Implement

Implement one Issue or other explicitly bounded unit of work.

## Operator contract

`/implement` is a **Codex-owned flow by default**.

Unless the user explicitly overrides the operator for this run:

1. Require the configured operator to be `Codex`.
2. Use the native filesystem, process execution, shell, and local Git for all repository work.
3. Use authenticated `gh` CLI for every GitHub read and write, including Issues, Pull Requests, labels, comments, relationships, Project items, and handoffs.
4. Never invoke `@devspace`, `@github` MCP, the ChatGPT GitHub App, or direct REST/GraphQL as a fallback.
5. If native local execution or authenticated `gh` is unavailable, stop and report the missing capability.
6. If invoked from ChatGPT Web without an explicit operator override, do not inspect or modify the implementation worktree and do not perform implementation tracker mutations. Tell the user to run `/implement` in Codex.

An explicit override changes the operator only for that run; it does not permit transport fallback. The overridden operator must still use its own configured execution profile.

## Enter the Workstream

1. Read `docs/agents/issue-tracker.md` and `docs/agents/workstreams.md`.
2. Resolve the Codex execution profile and verify native local execution plus authenticated `gh` before any other operation.
3. Fetch the full active Issue, comments, Workstream root, source specification, blockers, and latest handoff through `gh`.
4. Run `/workstream-tracking` with operation `resolve`, then `reconcile`.
5. Confirm every blocker is closed.
6. Claim activity `implementation` before modifying code.

The claim must verify the configured worktree path, persistent branch, base branch, current `HEAD`, dirty state, and absence of an unexpected merge or rebase. If another operator still owns the Workstream and no explicit handoff names this operator, stop.

Capture the current `HEAD` as the implementation fixed point and record it on the Workstream root.

## Build

Implement only the active Issue's scope.

- Use `/tdd` where possible at the pre-agreed seams.
- Run focused tests and typechecking throughout.
- Keep unrelated findings out of the implementation diff.
- When a discovered bug or corrective task is durable and outside the current Issue's acceptance criteria, register a separate Issue through `/workstream-tracking`; otherwise record it on the current Issue.
- Do not create Issues for branches, worktrees, commits, or this agent session.

## Verify

Before handoff:

1. run the focused tests;
2. run relevant typechecking and linting;
3. run the full required suite once;
4. inspect `git diff` and `git diff --check`;
5. confirm only intended files changed;
6. commit to the current persistent Workstream branch when the repository policy requires commits.

Capture the implementation `HEAD`, commit list since the fixed point, commands run, and exact results.

## Handoff for review

Use `/workstream-tracking` with operation `handoff` on the active Issue or Pull Request, publishing the durable handoff through authenticated `gh`.

Record:

- fixed point and implementation `HEAD`;
- commits;
- outcome;
- verification;
- repository state;
- remaining work;
- next operator, activity, and action.

When implementation is ready for review, freeze the reviewed `HEAD`, keep the Project item active, and classify the review shape before naming the next skill.

Handoff to `/review-composer` when the review range has any of these signals:

- several implementation or corrective tickets contribute to one cumulative range;
- several domain slices are changed;
- the cumulative diff is large enough that one reviewer would need to compress or sample important areas;
- cross-cutting transactions, migrations, authorization, lifecycle, or integration seams need independent coverage;
- this is a cumulative re-review after several corrective Issues.

Handoff directly to `/code-review` only for a focused single-ticket, single-domain, or small Pull Request scope.

In both cases record the fixed point, reviewed HEAD, diff command, source tickets, applicable specifications, exclusions, and verification evidence. The routing decision must be explicit in the handoff.

## Review

The implementation handoff happens **before** review begins.

- If a different operator will review, stop after the handoff.
- Do not let Codex compose or run a review swarm. A large or cumulative range transfers to ChatGPT Web and `/review-composer`.
- For a focused review, the next ChatGPT Web session claims activity `review` and runs `/code-review` against the pinned fixed point and frozen implementation `HEAD`.
- For a swarm review, the next ChatGPT Web session claims activity `review-composition` and runs `/review-composer` against the same pinned range.

When review and required integration are complete, use `complete` for the Issue. Do not close the Workstream root merely because one implementation Issue finished or one merge landed.
