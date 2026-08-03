---
name: research
description: Investigate a question against high-trust primary sources and capture the findings as a Markdown file in the repo. Use when the user wants a topic researched, docs or API facts gathered, or reading legwork delegated to a background agent.
---

Spin up a **background agent** to do the research, so you keep working while it reads.

## Workstream ownership

When research belongs to an active Workstream, run `/workstream-tracking` with `resolve` and `reconcile`, then inherit or claim activity `research`. A background research agent is **read-only** against the shared local worktree. It returns its cited report to the operator holding the claim; that operator writes the Markdown file and tracker update after the background task completes.

Do not let a background agent create a second worktree, switch the persistent branch, commit, or modify shared files concurrently. Standalone research that never writes into the repository does not need a Workstream.

Its job:

1. Investigate the question against **primary sources** — official docs, source code, specs, first-party APIs — not a secondary write-up of them. Follow every claim back to the source that owns it.
2. Return findings as one cited Markdown report to the controlling operator.
3. The controlling operator saves it where the repository already keeps such notes, matching existing convention, and records a context pointer on the active Issue when a Workstream exists.
4. Hand off the decision the research unblocked, not merely the fact that a file was written.
