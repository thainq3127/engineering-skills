# Coordinate engineering flows through one Workstream root and one local Worktree

The fork is used by multiple operators with different strengths. ChatGPT Web usually plans, specifies, reviews, manages GitHub, and makes small edits through a local tunnel. Codex usually implements, tests, and commits directly on the same machine. Both load the same skill repository and must preserve enough durable context for the other to continue.

Repository instructions alone are too soft for this. Each flow could remember different parts of the protocol, create duplicate tracking artifacts, or omit a Project update. Separate skills for resolving a Workstream, claiming a worktree, claiming review, and handing off would fragment one lifecycle into too many independently invokable pieces.

## Decision

Add one model-invoked `workstream-tracking` skill and require every tracker-mutating engineering flow to invoke it at its lifecycle boundaries.

A Workstream has:

- one canonical GitHub root issue;
- one persistent local Git worktree;
- one persistent branch;
- one cooperative Workstream-level writer, with bounded delegated review leases when a composer is active;
- durable child Issues and Pull Requests for specifications, implementation, bugs, reviews, corrective work, decisions, and integration;
- operational visibility in one GitHub Projects v2 control plane.

GitHub Issues and Pull Requests are the shared memory. GitHub Projects v2 is the operational view. Local Git is authoritative for worktree, branch, HEAD, fixed points, dirty state, and merge or rebase state.

The lifecycle operations are `resolve`, `ensure`, `claim`, `register`, `handoff`, `transition`, `reconcile`, and `complete`. They remain operations within one skill rather than separate skills.

Large cumulative reviews use a dedicated `review-composer` flow instead of one full-batch `code-review`. The composer freezes the range, creates one parent review artifact under the Workstream root, partitions bounded child reviews by slice and axis, proves coverage, and later synthesizes the completed children. Focused review remains available for one small PR, one implementation ticket, or one narrow domain slice.

The composer retains the Workstream-level writer claim. Parallel reviewers receive delegated read-only leases scoped to one composer child, one frozen range, one slice, one axis, and one allowed GitHub write surface. This permits parallel inspection without creating several competing Workstream writers.

## Tool routing

Tool routing is part of the operator claim, not a repository-wide default.

- ChatGPT Web uses `@devspace` for every local operation and connected `@github` MCP for every GitHub operation.
- Codex uses native filesystem, process execution, shell, and local Git for repository work, plus authenticated `gh` CLI for GitHub operations.
- `/implement` is Codex-owned by default.
- `/code-review` is ChatGPT Web-owned by default.
- `/review-composer` is ChatGPT Web-owned by default.
- A missing or unsupported required transport is a stop condition.
- An operator never borrows another operator's transport and never falls back to the ChatGPT GitHub App or direct REST/GraphQL calls.

## Invariants

- One Workstream maps to one Worktree and branch.
- Only one Workstream-level writer controls a Workstream at a time. Delegated review workers may run in parallel only under an active composer claim with non-overlapping child-Issue write surfaces.
- A Workstream does not change identity when chats, tickets, commits, review phases, or integration checkpoints change.
- Worktrees, branches, commits, and sessions never become tracking Issues.
- Project items contain operational state and links, not full engineering artifacts.
- A Review Composer parent is a native direct child of the Workstream root; review workers are native direct children of the composer.
- Corrective and diagnosis Issues created by synthesis are native direct children of the Workstream root, never children of the composer.
- Native sub-issue capability is required for review swarms; body links are not an equivalent fallback.
- Only the composer updates the parent verdict, transitions the Workstream, and creates corrective or diagnosis Issues from the swarm.
- A merge does not automatically complete a Workstream.
- Worktrees and branches are never deleted automatically.
