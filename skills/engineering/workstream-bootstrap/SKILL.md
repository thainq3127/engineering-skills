---
name: workstream-bootstrap
description: Create one durable Workstream from the configured bootstrap checkout, provision its GitHub and local control-plane artifacts, and emit ready-to-paste ChatGPT Project instructions.
disable-model-invocation: true
---

# Workstream Bootstrap

Create one durable Workstream before planning or implementation begins.

This flow turns a confirmed objective into one canonical root Issue, one persistent branch, one persistent local worktree, one GitHub Project item, one bootstrap handoff, and one ready-to-paste ChatGPT Project configuration.

It does not write a specification, create implementation tickets, modify production code, or claim the Workstream for an operator that has not entered it yet.

## Operator contract

`/workstream-bootstrap` is a **Codex-owned flow by default**.

Unless the user explicitly overrides the operator for this run:

1. Require the configured operator to be `Codex`.
2. Use the native filesystem, process execution, shell, and local Git for all repository work.
3. Use authenticated `gh` CLI for every GitHub read and write, including Issues, labels, native relationships, Project items, comments, and handoffs.
4. Never invoke `@devspace`, connected `@github` MCP, the ChatGPT GitHub App, or direct REST/GraphQL as a fallback.
5. If native local execution or authenticated `gh` is unavailable, stop and report the missing capability.
6. If invoked from ChatGPT Web without an explicit operator override, do not inspect or mutate the bootstrap checkout, GitHub Project, or Workstream artifacts. Tell the user to run `/workstream-bootstrap` in Codex.

An explicit override changes the operator only for that run. It does not permit transport fallback; the selected operator must still use its configured execution profile.

## Configuration precondition

Read both files before doing anything:

- `docs/agents/issue-tracker.md`;
- `docs/agents/workstreams.md`.

Require Workstreams to be enabled and the configuration to name:

- repository and GitHub access policy;
- GitHub Project owner, number, title, and status mapping;
- absolute bootstrap checkout;
- absolute Worktree root;
- default base branch;
- worktree path and branch patterns;
- Codex execution profile;
- label registry.

If configuration is missing or incomplete, stop and tell the user to run `/setup-matt-pocock-skills`. This skill must not invoke that user-invoked setup flow itself and must not invent missing values.

## Identity vocabulary

Keep these identities separate:

- **Bootstrap checkout**: the stable control checkout from which new Workstreams are provisioned. It is not itself a Workstream.
- **Workstream root**: the canonical GitHub root Issue.
- **Display name**: the human-readable Workstream and ChatGPT Project name.
- **Slug**: lowercase ASCII identity used by the worktree folder, branch, and `ws:<slug>` label.

The worktree folder basename must equal the confirmed slug. A display name may contain spaces and capitalization; the path must not.

## State machine

Run exactly these stages:

```text
PREFLIGHT
-> DISCOVER
-> QUALIFY
-> INTERVIEW
-> PREVIEW
-> AWAIT_CONFIRMATION
-> PROVISION
-> VERIFY
-> GENERATE_CHATGPT_HANDOFF
-> STOP
```

Do not create or mutate durable state before `AWAIT_CONFIRMATION` succeeds.

## 1. Preflight

Before asking questions:

1. Resolve the Codex execution profile and verify native local execution plus authenticated `gh`.
2. Confirm the current directory is exactly the configured bootstrap checkout.
3. Confirm the current directory is not already a configured Workstream worktree.
4. Confirm the repository remote matches `docs/agents/issue-tracker.md` and `docs/agents/workstreams.md`.
5. Confirm no merge or rebase is active in the bootstrap checkout.
6. Resolve the configured base branch and its current commit.
7. Confirm the Worktree root exists or can be created safely.
8. Confirm the configured GitHub Project and required status field are readable.

Do not modify or clean a dirty bootstrap checkout. Record its dirty state, use the resolved configured base ref rather than uncommitted contents, and leave the checkout untouched. If the dirty state makes the base ref ambiguous, stop.

## 2. Discover

Explore read-only before interviewing:

