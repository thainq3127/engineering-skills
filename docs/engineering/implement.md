Quickstart:

```bash
npx skills add mattpocock/skills --skill=implement
```

```bash
npx skills update implement
```

[Source](https://github.com/mattpocock/skills/tree/main/skills/engineering/implement)

## What it does

`implement` builds one tracked Issue — driving it through test-driven development, typechecking, and the required test suite, then committing the bounded change and handing a frozen range to review.

It does **not** decide what to build. The spec is already settled and the seams are already agreed; `implement` executes that plan rather than reopening it. It is the hands, not the head — the thinking happened upstream.

## When to reach for it

You invoke this by typing `/implement` — the agent won't reach for it on its own.

Reach for it once the work is written down as a spec or split into tickets and you're ready to turn that into code. If the spec doesn't exist yet, write it first — for that, use [to-spec](https://aihero.dev/skills-to-spec), or [to-tickets](https://aihero.dev/skills-to-tickets) to break a spec into tickets. If you just want to build something test-first without a full spec, drop to [tdd](https://aihero.dev/skills-tdd) directly.

## Pre-agreed seams

The idea `implement` runs on is the **seam** — the stable interface a feature is tested at, chosen before any code is written. It doesn't invent seams mid-build; it uses the ones already picked (during [to-spec](https://aihero.dev/skills-to-spec)) and writes tests against them via [tdd](https://aihero.dev/skills-tdd). Working at pre-agreed seams is what keeps the implementation honest: the tests target something durable, so the code underneath can move without the tests moving.

Around that core it keeps the loop tight — typecheck often, run single test files as it goes, run the required suite once at the end — then commits and leaves a durable handoff. The same operator may continue into review only after that handoff; otherwise the reviewer takes over in a new session.

## Workstream claim and handoff

Before writing code, `implement` resolves and reconciles the Workstream, confirms blockers, verifies the exact shared worktree and branch, and claims implementation with the current HEAD as fixed point. Another operator's live claim is a stop condition.

Completion is a durable handoff on the active Issue or Pull Request: fixed point, HEAD, commits, verification, repository state, remaining work, and the next operator. Review receives a frozen HEAD rather than a moving branch.

## Where it fits

`implement` is the build step near the end of the main chain, just before the review:

```txt
grill-with-docs → to-spec → to-tickets → implement → code-review
```

Reach for it after the work has been specced and sequenced, not before. Its key neighbours are [to-tickets](https://aihero.dev/skills-to-tickets), which produces the blocked or frontier Issues it works through, and [tdd](https://aihero.dev/skills-tdd), which it drives internally before handing the pinned range to [code-review](https://aihero.dev/skills-code-review). When you're unsure which skill or flow fits, [ask-matt](https://aihero.dev/skills-ask-matt) routes you.
