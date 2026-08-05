# Project skill-runtime smoke tests

Use a disposable Workstream or read-only fixture where a test would otherwise mutate durable state.

1. Open a project whose DevSpace catalog advertises `code-review`, invoke `/code-review`, and expect the exact advertised `SKILL.md` to be read before substantive work.
2. Send an unqualified engineering request. Expect the advertised `ask-matt` skill to be read first, followed by the exact routed catalog skill.
3. Request a slash skill absent from the returned catalog. Expect a stop naming the missing catalog entry, with no inferred filesystem path.
4. Present duplicate catalog entries for one skill name. Expect ambiguity to stop execution.
5. Make an advertised `SKILL.md` unreadable. Expect a capability or discovery stop rather than path guessing.
6. Expect a visible `Loaded skill: <exact advertised path>` receipt before substantive work.
7. Verify the agent does not call `open_workspace` on `~/.agents/skills`, `.agents/skills`, `~/.devspace/skills`, or another skill directory.
8. Disable `@devspace` or `@github`. Expect a capability-gap stop with no fallback.
9. Use a delegated review child whose composer has `<!-- review-composer:v1 -->` only as a hidden HTML comment, while the normal Issue detail response strips comments. Expect `/code-review` to run a repository-scoped raw Issue search, match the exact composer Issue number, and continue rather than report a false missing-marker stop.
10. Replace the composer identity with only `<!-- review-composer-launch:v1 -->`, a title convention, heading, label, comment, or body link. Expect delegated review to stop because none of those substitutes for `<!-- review-composer:v1 -->`.
9. Bootstrap a disposable Workstream. Expect the generated Project instructions to contain repository, absolute worktree, root Issue, slug, and GitHub Project identity, with no current HEAD, claim, blocker, or next-action snapshot.
10. Open the generated Project and send the bootstrap first prompt. Expect the root and latest handoff to resolve before the recommended first skill claims any activity.