- repository owner and name;
- configured default base branch and resolved base SHA;
- existing local worktrees and branches;
- open and recently closed Workstream root Issues;
- existing `ws:*` labels;
- configured Project fields and a small sample of Workstream items;
- related Issues, Pull Requests, specifications, or decisions already named by the user or discoverable by exact identity.

Use discovery to avoid asking for values already configured and to detect duplicate names, slugs, paths, branches, or roots.

## 3. Qualify the objective

A Workstream is appropriate when the objective is durable and likely to span multiple sessions, artifacts, phases, or operators. A merge checkpoint does not necessarily finish it.

Do not create a Workstream merely because:

- a new chat started;
- one small bug or ticket exists;
- one branch would be convenient;
- review or correction began;
- an ordinary merge checkpoint occurred.

When the described work is one bounded ticket with one completion condition, recommend an ordinary Issue or existing Workstream instead and stop before provisioning.

## 4. Interview

Ask one question at a time. Lead with a concrete recommendation whenever discovery supports one, skip answers already established in the conversation, and never ask the user to repeat repository configuration.

Collect in this order:

### A. Durable objective

Ask:

> What durable outcome must this Workstream achieve?

Require an outcome that describes a changed user, product, or system capability rather than an activity such as "work on web" or "refactor code".

### B. Completion conditions

Ask:

> What observable conditions prove it is complete?

Capture one to five checkable conditions. These are Workstream completion conditions, not a substitute for a later specification or Delivery Context.

### C. Existing context

Ask:

> Which existing Issues, PRs, specs, or docs belong here?

Accept exact references or `None`. Link existing artifacts only after confirming they belong to this objective; do not silently reinterpret them as requirements.

### D. Initial boundaries

Ask only when boundaries are not already clear:

> What must this Workstream deliberately not cover yet?

Keep these as bootstrap boundaries. `/to-spec` later owns the confirmed Delivery Context and detailed non-goals.

### E. Name and slug

Derive and propose:

- one concise display name;
- one canonical slug;
- resulting root Issue title;
- resulting worktree path;
- resulting branch;
- resulting `ws:<slug>` label;
- matching ChatGPT Project name.

Then ask:

> Use this Workstream name and slug?

Validate the slug before confirmation:

- lowercase ASCII only;
- characters limited to `a-z`, `0-9`, and `-`;
- no leading, trailing, or repeated `-`;
- reasonably short, normally at most 50 characters;
- no collision with an existing Workstream root, label, branch, or worktree path.

### F. Base ref

Use the configured default base branch without asking unless the user already named another base, the objective depends on an unmerged branch, the configured base is missing, or discovery found ambiguity.

When confirmation is needed, ask:

> Use `<base-branch>` at `<short-sha>` as the base?

Always pin the resolved SHA in the preview and root state.

### G. First workflow step

Recommend one first ChatGPT step:

- `/grill-with-docs` when the idea is still fuzzy but can fit one planning context;
- `/wayfinder` when the effort is too large or unclear for one planning session;
- `/to-spec` when the direction is already settled enough to synthesize and confirm Delivery Context;
- `/diagnosing-bugs` when a defect exists but its cause is unknown;
- `/implement` only when an existing agent-ready Issue already defines the bounded work;
- `/ask-matt` when no more specific route is justified.

Ask the user to confirm or replace the recommendation.

## 5. Preview and await confirmation

Publish one confirmation packet containing:

- repository;
- configured GitHub Project and initial status;
- bootstrap checkout;
- display name and slug;
- durable objective;
- completion conditions;
- existing source artifacts;
- initial boundaries;
- worktree path;
- branch;
- base branch and exact SHA;
- root Issue title and labels;
- initial operator and activity, both `Unassigned`;
- recommended first ChatGPT skill;
- every durable artifact that will be created or repaired.

Ask exactly:

> Create this Workstream with the configuration above?

Do not provision from silence, an earlier partial approval, or approval of only the name. If the user amends the packet, republish the changed packet and wait for explicit approval.

## 6. Provision

Immediately before the first mutation, repeat duplicate and collision checks.

Run `/workstream-tracking` with operation `ensure`, identifying this flow as the approved bootstrap caller. Provision idempotently in this order:

