Quickstart:

```bash
npx skills add mattpocock/skills --skill=research
```

```bash
npx skills update research
```

[Source](https://github.com/mattpocock/skills/tree/main/skills/engineering/research)

## What it does

`research` answers a question by reading the sources that own the answer and leaving a cited Markdown file behind. It works only from **primary sources** — official docs, source code, specs, first-party APIs — never a secondary write-up of them, so what it saves is traceable back to something authoritative rather than a summary of a summary.

## When to reach for it

Type `/research`, or the agent reaches for it automatically when a task turns into reading legwork.

Reach for it when the next step is *finding something out* — how an API behaves, what a spec actually says, whether a claim holds — and you'd rather not stall your own thread doing the reading. For sharpening a plan by interview instead of by reading, use [grilling](https://aihero.dev/skills-grilling); for exploring what to build with throwaway code, use [prototype](https://aihero.dev/skills-prototype).

## Delegated legwork

The defining move is that the reading runs as a **background agent**. You keep working; it follows each claim back to its primary source and returns one cited Markdown report to the controlling operator. Research is legwork you delegate, not thinking you outsource.

## Workstream ownership

Within a Workstream, the background researcher is read-only against the shared local worktree. It does not create another worktree, switch branches, commit, or write concurrently. The operator holding the claim saves the report, links it from the active Issue, and hands off the decision it unblocked. Standalone research that never writes into the repository needs no Workstream.

## Where it fits

A reach-for-it-anytime standalone that feeds the thinking skills: the report it produces is something to grill, plan, or design against, so it sits upstream of work like [grilling](https://aihero.dev/skills-grilling) and [to-spec](https://aihero.dev/skills-to-spec) rather than in the build chain. For the whole map, see [ask-matt](https://aihero.dev/skills-ask-matt).
