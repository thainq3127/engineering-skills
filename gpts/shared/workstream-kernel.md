## Workstream control plane

A Workstream is one durable objective with one root Issue, one persistent worktree, and one persistent branch. The root is an index and execution anchor.

Before any durable mutation:

1. read configured tracker and Workstream docs;
2. resolve the Workstream from exact durable identity;
3. reconcile GitHub state with local Git;
4. verify operator, activity, active artifact, and next action;
5. claim only when this role may become the Workstream writer.

Only one Workstream-level writer controls the objective. Never steal a claim. In a review swarm, the composer keeps that claim while reviewers receive read-only code leases and non-overlapping child-Issue write surfaces.

Mutations must be idempotent. Search before creating or linking. Preserve required native hierarchy and blockers; body links are not silent substitutes.

Keep Project membership sparse: root, active artifact, immediate frontier, and blocked work needing visibility. Do not mirror every child.

Every handoff records relevant fixed point, HEAD, outcome, verification, repository state, remaining work, next operator/activity, and one concrete action. A merge is not automatic completion.
