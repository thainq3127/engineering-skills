---
name: setup-matt-pocock-skills
description: Configure this repo for the engineering skills — issue tracker access, shared Workstreams and worktrees, Projects v2, triage labels, and domain docs. Run once before first use of the other engineering skills.
disable-model-invocation: true
---

# Setup Matt Pocock's Skills

Scaffold the per-repository configuration that the engineering skills assume:

- **Issue tracker** — where durable Issues, Pull Requests, reviews, and decisions live
- **Workstreams** — how one root issue maps to one local worktree and branch, which stable bootstrap checkout provisions new Workstreams, how operators claim them, and which GitHub Project is the control plane
- **Triage labels** — the strings used for the canonical triage roles
- **Domain docs** — where `CONTEXT.md` and ADRs live, and the consumer rules for reading them

This is a prompt-driven skill, not a deterministic script. Explore, present what you found, confirm with the user, write, then commit the repository setup before reporting success.

## Process

### 1. Explore

Look at the current repository and connected tools. Read whatever exists; do not assume:

- `git remote -v` and `.git/config` — remote host, owner, and repository
- `git branch --show-current`, the configured default branch, and `git worktree list --porcelain`
- the absolute current checkout and whether it is suitable as the stable bootstrap checkout for creating future Workstreams
- whether ChatGPT Web can use `@devspace` for local work and connected `@github` MCP for GitHub work
- whether Codex has native access to the intended worktree and authenticated `gh` CLI access to the repository
- `AGENTS.md` and `CLAUDE.md` at the repository root, including any existing `## Agent skills` block
- `docs/agents/issue-tracker.md`, `docs/agents/workstreams.md`, `docs/agents/triage-labels.md`, and `docs/agents/domain.md`
- `CONTEXT.md`, `CONTEXT-MAP.md`, and ADR directories
- `.scratch/` — evidence of a local-markdown issue tracker convention
- whether the `triage`, `workstream-bootstrap`, `workstream-tracking`, `review-composer`, and `review-synthesizer` skills are installed
- monorepo signals such as `pnpm-workspace.yaml`, a `workspaces` field, or multiple populated packages

Capture the pre-setup Git state of every file this flow may own:

- the selected root instruction file (`CLAUDE.md` or `AGENTS.md`);
- `docs/agents/issue-tracker.md`;
- `docs/agents/workstreams.md` when Workstreams are installed;
- `docs/agents/triage-labels.md` when triage is installed;
- `docs/agents/domain.md`.

Show any pre-existing changes to those paths in the confirmation draft. Do not silently fold unknown edits into the setup commit.

If GitHub Projects v2 is already in use, list the available Projects, fields, and a small sample of items before recommending one. Do not mutate anything during exploration.

### 2. Present findings and ask

Summarise what exists, what is missing, and what can be reused. Take the sections in order, one answer at a time. Lead with the recommended answer so the user can accept it briefly.

#### Section A — Issue tracker and GitHub access

The issue tracker is where specifications, implementation Issues, bugs, diagnosis, review findings, corrective work, decisions, and Pull Requests live.

Default posture in this fork:

- Configure GitHub access **per operator**, not once for the whole repository.
- Recommend `ChatGPT Web`: local work through `@devspace`, GitHub through connected `@github` MCP.
- Recommend `Codex`: local work through native filesystem, shell, and Git; GitHub through authenticated `gh` CLI.
- Forbid each operator from substituting the other operator's transports.
- Treat a missing or unsupported required transport as a stop condition, not permission to fall back.

Other supported tracker choices remain:

- **GitLab** through the configured GitLab tooling
- **Local markdown** under `.scratch/<feature>/`
- **Other** — record the user's workflow as freeform prose

Write the result to `docs/agents/issue-tracker.md`. For GitHub, start from [issue-tracker-github.md](./issue-tracker-github.md).

#### Section B — Shared Workstreams

Run this section when `workstream-tracking` is installed. Otherwise omit it.

Recommend enabling Workstreams when work spans multiple sessions or when ChatGPT Web, Codex, and humans take turns on the same local code. Explain the invariant:

