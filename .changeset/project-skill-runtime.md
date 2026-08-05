---
"mattpocock-skills": minor
---

Make Project-driven skill loading the default ChatGPT Web runtime.

Add a clean ChatGPT Project skill runtime. The Project opens only the configured project workspace, treats the skills catalog returned by `@devspace open_workspace` as authoritative, reads exact advertised `SKILL.md` paths, uses `/ask-matt` for unqualified routing, and forbids path construction, separate skills workspaces, execution from memory, cached copies, generated instructions, or name similarity.
