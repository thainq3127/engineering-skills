# Project routing template

Replace placeholders and paste the result into the ChatGPT Project instructions. Keep this file limited to stable identity and routing.

```yaml
project:
  name: <project-name>
  repository: <owner/repository>
  workspace: <absolute-or-home-relative-workspace-path>
  workstream_root: <owner/repository#number-or-null>
  github_project: <project-number-or-null>

tools:
  local_workspace: "@devspace"
  github: "@github"

routing:
  default: "@Matt"
  planning: "@Engineering Planner"
  uncertain_large_effort: "@Wayfinder"
  focused_review: "@Code Reviewer"
  cumulative_review: "@Review Composer"
  incoming_work: "@Triage Operator"
  implementation_diagnosis_correction_integration: "Codex"

state_policy:
  github_issues_are_durable_workflow_memory: true
  local_git_is_execution_truth: true
  github_project_is_operational_visibility: true
  resolve_dynamic_state_before_work: true
```

Do not store current HEAD, fixed point, active artifact, current claim, blockers, review range, dirty state, or merge/rebase state in Project instructions. Resolve those values at execution time.
