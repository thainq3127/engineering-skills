Quickstart:

```bash
npx skills add mattpocock/skills --skill=prototype
```

```bash
npx skills update prototype
```

[Source](https://github.com/mattpocock/skills/tree/main/skills/engineering/prototype)

## What it does

`prototype` builds a small, disposable program whose only job is to answer one design question — does this state model feel right, or what should this UI look like.

The code is **throwaway from day one**, and marked as such. It carries no tests, no error handling beyond what makes it run, no abstractions, and no persistence. The point is to learn something fast and then delete it — so the moment you start hardening it, you've stopped prototyping.

## When to reach for it

Type `/prototype`, or the agent reaches for it automatically when a task fits.

Reach for it when you have a design question that's hard to settle on paper — a state machine with cases you can't hold in your head, or a screen you can't picture until you see a few versions side by side. If instead something already built is misbehaving and you need to find out why, use [diagnosing-bugs](https://aihero.dev/skills-diagnosing-bugs); prototyping explores what to build, not why the built thing is broken.

## Two branches

The question decides the shape, and there are two shapes:

- **"Does this logic / state model feel right?"** — a tiny interactive terminal app that pushes the state machine through the awkward cases, printing the full state after every action so you can watch what changes.
- **"What should this look like?"** — several radically different UI variations on one route, switchable from a floating bar, so you compare real renders instead of imagining them.

Picking the wrong branch wastes the whole prototype, so the question comes first. Both branches keep state in memory, run from one command, and surface the full state on every step.

## Keep the prototype as a primary source

A finished prototype leaves two things. The **answer** — the verdict plus the question it settled — is what you capture durably (a commit message, an ADR, an issue). The **prototype itself is a primary source** — the runnable evidence the answer came from.

Inside a Workstream, the prototype does not create a second branch. It is committed as clearly marked throwaway code on the persistent Workstream branch, linked from the active Issue, then removed in a later commit before integration. Git history keeps the runnable primary source while the final tree keeps only the validated decision.

## Workstream ownership

Prototype work inherits a planning claim or claims the Workstream's `prototype` activity before writing. Another operator's live claim is a stop condition. When the question is answered, the skill records the verdict and prototype commit on the active Issue and hands off to planning, specification, or implementation. A standalone one-off prototype does not need a new Workstream.

## Where it fits

`prototype` is a reach-for-it-anytime standalone: you drop into it to resolve a design question, then drop back out. Its answer often feeds the next step — a validated state model or UI direction becomes settled input for [to-spec](https://aihero.dev/skills-to-spec) to write up, or an architectural decision worth recording via [domain-modeling](https://aihero.dev/skills-domain-modeling). When you're unsure which skill or flow fits, [ask-matt](https://aihero.dev/skills-ask-matt) routes you.
