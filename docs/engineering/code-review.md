Quickstart:

```bash
npx skills add mattpocock/skills --skill=code-review
```

```bash
npx skills update code-review
```

[Source](https://github.com/mattpocock/skills/tree/main/skills/engineering/code-review)

## What it does

`code-review` reviews a frozen diff in one of two modes. **Focused mode** owns one small Pull Request, one implementation ticket, or one narrow domain slice. **Delegated worker mode** contributes one bounded slice and axis to a Review Composer swarm.

It never lets a delegated reviewer become a second composer or synthesizer. A delegated worker can inspect only its assigned range and can write only to its child Issue; the final finding register, verdict, Workstream transition, and follow-up tickets stay with [review-synthesizer](https://aihero.dev/skills-review-synthesizer).

## When to reach for it

Type `/code-review`, or the agent reaches for it automatically when you ask to review a small branch, PR, focused ticket, or a child review Issue.

Reach for focused mode when one reviewer can hold the entire scope reliably. For a cumulative multi-ticket correction range, multi-domain batch, large diff, or cross-cutting review, use [review-composer](https://aihero.dev/skills-review-composer) instead.

## Prerequisites

The review needs a fixed point and pinned reviewed HEAD. The Specification axis also needs the originating contract, usually an Issue, PRD, or spec file. Tracker and Workstream wiring comes from [setup-matt-pocock-skills](https://aihero.dev/skills-setup-matt-pocock-skills).

Delegated mode additionally requires a native composer parent, a native child Issue, and a complete delegated review lease. A body link is not enough.

## Focused review

Focused mode keeps two axes separate: **Standards** checks repository instructions, documented conventions, architecture boundaries, and a Fowler smell baseline; **Specification** checks missing requirements, incorrect implementations, and unrequested scope. The reports remain separate so one axis cannot mask the other.

The reviewer publishes one coherent result and may route an independent corrective Issue when it has its own outcome and acceptance criteria. An unclear defect goes to diagnosis rather than a speculative fix.

## Delegated worker review

A delegated lease fixes the composer, child, frozen range, slice, axis, and allowed write surface. The worker cannot modify local files, widen the range, change Project or Workstream state, update the parent verdict, create corrective or diagnosis Issues, or deduplicate other reviewers' findings.

Its report must include findings with severity, confidence, location, evidence, impact, and correction boundary, plus no-finding areas, questions, verification limits, exclusions, and completion status. The child closes after that report is posted; synthesis happens elsewhere.

## It's working if

- focused review stays small enough for one reviewer context;
- large cumulative ranges are routed to `review-composer` instead of quietly sampled;
- delegated workers write only to their child Issues;
- no-finding areas and exclusions are recorded as coverage evidence;
- the reviewed HEAD and frozen range remain unchanged through publication.

## ChatGPT Web operator contract

`code-review` is owned by ChatGPT Web by default. Local inspection and Git operations use `@devspace`; GitHub reads and writes use connected `@github` MCP. The flow must not switch to native Codex shell access, `gh`, the ChatGPT GitHub App, or direct API fallbacks.

## Where it fits

Focused review ends a small implementation path:

```txt
grill-with-docs → to-spec → to-tickets → implement → code-review
```

Delegated review sits inside the swarm path:

```txt
implement → review-composer → delegated code-review → review-synthesizer
```

Its closest neighbours are [implement](https://aihero.dev/skills-implement), which freezes the range, [review-composer](https://aihero.dev/skills-review-composer), which owns swarm topology and launch, [review-synthesizer](https://aihero.dev/skills-review-synthesizer), which owns final finding evaluation and follow-up work, and [workstream-tracking](https://aihero.dev/skills-workstream-tracking), which validates the claim or delegated lease. [ask-matt](https://aihero.dev/skills-ask-matt) routes between them.
