Quickstart:

```bash
npx skills add mattpocock/skills --skill=ask-matt
```

```bash
npx skills update ask-matt
```

[Source](https://github.com/mattpocock/skills/tree/main/skills/engineering/ask-matt)

## What it does

`ask-matt` is the router over the skills in this repo. You describe the situation you're in; it tells you which skill or flow fits and in what order to run them.

It **does no work itself**. It doesn't grill, write a spec, or fix anything — it only orients. It exists for the **user-invoked** skills above all: nothing fires those for you, so *you* have to remember they exist, and `ask-matt` is the memory you offload that to. It also points at the model-invoked disciplines that run underneath the flows — `/tdd`, `/diagnosing-bugs`, `/prototype`, `/review-composer`, `/review-synthesizer`, `/code-review`, `/workstream-tracking`, and the vocabulary references `/domain-modeling` and `/codebase-design`. It answers "which one, and when", then hands you off to the skill that actually does the job.

## When to reach for it

You invoke this by typing `/ask-matt` — the agent won't reach for it on its own.

Reach for it whenever you're unsure which skill or flow a situation calls for: you have an idea and don't know where to start, a pile of bug reports and don't know if they're for `/triage`, or two skills that look interchangeable and you can't tell them apart. If you already know the skill you want, skip the router and invoke it directly.

## Flows, not just skills

The idea `ask-matt` gives you to think with is the **flow** — a path *through* the skills rather than a single one. Most work runs along one **main flow** (idea → ship: grill → spec → tickets → implement → focused review or review swarm), two **on-ramps** merge onto it (a triage lane for incoming bugs and requests; a codebase-health lane that generates ideas), and everything else is a **standalone** you reach for on its own. Ask a question and you get placed on the right flow, at the right step — not just handed a tool.

When Workstreams are enabled, `/workstream-tracking` is the control-plane layer beneath that map. It keeps the root issue, one local worktree and branch, active tracker artifacts, Project status, claims, delegated review leases, and handoffs aligned while the user-invoked flow stays focused on its engineering job. Writer disciplines inherit the current claim, while review swarms keep one composer writer and several child-Issue-only reviewers.

The review fork is explicit: focused PRs, single-ticket changes, and narrow domain slices go to [code-review](https://aihero.dev/skills-code-review); large cumulative ranges, multi-ticket corrections, and multi-domain or cross-cutting batches go to [review-composer](https://aihero.dev/skills-review-composer). Completed composer children go to [review-synthesizer](https://aihero.dev/skills-review-synthesizer) for human-approved findings and follow-up work. A bug without a known cause goes to [diagnosing-bugs](https://aihero.dev/skills-diagnosing-bugs) before anyone invents a correction.

## Where it fits

`ask-matt` is the **router** — the standalone map that sits over the whole set. It is the node every other docs page links back to as [ask-matt](https://aihero.dev/skills-ask-matt), so it never sits *in* a chain; it points *into* every chain. From here you'll most often land on [grill-with-docs](https://aihero.dev/skills-grill-with-docs), the head of the main flow, or [triage](https://aihero.dev/skills-triage), the on-ramp for work you didn't create. When even the router's own picture is stale, its [Source](https://github.com/mattpocock/skills/tree/main/skills/engineering/ask-matt) is the map of record.
