# Workstreams

Workstreams are enabled for this repository.

To disable the protocol, replace the line above with `Workstreams are disabled for this repository.` The model-invoked skill then becomes a no-op and the ordinary issue-tracker behavior remains active.

## Control plane

- Project owner: `<owner>`
- Project number: `<number>`
- Project title: `<title>`
- Status mapping:
  - queued: `Todo`
  - active: `In Progress`
  - done: `Done`

## Identity

- Root issue title: `[Workstream] <name>`
- Root marker: `<!-- workstream-root:v1 -->`
- Workstream label: `ws:<slug>`
- Root label: `workstream`
- A Workstream belongs to one repository.
- One Workstream maps to one local worktree and one persistent branch.
- The root issue is the canonical Workstream identity.

## Local layout

- Worktree root: `<absolute directory containing worktrees>`
- Default base branch: `<branch>`
- Worktree path pattern: `<worktree-root>/<workstream-slug>`
- Branch pattern: `workstream/<workstream-slug>`

Local Git is authoritative for worktree path, branch, HEAD, dirty state, and merge/rebase state.

## Operators

Allowed operator names:

- `ChatGPT Web`
- `Codex`
- `Human`
- `Unassigned`

Only one Workstream-level writer may control a Workstream at a time. Claims are cooperative; an agent must not steal another operator's claim without an explicit handoff or human direction.

Parallel review is the bounded exception. One Review Composer retains the Workstream-level claim while delegated reviewers receive read-only leases scoped to different child review Issues. They do not become additional Workstream writers.

## Operator execution profiles

### ChatGPT Web

- Default activities: planning, specification, ticketing, review, review-composition, delegated-review, review-synthesis
- Local workspace transport: `@devspace`
- GitHub transport: connected `@github` MCP
- Default owner of `/implement`: no
- Default owner of `/code-review`: yes
- Default owner of `/review-composer`: yes
- Forbidden transports:
  - native Codex filesystem or shell as a substitute
  - `gh`
  - ChatGPT GitHub App
  - direct REST or GraphQL fallback

### Codex

- Default activities: implementation, diagnosis, correction, integration
- Local workspace transport: native filesystem, process execution, shell, and local Git
- GitHub transport: authenticated `gh` CLI
- Default owner of `/implement`: yes
- Default owner of `/code-review`: no
- Default owner of `/review-composer`: no
- Forbidden transports:
  - `@devspace`
  - `@github` MCP
  - ChatGPT GitHub App
  - direct REST or GraphQL fallback

### Human

- Local workspace transport: `<configured human workflow>`
- GitHub transport: `<configured human workflow>`
- Default owner of `/implement`: no
- Default owner of `/code-review`: no
- Default owner of `/review-composer`: no
- Forbidden transports: `<none or explicit list>`

### Missing transport behavior

Stop and report the unavailable or unauthenticated required transport. Never fall back to another operator's transport. An explicit operator override changes the operator for one run, not the profile's allowed tools.

## Artifact labels

The root has `workstream` plus `ws:<slug>`. Every non-root Workstream artifact has exactly one `kind:*` label plus `ws:<slug>`:

| Role | Label | Suggested colour | Description |
| --- | --- | --- | --- |
| Root | `workstream` | `5319E7` | Canonical root issue for a durable Workstream |
| Specification | `kind:spec` | `1D76DB` | Product or engineering specification |
| Implementation | `kind:implementation` | `0E8A16` | Agent-ready implementation slice |
| Bug | `kind:bug` | `D73A4A` | Confirmed or reported defect |
| Pull Request | `kind:pull-request` | `BFD4F2` | Pull Request tracked independently in the control plane |
| Review | `kind:review` | `6F42C1` | Review artifact when no PR is the review surface |
| Corrective | `kind:corrective` | `D876E3` | Independent work created from review or diagnosis |
| Decision | `kind:decision` | `FBCA04` | Wayfinder or architectural decision issue |
| Cleanup | `kind:cleanup` | `C5DEF5` | Independent cleanup with a completion condition |

Area labels such as `area:web-next` are optional and repository-specific. Do not invent new label families during a flow.

## Review swarm hierarchy

The required native hierarchy is:

```text
Workstream root
├── Specifications
├── Implementation tickets
├── Review Composer
│   ├── Review child
│   ├── Review child
│   └── Review child
├── Corrective issues
├── Diagnosis issues
└── Verification or integration artifacts
```

- The Review Composer parent is a native direct sub-issue of the Workstream root.
- Review children are native direct sub-issues of the composer parent.
- Corrective and diagnosis Issues are native direct sub-issues of the Workstream root and must not be children of the composer.
- A review child must not be parented by an implementation ticket.
- Body links do not replace native sub-issue relationships.
- If the configured GitHub transport cannot create or read the required native hierarchy, stop and report the capability gap.

## Delegated review leases

The composer keeps the Workstream-level claim with activity `review-composition` or `review-synthesis` and active artifact set to the composer parent.

Each reviewer lease is bounded by:

- composer Issue;
- child review Issue;
- frozen range;
- slice;
- axis;
- allowed write surface.

The reviewer may inspect code but may write only to its assigned child Issue. It may not modify local files, Project state, Workstream state, the composer parent, sibling reviews, corrective Issues, diagnosis Issues, or the final verdict. Missing or ambiguous lease data is a stop condition.

## Review routing

- Focused Pull Request, single-ticket review, or one narrow domain slice: use `/code-review` in focused mode.
- Large cumulative review, multi-ticket correction range, multi-domain batch, or cross-cutting diff: use `/review-composer`.
- Child Issue under a Review Composer: use `/code-review` in delegated worker mode with the child lease.
- Unknown-cause defect: use `/diagnosing-bugs` before defining corrective work.

Only the composer synthesizes a swarm, updates the parent verdict, transitions the Workstream, and creates corrective or diagnosis Issues.

## Project membership

Always add an active Workstream root.

Add a child Issue or Pull Request only when it is:

- active;
- blocked and needs visibility;
- under review;
- integrating; or
- on the immediate dependency frontier.

Do not mirror every repository issue, branch, worktree, commit, or agent session into the Project.

Review-specific placement:

- add the active Review Composer parent and set it to `In Progress`;
- do not add review children by default;
- add a review child only when blocked or requiring human attention;
- add corrective or diagnosis Issues only when active or on the immediate frontier;
- use the composer's native `Sub-issues progress` for normal swarm progress.

## Completion and cleanup

A merge is an integration checkpoint, not automatic Workstream completion. The root closes only when its objective is met and no active durable artifact remains.

Never remove a worktree or delete a branch automatically. Mark them eligible for cleanup and wait for explicit instruction.
