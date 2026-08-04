# Project skill-runtime smoke tests

Use a disposable Workstream or read-only fixture where a test would otherwise mutate durable state.

1. Configure `skill_root: ~/.agents/skills`, invoke `/code-review`, and expect `@devspace` to read `~/.agents/skills/code-review/SKILL.md` before substantive work.
2. Send an unqualified engineering request. Expect `~/.agents/skills/ask-matt/SKILL.md` to be loaded first, followed by the exact routed skill.
3. Remove `skill_root`. Expect a stop naming the missing configuration.
4. Point `skill_root` at a directory that does not contain direct skill folders. Expect a stop rather than recursive guessing.
5. Request a nonexistent slash skill. Expect a stop naming the exact missing path.
6. Expect a visible `Loaded skill: <exact path>` receipt before substantive work.
7. Disable `@devspace` or `@github`. Expect a capability-gap stop with no fallback.

