---
name: implement
description: "Implement one tracked piece of work in its shared Workstream worktree, verify it, and leave a durable GitHub handoff for review."
disable-model-invocation: true
---

# Implement

Implement one Issue or other explicitly bounded unit of work.

## Enter the Workstream

1. Read `docs/agents/issue-tracker.md` and `docs/agents/workstreams.md`.
2. Fetch the full active Issue, comments, Workstream root, source specification, blockers, and latest handoff.
3. Run `/workstream-tracking` with operation `resolve`, then `reconcile`.
4. Confirm every blocker is closed.
5. Claim activity `implementation` before modifying code.

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

Use `/workstream-tracking` with operation `handoff` on the active Issue or Pull Request.

Record:

- fixed point and implementation `HEAD`;
- commits;
- outcome;
- verification;
- repository state;
- remaining work;
- next operator, activity, and action.

When implementation is ready for review, transition to `review`, freeze the reviewed `HEAD`, and keep the Project item active.

## Review

The implementation handoff happens **before** review begins.

- If a different operator will review, stop after the handoff.
- If the current session is explicitly continuing as reviewer, transfer the claim to activity `review`, then run `/code-review` against the pinned fixed point and frozen implementation `HEAD`.

When review and required integration are complete, use `complete` for the Issue. Do not close the Workstream root merely because one implementation Issue finished or one merge landed.
