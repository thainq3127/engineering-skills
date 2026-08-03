---
name: setup-matt-pocock-skills
description: Configure this repo for the engineering skills — issue tracker access, shared Workstreams and worktrees, Projects v2, triage labels, and domain docs. Run once before first use of the other engineering skills.
disable-model-invocation: true
---

# Setup Matt Pocock's Skills

Scaffold the per-repository configuration that the engineering skills assume:

- **Issue tracker** — where durable Issues, Pull Requests, reviews, and decisions live
- **Workstreams** — how one root issue maps to one local worktree and branch, how operators claim it, and which GitHub Project is the control plane
- **Triage labels** — the strings used for the canonical triage roles
- **Domain docs** — where `CONTEXT.md` and ADRs live, and the consumer rules for reading them

This is a prompt-driven skill, not a deterministic script. Explore, present what you found, confirm with the user, then write.

## Process

### 1. Explore

Look at the current repository and connected tools. Read whatever exists; do not assume:

- `git remote -v` and `.git/config` — remote host, owner, and repository
- `git branch --show-current`, the configured default branch, and `git worktree list --porcelain`
- whether a connected `@github` MCP can read the repository, Issues, Pull Requests, Projects v2, Project fields, and Project items
- `AGENTS.md` and `CLAUDE.md` at the repository root, including any existing `## Agent skills` block
- `docs/agents/issue-tracker.md`, `docs/agents/workstreams.md`, `docs/agents/triage-labels.md`, and `docs/agents/domain.md`
- `CONTEXT.md`, `CONTEXT-MAP.md`, and ADR directories
- `.scratch/` — evidence of a local-markdown issue tracker convention
- whether the `triage` and `workstream-tracking` skills are installed
- monorepo signals such as `pnpm-workspace.yaml`, a `workspaces` field, or multiple populated packages

If GitHub Projects v2 is already in use, list the available Projects, fields, and a small sample of items before recommending one. Do not mutate anything during exploration.

### 2. Present findings and ask

Summarise what exists, what is missing, and what can be reused. Take the sections in order, one answer at a time. Lead with the recommended answer so the user can accept it briefly.

#### Section A — Issue tracker and GitHub access

The issue tracker is where specifications, implementation Issues, bugs, diagnosis, review findings, corrective work, decisions, and Pull Requests live.

Default posture in this fork:

- When the remote is GitHub and `@github` MCP is connected, recommend **GitHub through MCP**.
- Record that local `git` is used for worktrees, branches, commits, refs, and diffs.
- Do not recommend `gh` as an automatic fallback.
- When MCP lacks an operation, the configured behavior is to report the capability gap unless the user explicitly opts into a named fallback.

Other supported tracker choices remain:

- **GitLab** through the configured GitLab tooling
- **Local markdown** under `.scratch/<feature>/`
- **Other** — record the user's workflow as freeform prose

Write the result to `docs/agents/issue-tracker.md`. For GitHub, start from [issue-tracker-github.md](./issue-tracker-github.md).

#### Section B — Shared Workstreams

Run this section when `workstream-tracking` is installed. Otherwise omit it.

Recommend enabling Workstreams when work spans multiple sessions or when ChatGPT Web, Codex, and humans take turns on the same local code. Explain the invariant:

> One durable Workstream has one canonical root issue, one persistent local worktree, one persistent branch, and one cooperative current operator.

Collect or confirm:

1. Whether Workstreams are enabled.
2. GitHub Projects v2 owner, number, and title. Prefer a clean existing Project; create a new one only after confirmation.
3. Status mapping for queued, active, and done using fields that actually exist.
4. Absolute directory under which Workstream worktrees live.
5. Default base branch.
6. Worktree path and branch naming patterns.
7. Allowed operator names, normally `ChatGPT Web`, `Codex`, `Human`, and `Unassigned`.
8. Label registry and whether optional `area:*` labels already exist.
9. Fallback policy when GitHub MCP lacks an operation. Recommend no fallback.

Write the result to `docs/agents/workstreams.md`, using [workstreams.md](./workstreams.md) as the seed. If disabled, still write a short file saying Workstreams are disabled so model-invoked skills do not guess.

#### Section C — Triage label vocabulary

Skip this section when `triage` is not installed.

Ask exactly one question:

> Do you want to keep the default triage labels? (recommended: **yes**)

The defaults are `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, and `wontfix`. Only collect overrides when the repository already uses different strings for those canonical roles.

Write the mapping to `docs/agents/triage-labels.md`.

#### Section D — Domain docs

Default to **single-context**: one `CONTEXT.md` and `docs/adr/` at the repository root.

Offer **multi-context** only when exploration found a genuinely large multi-package repository. Then confirm a root `CONTEXT-MAP.md` and per-context `CONTEXT.md` layout.

Write the result to `docs/agents/domain.md`.

### 3. Confirm and edit

Show the user drafts of:

- the `## Agent skills` block;
- `docs/agents/issue-tracker.md`;
- `docs/agents/workstreams.md` when Workstreams are installed;
- `docs/agents/triage-labels.md` when triage is installed;
- `docs/agents/domain.md`.

Let the user edit the drafts before writing. Do not create, rename, delete, or reconfigure a GitHub Project until the user has approved the design and the available MCP operations have been verified.

### 4. Write

Choose the instructions file:

- If `CLAUDE.md` exists, edit it.
- Else if `AGENTS.md` exists, edit it.
- If neither exists, ask which one to create.

Never create the other file when one already exists. Update an existing `## Agent skills` block in place and preserve surrounding user content.

Use this shape, omitting sections for skills that are not installed:

```markdown
## Agent skills

### Issue tracker

[one-line tracker and access summary]. See `docs/agents/issue-tracker.md`.

### Workstreams

[one-line Project/worktree/operator summary]. See `docs/agents/workstreams.md`.

### Triage labels

[one-line triage vocabulary summary]. See `docs/agents/triage-labels.md`.

### Domain docs

[one-line single-context or multi-context summary]. See `docs/agents/domain.md`.
```

Seed files in this skill folder:

- [issue-tracker-github.md](./issue-tracker-github.md)
- [issue-tracker-gitlab.md](./issue-tracker-gitlab.md)
- [issue-tracker-local.md](./issue-tracker-local.md)
- [workstreams.md](./workstreams.md)
- [triage-labels.md](./triage-labels.md)
- [domain.md](./domain.md)

For another tracker, write `docs/agents/issue-tracker.md` from the user's description. Keep source-of-truth boundaries explicit.

### 5. Done

Report:

- files written or updated;
- tracker and GitHub access policy;
- Workstream Project, worktree root, base branch, and operators;
- which skills now consume each file;
- any MCP capability gaps left pending.

The user may edit `docs/agents/*.md` directly later. Re-run setup only when switching trackers, changing the Workstream control plane, changing worktree layout, or restarting configuration from scratch.
