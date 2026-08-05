# ChatGPT Project skill runtime

This directory contains the canonical Project instructions for running repository skills from ChatGPT Web or mobile.

The runtime has stable project inputs:

- the repository identity;
- the local project workspace;
- the canonical Workstream root and slug when the Project represents one durable objective;
- the GitHub Project control-plane identity.

Skills are not configured through Project instructions. `@devspace open_workspace` discovers installed skills from its configured sources, including locations such as `~/.agents/skills`, project `.agents/skills`, `~/.devspace/skills`, and any server-configured extra skill paths. The returned `skills` catalog is the runtime source of truth.

For an explicit slash command such as `/code-review`, the Project selects the exact `code-review` catalog entry and reads its advertised `SKILL.md` through the same project workspace session. For an unqualified request, it reads the advertised `ask-matt` skill first, then loads the exact routed skill.

The Project must never construct a path such as `~/.agents/skills/<name>/SKILL.md` or open a separate skills workspace. Skill discovery and path resolution belong to DevSpace.

`/workstream-bootstrap` renders `instructions.template.md` with the confirmed Workstream identity and prints a complete copy-ready block. For manual setup, replace the project placeholders yourself and paste the result into the ChatGPT Project instructions. `smoke-tests.md` contains the manual acceptance checks.

Canonical behavior always comes from the advertised `SKILL.md`. The Project instructions only define project identity, loading policy, tools, and dynamic-state boundaries.
