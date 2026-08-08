Quickstart:

```bash
npx skills add thainq3127/engineering-skills --skill=workstream-bootstrap
```

```bash
npx skills update workstream-bootstrap
```

[Source](https://github.com/thainq3127/engineering-skills/tree/main/skills/engineering/workstream-bootstrap)

## What it does

`workstream-bootstrap` creates one durable engineering Workstream from a configured control checkout. It turns a confirmed objective into a canonical GitHub root Issue, persistent branch and worktree, Project item, bootstrap handoff, and ready-to-paste ChatGPT Project instructions.

It provisions the control plane and stops. It does not write the spec, create implementation tickets, touch production code, or pretend ChatGPT Web already owns the Workstream before the human has created the Project.

## When to reach for it

You invoke this by typing `/workstream-bootstrap` in Codex. The agent will not reach for it on its own.

Reach for it after repository-wide setup is complete and before starting a new durable objective that will span multiple sessions, artifacts, phases, or operators. For a one-ticket change, use the ordinary Issue flow instead. If the repository itself has not been configured yet, use [setup-matt-pocock-skills](https://aihero.dev/skills-setup-matt-pocock-skills) first.

## Prerequisites

The repository must already define its issue tracker, GitHub Project, bootstrap checkout, Worktree root, base branch, naming patterns, labels, and Codex execution profile under `docs/agents/`. Those files and the root agent instructions must be committed on the configured base branch, not merely present as working-tree edits. Codex needs native local Git access and authenticated `gh` access.

## Bootstrap checkout

The leading idea is **bootstrap**, not implementation. One stable checkout acts as the control point from which new Workstream branches and worktrees are created. It is never renamed into a Workstream and never receives feature changes during provisioning.

The human confirms outcome and completion conditions before naming. The skill then proposes one display name and one filesystem-safe slug. That slug becomes the worktree folder basename, branch suffix, and `ws:<slug>` label, while the display name becomes the root Issue and ChatGPT Project name.

## Two human gates

The first gate confirms the full provisioning packet: objective, completion conditions, boundaries, identities, Project, base SHA, worktree path, branch, and first workflow step. Nothing durable is created before this approval.

The second human action happens outside Codex: create the named ChatGPT Project, paste the generated instructions, and start from the bootstrap handoff. The Workstream remains `Unassigned` until that ChatGPT session actually resolves and claims its first activity.

## It's working if

- the bootstrap checkout remains untouched;
- the pinned base commit already contains the repository setup, so the new worktree does not ask to run setup again;
- one root Issue, branch, worktree, Project item, and bootstrap handoff agree on one slug and objective;
- the new root is queued and unassigned rather than falsely claimed;
- duplicate runs repair only safe omissions and never reset or delete state;
- the final output contains complete Project instructions with no placeholders and one exact first prompt.

## Where it fits

`workstream-bootstrap` is the entry step between repository setup and the normal engineering flow:

```txt
setup-matt-pocock-skills → workstream-bootstrap → ChatGPT Project → ask-matt or the confirmed first skill
```

It delegates provisioning invariants to [workstream-tracking](https://aihero.dev/skills-workstream-tracking), then hands the objective to ChatGPT Web for planning, specification, ticketing, and review. [ask-matt](https://aihero.dev/skills-ask-matt) chooses the next flow once the Project is open.
