# Workstreams

Workstreams are enabled for this repository.

To disable the protocol, replace the line above with `Workstreams are disabled for this repository.` The model-invoked skill then becomes a no-op and the ordinary issue-tracker behavior remains active.

## Control plane

- GitHub access: connected `@github` MCP
- Fallback tools: none unless explicitly added to this file
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

Only one operator may control a Workstream at a time. Claims are cooperative; an agent must not steal another operator's claim without an explicit handoff or human direction.

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

## Project membership

Always add an active Workstream root.

Add a child Issue or Pull Request only when it is:

- active;
- blocked and needs visibility;
- under review;
- integrating; or
- on the immediate dependency frontier.

Do not mirror every repository issue, branch, worktree, commit, or agent session into the Project.

## Completion and cleanup

A merge is an integration checkpoint, not automatic Workstream completion. The root closes only when its objective is met and no active durable artifact remains.

Never remove a worktree or delete a branch automatically. Mark them eligible for cleanup and wait for explicit instruction.
