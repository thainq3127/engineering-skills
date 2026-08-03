# Coordinate engineering flows through one Workstream root and one local Worktree

The fork is used by multiple operators with different strengths. ChatGPT Web usually plans, specifies, reviews, manages GitHub, and makes small edits through a local tunnel. Codex usually implements, tests, and commits directly on the same machine. Both load the same skill repository and must preserve enough durable context for the other to continue.

Repository instructions alone are too soft for this. Each flow could remember different parts of the protocol, create duplicate tracking artifacts, or omit a Project update. Separate skills for resolving a Workstream, claiming a worktree, claiming review, and handing off would fragment one lifecycle into too many independently invokable pieces.

## Decision

Add one model-invoked `workstream-tracking` skill and require every tracker-mutating engineering flow to invoke it at its lifecycle boundaries.

A Workstream has:

- one canonical GitHub root issue;
- one persistent local Git worktree;
- one persistent branch;
- one cooperative current operator;
- durable child Issues and Pull Requests for specifications, implementation, bugs, reviews, corrective work, decisions, and integration;
- operational visibility in one GitHub Projects v2 control plane.

GitHub Issues and Pull Requests are the shared memory. GitHub Projects v2 is the operational view. Local Git is authoritative for worktree, branch, HEAD, fixed points, dirty state, and merge or rebase state.

The lifecycle operations are `resolve`, `ensure`, `claim`, `register`, `handoff`, `transition`, `reconcile`, and `complete`. They remain operations within one skill rather than separate skills.

## Tool routing

GitHub operations use the connected `@github` MCP described by per-repository configuration. Local Git operations use the local execution environment. The protocol does not silently fall back to `gh`, a GitHub App, direct API calls, or manual UI actions when MCP lacks an operation; it reports the capability gap.

## Invariants

- One Workstream maps to one Worktree and branch.
- Only one operator controls a Workstream at a time.
- A Workstream does not change identity when chats, tickets, commits, review phases, or integration checkpoints change.
- Worktrees, branches, commits, and sessions never become tracking Issues.
- Project items contain operational state and links, not full engineering artifacts.
- A merge does not automatically complete a Workstream.
- Worktrees and branches are never deleted automatically.
