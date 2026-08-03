# Matt Pocock Skills

A collection of agent skills (slash commands and behaviors) loaded by Claude Code. Skills are organized into buckets and consumed by per-repo configuration emitted by `/setup-matt-pocock-skills`.

## Language

**Issue tracker**:
The tool that hosts a repo's issues — GitHub Issues, Linear, a local `.scratch/` markdown convention, or similar. Skills like `to-tickets`, `to-spec`, `triage`, and `qa` read from and write to it.
_Avoid_: backlog manager, backlog backend, issue host

**Issue**:
A single tracked unit of work inside an **Issue tracker** — a bug, task, spec, or slice produced by `to-tickets`.
_Avoid_: ticket (use only when quoting external systems that call them tickets, or for a **Decision ticket** — see below)

**Decision ticket**:
A `wayfinder` unit — a child **Issue** of a `wayfinder:map` holding a *question* whose resolution is a decision, not a slice of a build to execute. The **decision** qualifier is what keeps it distinct from an implementation ticket; `wayfinder` introduces the term, then uses "ticket".

**Workstream**:
A durable engineering objective coordinated through one canonical **Workstream root**, one persistent local **Worktree**, one persistent branch, active **Issues** or Pull Requests, and one GitHub Projects v2 control plane. A Workstream survives new chats, new tickets, commits, review, corrective work, and intermediate merges.
_Avoid_: session, epic (unless quoting an external tracker), feature branch

**Workstream root**:
The canonical GitHub **Issue** that identifies a **Workstream**, records its objective and completion conditions, and holds a managed low-resolution snapshot of worktree path, branch, operator, active artifact, fixed point, HEAD, handoff, and next action. It is an index, not a copy of its child artifacts.
_Avoid_: project issue, tracker row

**Worktree**:
The one persistent local Git worktree assigned to a **Workstream**. Local Git is authoritative for its path, branch, HEAD, dirty state, and merge/rebase state.

**Operator**:
The one actor currently controlling a **Workstream**, such as ChatGPT Web, Codex, or a human. Operator ownership is a cooperative claim, not a distributed lock.

**Claim**:
The cooperative transition that records an **Operator**, activity, active artifact, fixed point, HEAD, and next action on the **Workstream root** before work begins. A claim is never stolen automatically.

**Handoff**:
A durable Issue or Pull Request comment that transfers a **Workstream** between operators or activities by recording outcome, fixed point, HEAD, verification, repository state, remaining work, and the next action.

**Control plane**:
The GitHub Projects v2 Project showing active **Workstreams** and actionable Issues or Pull Requests. It carries operational state and links, not the full engineering artifacts.

**Triage role**:
A canonical state-machine label applied to an **Issue** during triage (e.g. `needs-triage`, `ready-for-afk`). Each role maps to a real label string in the **Issue tracker** via `docs/agents/triage-labels.md`.

## Relationships

- An **Issue tracker** holds many **Issues**
- An **Issue** carries one **Triage role** at a time
- A **Decision ticket** is an **Issue** (a child of a `wayfinder:map`)
- A **Workstream** has one **Workstream root**, one **Worktree**, one persistent branch, and at most one current **Operator**
- A **Workstream root** links many durable **Issues** and Pull Requests
- A **Claim** begins an operator activity; a **Handoff** ends or transfers it
- The **Control plane** contains active Workstream roots and only actionable child artifacts

## Flagged ambiguities

- "backlog" was previously used to mean both the *tool* hosting issues and the *body of work* inside it — resolved: the tool is the **Issue tracker**; "backlog" is no longer used as a domain term.
- "backlog backend" / "backlog manager" — resolved: collapsed into **Issue tracker**.
- "workstream" vs. "worktree" — resolved: the Workstream is the durable objective and collaboration unit; the Worktree is its one local Git execution context.
- "session" vs. "claim" — resolved: sessions are not tracked entities. A claim records only the current operator and activity on the durable Workstream.
