---
"mattpocock-skills": minor
---

Make repository setup and human-in-the-loop planning durable across new worktrees and context windows.

- Setup now commits approved repository configuration onto the configured base branch before reporting completion.
- Workstream Bootstrap verifies that the pinned base commit contains the setup instead of asking a new worktree to repeat setup.
- Workstream Tracking adds write-through decision checkpoints, used by Grill With Docs and Wayfinder after every human-confirmed decision and before the next question.
