---
name: workstream-tracking
description: Coordinate one durable engineering workstream across a GitHub root issue, one local Git worktree and branch, active Issues or Pull Requests, Project state, agent handoffs, and bounded delegated review leases. Use whenever planning, implementation, diagnosis, review composition, delegated review, review synthesis, correction, or integration must resolve, claim, update, hand off, reconcile, or complete shared work.
---

# Workstream Tracking

A reusable control-plane discipline for engineering flows.

A **Workstream** is one durable objective worked through one persistent local Git **Worktree** and branch. GitHub carries the durable shared context; local Git carries execution truth. ChatGPT Web, Codex, and humans may take turns, but only one Workstream-level writer may control the objective at a time.

Review swarms are the bounded exception: one composer keeps the Workstream-level writer claim while parallel reviewers receive delegated read-only leases with non-overlapping child-Issue write surfaces. They do not become competing Workstream writers.

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

## Operator execution profiles

`docs/agents/workstreams.md` must define an execution profile for every allowed operator. A profile names:

- the activities the operator normally owns;
- the local workspace transport;
- the GitHub transport;
- forbidden transports;
- behavior when a required transport is missing.

Resolve the current operator and profile **before any tool call**.

Default profiles in this fork:

### ChatGPT Web

- normal activities: planning, specification, ticketing, review, review-composition, delegated-review, review-synthesis;
- local workspace transport: `@devspace`;
- GitHub transport: connected `@github` MCP;
- forbidden: native Codex filesystem or shell as a substitute, `gh`, direct GitHub REST or GraphQL, and the ChatGPT GitHub App.

All file reads, code inspection, Git commands, tests, and local writes must go through `@devspace`. All GitHub reads and writes must go through `@github`.

### Codex

- normal activities: implementation, diagnosis, correction, integration;
- local workspace transport: native filesystem, process execution, shell, and local Git;
- GitHub transport: authenticated `gh` CLI;
- forbidden: `@devspace`, `@github` MCP, the ChatGPT GitHub App, and direct REST or GraphQL calls as a fallback.

Codex must operate directly in the configured Workstream directory. It must not open the same directory through `@devspace`.

### Missing transport or mismatch

- A missing, disconnected, or unauthenticated required transport is a stop condition.
- Do not fall back to another operator's transport.
- If the current harness does not match the flow's default operator, stop unless the user explicitly overrides the operator for that run.
- Nested skills inherit both the active claim and the operator execution profile.

## Hard rules

1. One Workstream maps to exactly one local worktree and one persistent branch.
2. A Workstream has exactly one canonical root issue.
3. Do not create Issues for worktrees, branches, commits, chat sessions, agent sessions, or ordinary merge checkpoints.
4. Do not create a new Workstream because a chat changed, a ticket changed, review began, corrective work appeared, or the branch merged once.
5. Before every mutation, search for the existing root, label, issue, Project item, relationship, or managed block. Every operation must be safe to repeat.
6. Resolve and enforce the current operator execution profile before using any local or GitHub tool. Never substitute another operator's transport, even when it is connected and convenient.
7. Only one Workstream-level writer may control the Workstream at a time. Never steal a claim automatically. Parallel delegated reviewers are allowed only under an active composer claim and valid non-overlapping delegated review leases.
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
- `transition` — move between planning, implementation, diagnosis, review composition, delegated review, review synthesis, correction, verification, integration, and completion
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

- the current operator has one unambiguous configured execution profile;
- every required transport for that profile is available and usable;
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
- `review-composition`
- `delegated-review`
- `review-synthesis`
- `correction`
- `verification`
- `integration`

Immediately before claiming:

1. Resolve the current operator execution profile and verify its required transports.
2. Re-read the root issue and latest handoff through the configured GitHub transport.
3. Inspect `git worktree list --porcelain`, current branch, `HEAD`, dirty state, and merge/rebase state through the configured local workspace transport.
4. Confirm the active artifact exists and belongs to this Workstream.
5. Check the current operator.

The claim is idempotent when the same operator already owns the same activity and artifact. Otherwise:

- claim only when the Workstream is unassigned;
- or when the latest handoff explicitly names this operator or activity next;
- or when the user explicitly directs a takeover.

If another operator still owns it and no explicit handoff exists, stop. Do not modify the local worktree.

Capture a fixed point:

- implementation, diagnosis, or correction — current `HEAD` at claim time;
- focused review — the handed-off fixed point and reviewed `HEAD`;
- review composition and review synthesis — the handed-off fixed point, reviewed `HEAD`, and composer parent;
- delegated review — the exact range, slice, axis, and child Issue named by the delegated lease;
- integration — the exact source and target refs.

