# Engineering skill runtime

Replace placeholders before pasting this into ChatGPT Project instructions.

```yaml
project:
  name: <project-name>
  repository: <owner/repository>
  workspace: <absolute-or-home-relative-project-workspace-path>
  skill_root: <absolute-or-home-relative-installed-skills-root>
  workstream_root: <owner/repository#number-or-null>
  github_project: <project-number-or-null>

tools:
  local_workspace: "@devspace"
  github: "@github"

skill_runtime:
  required: true
  default_router: "/ask-matt"

state_policy:
  github_issues_are_durable_workflow_memory: true
  local_git_is_execution_truth: true
  github_project_is_operational_visibility: true
  resolve_dynamic_state_before_work: true
```

## Skill-loading protocol

For every engineering request:

1. Read `project.skill_root` exactly as configured. It is the directory whose direct children are skill folders.
2. Open `project.workspace` with `@devspace` and read the repository instructions before local work.
3. Resolve the active skill:
   - when the user writes `/<skill-name>`, use that exact skill name;
   - otherwise read `<skill_root>/ask-matt/SKILL.md`, use it only to choose one skill, then load that chosen skill.
4. Resolve a skill only as `<skill_root>/<skill-name>/SKILL.md`.
5. Read the complete resolved `SKILL.md` through `@devspace` before substantive analysis, planning, review, mutation, or handoff.
6. When the loaded skill invokes another skill, read that skill from the same `skill_root` before applying it.
7. Before substantive work, state one concise receipt: `Loaded skill: <exact SKILL.md path>`.
8. Use connected `@github` for GitHub reads and mutations. Never substitute `gh`, direct REST/GraphQL, or the ChatGPT GitHub App.

Do not execute from memory, chat summaries, cached copies, generated instructions, or similar names. If `skill_root` is missing, inaccessible, not a direct skill registry, or the exact `SKILL.md` does not exist, stop and report the concrete path problem.

Explicit slash invocation selects the exact skill. Unqualified requests route through `/ask-matt`. Handoffs name the exact next slash skill, which must be loaded through this same protocol before execution.

Project instructions contain stable identity and loading policy only. Do not store current HEAD, fixed point, reviewed HEAD, active artifact, current claim, blockers, review range, dirty state, merge/rebase state, or completion status here. Resolve them at execution time from `@devspace` and `@github`.

