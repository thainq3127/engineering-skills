Quickstart:

```bash
npx skills add thainq3127/engineering-skills --skill=workstream-tracking
```

```bash
npx skills update workstream-tracking
```

[Source](https://github.com/thainq3127/engineering-skills/tree/main/skills/engineering/workstream-tracking)

## What it does

Workstream Tracking coordinates one durable objective across a canonical GitHub root issue, one persistent local worktree and branch, active Issues or Pull Requests, Project state, and handoffs between agents.

Its defining constraint is **one Workstream, one Worktree, one Workstream-level writer at a time**. GitHub is the shared memory and local Git remains authoritative for execution state. Review swarms are the bounded exception: one composer keeps the writer claim while delegated reviewers receive read-only leases with separate child-Issue write surfaces.

## When to reach for it

Type `/workstream-tracking`, or let another engineering skill invoke it automatically when work must be resolved, claimed, registered, handed off, reconciled, transitioned, or completed.

Reach for it whenever ChatGPT Web, Codex, or a human need to take turns on the same objective without losing context or writing into the same worktree concurrently.

## Prerequisites

Run [setup-matt-pocock-skills](https://aihero.dev/skills-setup-matt-pocock-skills) first. The repository must contain `docs/agents/issue-tracker.md` and `docs/agents/workstreams.md` describing tracker access, Project identity, worktree layout, operators, labels, and status mapping.

## Operator execution profiles

The Workstream claim also fixes the transport profile. ChatGPT Web uses `@devspace` locally and `@github` for GitHub. Codex uses native filesystem, shell, Git, and authenticated `gh`. Missing transport is a stop condition, and neither operator may borrow the other's transport. Nested skills inherit the active profile.

## Cooperative claims

A claim is a cooperative lock recorded on the Workstream root. It pins the operator, activity, active artifact, fixed point, HEAD, and next action. An agent never steals a live claim and a reviewer never reviews a moving target.

## Delegated review leases

A Review Composer can keep the Workstream claim while several reviewers work in parallel. Each lease fixes one composer Issue, one child review Issue, one frozen range, one slice, one axis, and one allowed write surface. The worker may inspect code but may write only to that child. Missing hierarchy or lease data stops the review rather than widening it.

The composer remains the only writer for the parent verdict, coverage matrix, Workstream transition, Project placement, and corrective or diagnosis ticket creation.

## Durable handoffs

Implementation, diagnosis, review, and integration end with a handoff comment on the active Issue or Pull Request. It records outcome, fixed point, HEAD, verification, repository state, remaining work, and the next operator. The Project shows operational state; it does not become a second copy of the report.

## It's working if

- every active Workstream has one root issue, one worktree, and one persistent branch;
- resumed sessions can continue from the latest Issue or Pull Request handoff;
- no branch, worktree, commit, or chat session becomes a tracking Issue;
- Project items show only roots and actionable artifacts;
- two agents never write into the same worktree at once;
- parallel reviewers have non-overlapping child-Issue write surfaces and do not mutate the root or Project;
- Codex never invokes `@devspace` or `@github`;
- ChatGPT Web never substitutes native Codex shell access or `gh`.

## Where it fits

This is a model-invoked infrastructure skill beneath the main engineering chain. [to-spec](https://aihero.dev/skills-to-spec), [to-tickets](https://aihero.dev/skills-to-tickets), [implement](https://aihero.dev/skills-implement), [review-composer](https://aihero.dev/skills-review-composer), [code-review](https://aihero.dev/skills-code-review), [diagnosing-bugs](https://aihero.dev/skills-diagnosing-bugs), [triage](https://aihero.dev/skills-triage), and [wayfinder](https://aihero.dev/skills-wayfinder) invoke it at their lifecycle boundaries. See [ask-matt](https://aihero.dev/skills-ask-matt) for the full map.