1. create or reuse the exact configured labels;
2. create or repair one canonical `[Workstream] <display-name>` root Issue;
3. create the persistent branch from the pinned base SHA only when it does not already exist;
4. create the worktree at the exact configured path only when the path is absent and safe;
5. record worktree, branch, base branch, fixed point, and current HEAD in the root managed block;
6. add the root Issue to the configured GitHub Project and map it to the configured queued status;
7. link confirmed existing artifacts when the relationship is supported and semantically correct;
8. post one bootstrap handoff comment on the root;
9. point the root managed block at that handoff.

The bootstrap handoff records:

- operator `Codex` and activity `bootstrap` completed;
- objective and completion conditions;
- source artifacts and boundaries;
- worktree path, branch, base branch, base SHA, and current HEAD;
- repository dirty and merge/rebase state;
- unresolved questions;
- next operator `ChatGPT Web`;
- next activity `planning`;
- the confirmed first slash skill and one exact next action.

After provisioning, leave the Workstream-level state as:

- Operator: `Unassigned`;
- Activity: `Unassigned`;
- Active artifact: the Workstream root;
- Fixed point: the pinned base SHA;
- Current HEAD: the new worktree HEAD;
- Last handoff: the bootstrap handoff URL;
- Next action: create the ChatGPT Project and continue from that handoff.

Do not pre-claim planning for ChatGPT Web. The next ChatGPT session resolves the root and claims its own activity after the human actually creates and enters the Project.

## 7. Verify

Run `/workstream-tracking` with operation `reconcile`, then verify independently:

- one canonical root Issue exists with the expected markers and labels;
- the root is in the configured Project at the queued status;
- the worktree path exists and its basename equals the slug;
- the worktree is attached to the expected persistent branch;
- the branch and worktree HEAD equal the pinned base SHA at bootstrap time;
- no unrelated worktree or branch was repointed;
- the bootstrap checkout was not modified;
- the root state is unassigned and points to the bootstrap handoff.

Any mismatch is a stop condition. Repair only omissions that `/workstream-tracking` defines as safe and idempotent. Never overwrite a non-empty path, reset an existing branch, delete a worktree, or delete a branch to make verification pass.

## 8. Generate the ChatGPT handoff

Read the bundled [project-instructions.template.md](./project-instructions.template.md) and replace every placeholder with confirmed stable identity:

- `project.name`: Workstream display name;
- `project.repository`: owner/repository;
- `project.workspace`: absolute Workstream worktree path;
- `project.workstream_root`: owner/repository#root-number;
- `project.workstream_slug`: confirmed slug;
- `project.github_project`: configured Project number.

Do not insert dynamic execution state such as current HEAD, active artifact, claim, blockers, dirty state, review range, or next action into Project instructions.

Output exactly these four sections:

### Creation receipt

Include root Issue URL, GitHub Project, worktree path, branch, pinned base SHA, and verification result.

### ChatGPT Project name

Use the confirmed Workstream display name.

### ChatGPT Project instructions

Print one complete copy-ready block with no placeholders.

### Start in ChatGPT

Tell the user to:

1. create a new ChatGPT Project with the provided name;
2. choose project-only memory when that option is available and isolation is desired;
3. open the Project settings and paste the generated instructions;
4. ensure the required local workspace and GitHub connectors are available;
5. start the first chat with the exact prompt below.

Generate the first prompt as:

```text
Continue Workstream `<owner/repository#number>`. Resolve the latest bootstrap handoff and current local state, then run `/<confirmed-first-skill>`.
```

Stop after this handoff. Do not begin planning, specification, ticketing, implementation, or review in the bootstrap session.

## Idempotency and stop conditions

Safe repetition is mandatory.

- Reuse an exact existing root, branch, worktree, label, or Project item only when all recorded identities agree.
- Repair a missing managed block field, label, Project registration, or handoff pointer only when the ownership is unambiguous.
- Stop on conflicting roots, slug collisions, path collisions, unrelated branches, mismatched repositories, ambiguous Projects, unsupported native relationships, missing transports, or a different active Workstream claim.
- Never delete or reset local or GitHub state automatically.
