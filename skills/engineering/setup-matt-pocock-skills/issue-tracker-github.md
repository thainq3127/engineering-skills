# Issue tracker: GitHub

Issues, Pull Requests, and Projects v2 for this repository live on GitHub.

GitHub transport is selected by the current operator execution profile in `docs/agents/workstreams.md`. There is no repository-wide default transport.

## Tool policy

- `ChatGPT Web` uses connected `@github` MCP for Issues, Pull Requests, labels, comments, reviews, issue relationships, Projects v2, Project items, and GitHub metadata.
- `Codex` uses authenticated `gh` CLI for the same GitHub operations.
- Each operator must use its configured transport and must not substitute another operator's transport.
- Do not use the ChatGPT GitHub App, browser UI, direct REST, or direct GraphQL as an automatic fallback.
- If the configured transport does not expose a required operation or is unavailable, report the exact capability gap and leave that operation pending.
- Before every write, read the current remote state through the same configured transport so retries are idempotent.

Infer the repository from the local remote, then verify it against the connected GitHub result before mutating anything.

## Core operations

- **Create an issue**: search open and recently closed issues for duplicates, then create it through the current operator's configured GitHub transport.
- **Read an issue**: fetch the full body, labels, relationships, and comments.
- **List or search issues**: use repository-scoped issue search and request only the fields needed.
- **Comment**: post on the existing Issue or Pull Request.
- **Apply or remove labels**: list labels first, create only registry labels that are genuinely missing, then update the Issue or Pull Request.
- **Close**: write the durable outcome first, then close with the appropriate reason.
- **Create or update a Pull Request review**: use the Pull Request review surface rather than a generic issue comment when the finding is a PR review.

## Pull Requests as a triage surface

**PRs as a request surface: no.** _(Set to `yes` if this repository treats external Pull Requests as feature requests; `/triage` reads this flag.)_

When set to `yes`, external Pull Requests move through the same triage roles as Issues. Discovery includes only external authors; an explicitly named Pull Request is always in scope.

GitHub shares one number space across Issues and Pull Requests. Resolve a bare `#42` by reading the object type through MCP before acting.

## When a skill says "publish to the issue tracker"

Create or update a GitHub Issue through the current operator's configured GitHub transport. Search first and preserve any Workstream relationship described by `docs/agents/workstreams.md`.

## When a skill says "fetch the relevant ticket"

Read the full Issue or Pull Request body, labels, comments, parent or child relationships, and linked Pull Requests through the current operator's configured GitHub transport.

## Workstream operations

Used by `/workstream-tracking` and every flow that invokes it.

- **Root**: one canonical Issue carrying the configured `workstream` and `ws:<slug>` labels plus the `workstream-root:v1` marker.
- **Artifact link**: prefer a native sub-issue relationship when supported and semantically correct; also retain the Workstream marker in the body for cross-repository readability.
- **Project registration**: add the root and only active, blocked, reviewing, integrating, or immediate-frontier artifacts to the configured Projects v2 Project.
- **Status**: map queued, active, and done through `docs/agents/workstreams.md`.
- **Claim and handoff**: update only the root's managed state block and post the durable handoff on the active Issue or Pull Request.
- **Capability gaps**: if the current operator's configured GitHub transport cannot create a custom Project field, saved view, dependency edge, or delete a Project, report that limitation. Do not switch transports.

## Wayfinding operations

Used by `/wayfinder`. When Workstreams are enabled, the wayfinder map is also the Workstream root.

- **Map**: one Issue labelled `wayfinder:map`, `workstream`, and `ws:<slug>`, holding Destination, Notes, Decisions-so-far, and Fog.
- **Child decision**: an Issue linked to the map as a native sub-issue when available. Apply `wayfinder:<type>`, `kind:decision`, and `ws:<slug>`.
- **Blocking**: use GitHub's native issue dependency relationship when the current operator's configured transport exposes it. Otherwise use the configured `Blocked by` body convention and explicitly note that native dependency mutation is unavailable.
- **Frontier query**: list open child decisions, remove any with open blockers or another assignee, then take the first in map order.
- **Claim**: assign the decision to the configured human account where appropriate and claim the Workstream through `/workstream-tracking` before work begins.
- **Resolve**: post the answer, close the decision, append one linked gist to Decisions-so-far, then reconcile the Workstream and Project.
