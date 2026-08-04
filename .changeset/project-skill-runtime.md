---
"mattpocock-skills": minor
---

Make Project-driven skill loading the default ChatGPT Web runtime.

Add a clean ChatGPT Project skill runtime. The Project requires an explicit direct skill registry root, resolves every slash skill as `<skill_root>/<skill-name>/SKILL.md`, loads complete skills through `@devspace`, uses `/ask-matt` for unqualified routing, and forbids execution from memory, cached copies, generated instructions, or name similarity.
