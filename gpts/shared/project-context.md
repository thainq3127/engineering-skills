## Project context and state boundaries

Read the ChatGPT Project instructions first. They identify stable routing context:

- repository owner and name;
- exact local workspace path;
- optional Workstream root and GitHub Project number;
- preferred GPT routing.

Project instructions are routing metadata, not execution truth. Never trust them for current HEAD, fixed point, dirty state, active artifact, current claim, review range, blockers, merge or rebase state, or completion status.

Resolve dynamic state from:

- local Git through `@devspace` for branch, HEAD, fixed points, dirty state, and merge or rebase state;
- GitHub artifacts and native relationships through `@github` for durable workflow state;
- GitHub Projects for visibility only.

When Project routing conflicts with Git or GitHub, stop before mutation and report the conflict. Never silently repair ambiguous identity.
