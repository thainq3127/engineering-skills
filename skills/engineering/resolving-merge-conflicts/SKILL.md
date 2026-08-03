---
name: resolving-merge-conflicts
description: "Use when you need to resolve an in-progress git merge/rebase conflict."
---

When Workstreams are enabled, run `/workstream-tracking` with `resolve` and `reconcile`, then claim activity `integration` before editing a conflict. The active artifact is the integration Issue or Pull Request. Stop if another operator owns the worktree.

1. **See the current state** of the merge/rebase. Check git history, the Workstream handoff, and the conflicting files.

2. **Find the primary sources** for each conflict. Understand deeply why each change was made, and what the original intent was. Read the commit messages, check the PRs, check original issues/tickets.

3. **Resolve each hunk.** Preserve both intents where possible. Where incompatible, pick the one matching the merge's stated goal and note the trade-off. Do **not** invent new behaviour. Always resolve; never `--abort`.

4. Discover the project's **automated checks** and run them — typically typecheck, then tests, then format. Fix anything the merge broke.

5. **Finish the merge/rebase.** Stage everything and commit. If rebasing, continue the rebase process until all commits are rebased.

6. **Handoff.** Record source and target refs, resulting HEAD, conflicts and intent decisions, checks run, and remaining integration work on the active Issue or Pull Request. Use `/workstream-tracking` to transition to review, further integration, or completion.