> One durable Workstream has one canonical root issue, one persistent local worktree, one persistent branch, and one cooperative Workstream-level writer. A Review Composer may delegate parallel read-only review leases without creating additional Workstream writers.

Collect or confirm:

1. Whether Workstreams are enabled.
2. GitHub Projects v2 owner, number, and title. Prefer a clean existing Project; create a new one only after confirmation.
3. Status mapping for queued, active, and done using fields that actually exist.
4. Absolute bootstrap checkout used only as the stable control point for provisioning new Workstreams.
5. Absolute directory under which Workstream worktrees live. The bootstrap checkout must not be inside a generated Workstream path.
6. Default base branch.
7. Worktree path and branch naming patterns. Recommend a worktree folder basename equal to the canonical Workstream slug.
8. Allowed operator names, normally `ChatGPT Web`, `Codex`, `Human`, and `Unassigned`.
9. An execution profile for every operator: default activities, local workspace transport, GitHub transport, forbidden transports, and missing-transport behavior.
10. Default flow ownership: `/workstream-bootstrap` and `/implement` belong to Codex; `/code-review`, `/review-composer`, and `/review-synthesizer` belong to ChatGPT Web unless explicitly overridden.
11. Bootstrap policy:
    - `/workstream-bootstrap` is user-invoked and runs only from the configured bootstrap checkout;
    - it confirms the durable objective, completion conditions, identity, base SHA, and first workflow step before mutation;
    - it provisions through `/workstream-tracking` and leaves the Workstream unassigned;
    - it emits complete ChatGPT Project instructions and stops before planning or implementation.
12. Review hierarchy and delegated lease policy:
    - Review Composer parent as a native direct child of the Workstream root;
    - review workers as native direct children of the composer;
    - corrective and diagnosis Issues as direct children of the Workstream root;
    - Review Synthesizer-only synthesis, Workstream transition, and follow-up ticket creation after human approval;
    - review children outside the Project by default;
    - native sub-issue capability gaps are stop conditions.
13. Label registry and whether optional `area:*` labels already exist.

Write the result to `docs/agents/workstreams.md`, using [workstreams.md](./workstreams.md) as the seed. If disabled, still write a short file saying Workstreams are disabled so model-invoked skills do not guess.

The generated Workstream document must make the review fork explicit: focused single-ticket or single-domain review uses `/code-review`; cumulative multi-ticket, multi-domain, large, or cross-cutting review uses `/review-composer`; composer children use `/code-review` only in delegated worker mode; completed composer children move to `/review-synthesizer` before follow-up work exists.

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

### 5. Persist the setup commit

Repository setup is not complete while its configuration exists only in the working tree. A later Workstream is created from a Git commit, not from uncommitted files in the bootstrap checkout.

Before committing:

1. Confirm the current checkout is the approved bootstrap checkout.
2. Confirm the current branch is the configured default base branch.
3. Re-read the exact setup-owned paths and verify they match the user-approved drafts.
4. Run `git diff --check` for the setup-owned paths and any repository validation that is required for documentation or instruction changes.
5. Stage only the exact setup-owned paths. Never stage unrelated dirty files.
6. Show the staged diff summary and verify no unapproved path is staged.

Create one setup commit, normally:

```text
chore: configure engineering skills
```

If the approved setup already exists unchanged in the current base commit, do not create an empty commit. Otherwise a successful commit is mandatory. Do not push unless the user explicitly requested a push.

After committing, verify the commit contains every required `docs/agents/*` file and the selected instruction file. Record the exact setup commit SHA. If commit creation or verification fails, stop; do not tell the user setup is complete.

### 6. Done

Report:

- files written or updated;
- tracker and GitHub access policy;
- Workstream Project, bootstrap checkout, worktree root, base branch, operators, execution profiles, bootstrap policy, review hierarchy, and delegated review lease policy;
- the setup commit SHA and confirmation that the configured base branch contains it;
- which skills now consume each file;
- any MCP capability gaps left pending.

The user may edit `docs/agents/*.md` directly later. Re-run setup only when switching trackers, changing the Workstream control plane, changing worktree layout, or restarting configuration from scratch.
