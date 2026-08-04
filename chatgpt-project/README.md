# ChatGPT Project skill runtime

This directory contains the canonical Project instructions for running repository skills from ChatGPT Web or mobile.

The runtime has three stable inputs:

- the project repository;
- the project workspace;
- `skill_root`, the directory whose direct children are installed skills.

A typical `skill_root` is:

```text
~/.agents/skills
```

With that configuration, `/<skill-name>` resolves to:

```text
~/.agents/skills/<skill-name>/SKILL.md
```

Start from `instructions.template.md`, replace the placeholders, and paste it into the ChatGPT Project instructions. `smoke-tests.md` contains the manual acceptance checks.

Canonical behavior always comes from the loaded `SKILL.md`. The Project instructions only define identity, loading policy, tools, and dynamic-state boundaries.

