---
name: workstream-tracking
description: Coordinate one durable engineering workstream across a GitHub root issue, one local Git worktree and branch, active Issues or Pull Requests, Project state, and agent handoffs. Use whenever planning, implementation, diagnosis, review, correction, or integration must resolve, claim, update, hand off, reconcile, or complete shared work.
---

# Workstream Tracking

A reusable control-plane discipline for engineering flows.

A **Workstream** is one durable objective worked through one persistent local Git **Worktree** and branch. GitHub carries the durable shared context; local Git carries execution truth. ChatGPT Web, Codex, and humans may take turns, but only one operator may control the workstream at a time.

This skill is not a user-facing project-management flow. Other skills invoke it at lifecycle boundaries.

## Configuration precondition

Read both files before doing anything:

- `docs/agents/issue-tracker.md` — tracker access and mutation rules
- `docs/agents/workstreams.md` — Project, worktree layout, operators, labels, and status mapping

If either file is missing or incomplete, stop and tell the user to run `/setup-matt-pocock-skills`. Do not invent Project numbers, label names, worktree roots, branch patterns, or fallback tools.

If `docs/agents/workstreams.md` explicitly says Workstreams are disabled, return a no-op result to the caller. Do not create roots, labels, worktrees, branches, claims, handoffs, or Project items. The caller continues with its ordinary standalone tracker behavior.

## Source-of-truth boundaries

- **GitHub Issues and Pull Requests** hold specifications, implementation contracts, bugs, diagnosis, decisions, reviews, corrective work, and handoff comments.
- **GitHub Projects v2** is the operational control plane: active workstreams, active or frontier artifacts, and their current status.
- **Local Git** is authoritative for worktree path, branch, base branch, HEAD, fixed points, dirty state, and merge or rebase state.
- The **Workstream root issue** is the canonical identity and low-resolution index for the shared objective.

Never treat a Project field or issue-body snapshot as more current than local Git.

## Hard rules

1. One Workstream maps to exactly one local worktree and one persistent branch.
2. A Workstream has exactly one canonical root issue.
3. Do not create Issues for worktrees, branches, commits, chat sessions, agent sessions, or ordinary merge checkpoints.
4. Do not create a new Workstream because a chat changed, a ticket changed, review began, corrective work appeared, or the branch merged once.
5. Before every mutation, search for the existing root, label, issue, Project item, relationship, or managed block. Every operation must be safe to repeat.
6. Use the connected GitHub MCP path described in `docs/agents/issue-tracker.md`. Do not silently fall back to `gh`, direct API calls, a GitHub App, or manual UI work.
7. Only one operator may control the Workstream at a time. Never steal a claim automatically.
8. Project items contain operational state and links, never the full specification, diagnosis, review, or decision.
9. A merge is an integration checkpoint, not automatic completion of the Workstream.
10. Never delete the local worktree or branch automatically. Mark it eligible for cleanup and require an explicit instruction.

## Lifecycle operations

The caller should name the operation it needs:

- `resolve` — identify and validate the Workstream without taking ownership
- `ensure` — create or repair the root, label, worktree, branch, and Project registration
- `claim` — take cooperative ownership for one activity and active artifact
- `register` — attach a durable Issue or Pull Request to the Workstream
- `handoff` — record enough state for the next operator to continue
- `transition` — move between planning, implementation, diagnosis, review, correction, integration, and completion
- `reconcile` — compare GitHub state with local Git and repair safe omissions
- `complete` — finish an artifact or the whole Workstream under explicit completion rules

## Resolve

Resolve in this order:

1. An explicit root issue supplied by the user or caller.
2. A machine marker in the active Issue or Pull Request body.
3. A native parent/sub-issue relationship.
4. The configured `ws:<slug>` label plus an exact root-title search.
5. The current local worktree path or branch recorded by a root issue.

Do not infer a Workstream from a vaguely similar title or branch name when multiple roots could match. Report the ambiguity instead.

After resolving, validate:

- root issue exists and has the configured root and Workstream labels;
- current repository is the repository recorded by the Workstream;
- local directory is the recorded worktree;
- current branch is the recorded persistent branch;
- base branch exists;
- root is present in the configured Project;
- active artifact, operator, activity, and next action agree across the root state and latest handoff.

`resolve` is read-only.

## Ensure

Use `ensure` only when a user-invoked flow has already established that this is a durable, multi-step objective deserving a Workstream.

Before creating anything, search for:

- an exact `[Workstream] <name>` title;
- the `workstream-root:v1` marker;
- the configured `ws:<slug>` label;
- an existing worktree path or branch matching the configured templates;
- a Project item for any matching root.

Then, in order:

1. Create missing configured labels, using the exact registry names, descriptions, and colours.
2. Create the root issue with the root template below, or repair only its managed block and required labels.
3. Create the persistent branch and worktree from the configured base branch only if neither already exists.
4. Record the exact absolute worktree path, branch, and base branch in the root managed block.
5. Add the root issue to the configured Project and map it to the queued or active status as appropriate.

Never overwrite a non-empty path, repoint an unrelated worktree, or recreate an existing branch from a different base.

## Claim

Claim one activity:

- `planning`
- `specification`
- `ticketing`
- `research`
- `prototype`
- `implementation`
- `diagnosis`
- `review`
- `correction`
- `integration`

Immediately before claiming:

1. Re-read the root issue and latest handoff.
2. Inspect `git worktree list --porcelain`, current branch, `HEAD`, dirty state, and merge/rebase state.
3. Confirm the active artifact exists and belongs to this Workstream.
4. Check the current operator.

The claim is idempotent when the same operator already owns the same activity and artifact. Otherwise:

- claim only when the Workstream is unassigned;
- or when the latest handoff explicitly names this operator or activity next;
- or when the user explicitly directs a takeover.

If another operator still owns it and no explicit handoff exists, stop. Do not modify the local worktree.

Capture a fixed point:

- implementation, diagnosis, or correction — current `HEAD` at claim time;
- review — the handed-off fixed point and reviewed `HEAD`;
- integration — the exact source and target refs.

Update only the root's managed state block, then set the root and active artifact to the configured active Project status.

Review is read-only against local files by default. Planning, specification, ticketing, and research may update tracker artifacts, `CONTEXT.md`, ADRs, specifications, tickets, and research notes, but not production code unless the user explicitly changes the activity. Prototype, implementation, diagnosis, correction, and integration may modify local code within their active artifact's scope. A reviewer must not review a moving target: review starts only after an explicit handoff pins the reviewed `HEAD`.

Nested model-invoked skills inherit the caller's claim. `/tdd`, `/domain-modeling`, `/research`, and other reusable disciplines must not replace an active claim merely because they were invoked inside a claimed flow. A standalone invocation that needs to write must resolve and claim an appropriate activity first.

## Register an artifact

Register only durable engineering artifacts:

- specification issue;
- implementation issue;
- bug issue;
- review issue when no Pull Request is the review surface;
- corrective issue;
- decision issue;
- cleanup issue with an independent completion condition;
- Pull Request that needs independent operational visibility.

For every registered Issue or Pull Request:

1. Search for duplicates by exact title, Workstream marker, labels, parent relationship, and recently closed matches.
2. Apply exactly one configured `kind:*` label and the `ws:<slug>` label.
3. Add the Workstream marker and root link without duplicating an existing section.
4. Use a native sub-issue relationship when supported and semantically correct.
5. Add it to the Project only when active, blocked, under review, integrating, or on the immediate frontier.

Do not mirror every child issue into the Project.

## Handoff

Handoff is the durable bridge between ChatGPT Web, Codex, and a human.

Post the handoff on the active Issue or Pull Request, not only on the root. Include:

- operator and activity completed;
- fixed point;
- current `HEAD` and relevant commits;
- outcome;
- verification commands and results;
- dirty, merge, or rebase state;
- unresolved findings or remaining work;
- next operator, next activity, and one concrete next action.

Then update the root managed block to point at that handoff and transfer or release the claim. Project state follows the next action: active while another phase remains, done only when the artifact is complete.

Do not paste full terminal logs or private reasoning. Record facts another operator needs to continue.

## Transition

Typical transitions are:

```text
planning -> specification -> ticketing -> implementation -> review
review -> correction -> review
review -> integration
diagnosis -> correction -> review
integration -> implementation   # another milestone remains
integration -> complete         # objective is satisfied
```

At each transition:

1. write the durable outcome to the current Issue or Pull Request;
2. create only genuinely independent follow-up issues;
3. register new corrective or frontier artifacts;
4. update the root's active artifact, operator, activity, and next action;
5. update Project statuses;
6. leave completed history in Issues and Pull Requests rather than duplicating it in the Project.

## Reconcile

Compare:

- root managed state;
- latest handoff;
- active Issue or Pull Request state and labels;
- Project membership and Status;
- local worktree path, branch, `HEAD`, dirty state, and merge/rebase state.

Repair safe, unambiguous omissions such as a missing label, root link, Project item, or stale status. Do not silently repair conflicting identities, change branches, discard local changes, close issues, or transfer ownership. Report those conflicts for a human decision.

Run `reconcile` at the start of a resumed session and before declaring completion.

## Complete

An artifact is complete only when its acceptance conditions are met, required verification is recorded, and no work remains in its scope. Close the Issue or merge the Pull Request through the configured tracker workflow, then set its Project item to done.

A Workstream is complete only when:

- its objective and explicit completion conditions are met;
- no active specification, implementation, bug, review, corrective, decision, or integration artifact remains;
- required integration into the base branch is recorded;
- the latest root state has no next action.

Post a final root outcome, close the root, and set it to the configured done status. Record the worktree and branch as eligible for cleanup, but do not remove them without explicit instruction.

## Root issue template

```markdown
<!-- workstream-root:v1 -->
<!-- workstream-slug:<slug> -->

## Objective

<durable outcome>

## Completion conditions

- [ ] <condition>

## Repository

- <owner/repo>

<!-- workstream-state:start -->
## Current state

- Worktree: `<absolute path>`
- Branch: `<persistent branch>`
- Base branch: `<base branch>`
- Operator: `<configured operator or Unassigned>`
- Activity: `<activity or Unassigned>`
- Active artifact: `<issue, PR, or None>`
- Fixed point: `<SHA/ref or None>`
- Current HEAD: `<SHA or Unknown>`
- Last handoff: `<link or None>`
- Next action: `<one concrete action or None>`
<!-- workstream-state:end -->
```

## Child marker

```markdown
<!-- workstream-root:<owner>/<repo>#<number> -->

## Workstream

- <linked Workstream root title>
```

## Handoff template

```markdown
<!-- workstream-handoff:v1 -->
## Handoff

- Operator: <operator>
- Activity: <activity>
- Fixed point: `<ref>`
- HEAD: `<sha>`

### Outcome

<what changed or was decided>

### Verification

- `<command>` — <result>

### Repository state

- Dirty: <yes/no and intentional files if yes>
- Merge/rebase: <state>

### Remaining work

- <item or None>

### Next

- Operator: <operator or Unassigned>
- Activity: <activity>
- Action: <one concrete next action>
```
