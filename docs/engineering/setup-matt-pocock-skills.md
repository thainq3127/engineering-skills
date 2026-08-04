Quickstart:

```bash
npx skills add mattpocock/skills --skill=setup-matt-pocock-skills
```

```bash
npx skills update setup-matt-pocock-skills
```

[Source](https://github.com/mattpocock/skills/tree/main/skills/engineering/setup-matt-pocock-skills)

## What it does

`setup-matt-pocock-skills` teaches one repo how the engineering skills should behave in it — where GitHub work lives, how shared Workstreams map to local worktrees and Projects v2, what the triage labels are called, and where the domain docs sit — then records those answers as **config** the other skills read.

It writes config, it does not hard-code per-repo values into the skills. The one-time bootstrap explores the actual repository, ChatGPT Web's `@devspace` and `@github` access, Codex's native worktree and authenticated `gh` access, existing Projects and fields, labels, and domain docs, then confirms the result with you rather than guessing. It is prompt-driven — explore, present, confirm, then write — not a deterministic scaffold.

## When to reach for it

You invoke this by typing `/setup-matt-pocock-skills` — the agent won't reach for it on its own.

Reach for it **once per repo, before the first use of any other engineering skill**. If [triage](https://aihero.dev/skills-triage), [to-spec](https://aihero.dev/skills-to-spec), [to-tickets](https://aihero.dev/skills-to-tickets), or [workstream-tracking](https://github.com/thainq3127/engineering-skills/tree/main/skills/engineering/workstream-tracking) start guessing about GitHub access, Project identity, worktree layout, or labels, the repo has not been set up yet. Re-run it when switching tracker access, Project control plane, or worktree layout; ordinary changes are direct edits to `docs/agents/*.md`.

## The four decisions

It leads each with a recommended answer you can accept in a word, and skips whatever it can already infer — so most runs are a couple of quick confirmations:

- **Issue tracker and operator access paths** — where work is tracked and which transport each operator must use. The default is ChatGPT Web through `@devspace` + `@github`, and Codex through native local tools + authenticated `gh`, with no cross-profile fallback.
- **Workstreams** — whether one durable objective maps to one root issue, one local worktree and branch, one current writer, and one Projects v2 control plane. It records Project owner/number, status mapping, worktree root, base branch, naming patterns, operator profiles, default flow ownership, review-composer hierarchy, delegated review leases, labels, and stop behavior.
- **Triage labels** — asked only if the `triage` skill is installed, and then just: keep the default labels (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`)? Say no only if your tracker already uses other names, so `triage` applies real ones instead of creating duplicates.
- **Domain docs** — assumed single-context (one `CONTEXT.md` + `docs/adr/` at the root), which fits almost every repo; it only raises a multi-context map when it spots monorepo signals.

The output is a set of files under `docs/agents/` — `issue-tracker.md`, `workstreams.md`, `domain.md`, and `triage-labels.md` when triage is installed — plus an `## Agent skills` block pointing to them in whichever of `CLAUDE.md` or `AGENTS.md` the repo already uses. Those files are the shared substrate the rest of the toolkit stands on.

## It's working if

- `issue-tracker.md`, `workstreams.md`, and `domain.md` land under `docs/agents/` (plus `triage-labels.md` when installed), and an `## Agent skills` section points to them.
- Tracker access is explicit per operator and forbids cross-profile fallback.
- Project identity, status mapping, worktree root, base branch, operator profiles, default flow ownership, review hierarchy, delegated review leases, and label registry are concrete rather than placeholders.
- Afterwards, tracker-mutating skills resolve and update the same Workstream instead of inventing their own conventions.

## Where it fits

`setup-matt-pocock-skills` is a **run-once setup** — the foundation the whole engineering set stands on, not a step you repeat. Its closest neighbour is [workstream-tracking](https://github.com/thainq3127/engineering-skills/tree/main/skills/engineering/workstream-tracking), because that model-invoked protocol consumes the Project, worktree, operator, review hierarchy, delegated lease, and label config written here. [review-composer](https://aihero.dev/skills-review-composer), [triage](https://aihero.dev/skills-triage), [to-spec](https://aihero.dev/skills-to-spec), and [to-tickets](https://aihero.dev/skills-to-tickets) consume the same tracker contract. When you're unsure which flow fits, [ask-matt](https://aihero.dev/skills-ask-matt) routes you.