Update only the root's managed state block, then set the root and active artifact to the configured active Project status. A delegated reviewer does not update the root managed state block; it validates or records its lease on the assigned child Issue while the composer keeps the Workstream-level claim.

Review is read-only against local files by default. Planning, specification, ticketing, and research may update tracker artifacts, `CONTEXT.md`, ADRs, specifications, tickets, and research notes, but not production code unless the user explicitly changes the activity. Prototype, implementation, diagnosis, correction, and integration may modify local code within their active artifact's scope. A reviewer must not review a moving target: review starts only after an explicit handoff pins the reviewed `HEAD`.

## Delegated review leases

A delegated review lease permits one parallel reviewer to contribute to a Review Composer without replacing the Workstream-level claim.

The active swarm owner must retain:

- operator: the configured ChatGPT Web operator;
- activity: `review-composition`, `delegated-review`, or `review-synthesis`;
- active artifact: the composer parent Issue;
- fixed point and reviewed HEAD: the frozen review range.

Each delegated lease must name:

- composer Issue;
- child review Issue;
- frozen range;
- assigned slice;
- assigned axis;
- allowed write surface;
- local-code write policy;
- Project and Workstream mutation policy.

The allowed write surface is exactly one child review Issue. A worker may inspect code and Git history but may not modify local files, the composer parent, the Workstream root, Project state, sibling children, corrective Issues, diagnosis Issues, or the final verdict.

Parallel delegated review is permitted only because code access is read-only and GitHub write surfaces do not overlap. Review Composer is the sole writer during composition for:

- the parent composer Issue;
- the coverage matrix;
- review child prompts and leases;
- the launch list and synthesis-ready handoff.

Review Synthesizer becomes the sole writer during `review-synthesis` for:

- candidate and approved finding registers;
- the final synthesis, verdict, and deferred ledger;
- Workstream transitions and handoffs;
- corrective, diagnosis, or verification Issue creation;
- Project placement of follow-up work.

To claim `delegated-review`:

1. resolve the Workstream root, composer parent, child Issue, and native parent relationships;
2. confirm the parent carries the composer marker and holds the Workstream-level claim;
3. confirm the child contains a complete delegated lease;
4. confirm the lease range matches the composer range and the reviewed commit remains resolvable;
5. confirm no other reviewer lease writes to the same child;
6. record or validate the lease on the child without changing the root claim.

Missing lease, ambiguous slice or axis, non-native hierarchy, range mismatch, moving reviewed HEAD, overlapping write surface, or an inactive composer claim is a stop condition. Do not silently turn a delegated worker into a focused reviewer.

Nested model-invoked skills inherit the caller's claim **and execution profile**. `/tdd`, `/domain-modeling`, `/research`, and other reusable disciplines must not replace an active claim or switch transports merely because they were invoked inside a claimed flow. A standalone invocation that needs to write must resolve an operator profile and claim an appropriate activity first.

## Register an artifact

Register only durable engineering artifacts:

- specification issue;
- implementation issue;
- bug issue;
- review issue when no Pull Request is the review surface;
- Review Composer parent Issue;
- delegated review child Issue;
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

Review Composer hierarchy is strict:

- the composer parent is a native direct sub-issue of the Workstream root;
- review workers are native direct sub-issues of the composer parent;
- corrective and diagnosis Issues are native direct sub-issues of the Workstream root;
- a review worker is never parented by an implementation ticket;
- body links never substitute for native relationships;
- if the configured transport cannot mutate native sub-issues, report the capability gap and stop.

The composer parent is added to the Project while active. Review children stay outside the Project by default and are added only when blocked or requiring human attention. Corrective and diagnosis Issues are added only when active or on the immediate frontier.

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

A delegated reviewer is different: it posts completion only on its assigned child Issue and closes that child. It does not post a Workstream handoff or update the root. Review Synthesizer performs the review-synthesis handoff after every required child is complete.

Do not paste full terminal logs or private reasoning. Record facts another operator needs to continue.

## Transition

Typical transitions are:

```text
planning -> specification -> ticketing -> implementation -> review
implementation -> review-composition -> delegated-review -> review-synthesis
review-synthesis -> correction -> review-composition
review-synthesis -> diagnosis -> correction
review-synthesis -> verification
review-synthesis -> integration
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

A delegated review child is complete only when its required report, no-finding areas, verification limits, exclusions, and completion status are posted. Closing a child does not complete the composer.

A Review Composer parent is complete only when every child is complete, the coverage matrix is complete, human evaluation is approved, the final finding register, verdict, and deferred ledger are posted, approved follow-up artifacts exist, and Review Synthesizer records the next handoff. Corrective, diagnosis, and verification Issues created by synthesis remain siblings under the Workstream root; they do not need to close before the composer artifact itself can close.

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
