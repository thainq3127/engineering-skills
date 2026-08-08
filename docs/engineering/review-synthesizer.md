Quickstart:

```bash
npx skills add thainq3127/engineering-skills --skill=review-synthesizer
```

```bash
npx skills update review-synthesizer
```

[Source](https://github.com/thainq3127/engineering-skills/tree/main/skills/engineering/review-synthesizer)

## What it does

`review-synthesizer` turns completed delegated review evidence into a human-approved finding register, coherent follow-up work, a deferred ledger, final verdict, and exact execution handoff.

It never treats candidate findings as approved work. The skill must stop at a human evaluation gate before it creates corrective, diagnosis, or verification Issues.

## When to reach for it

Type `/review-synthesizer`, or the agent reaches for it automatically when a Review Composer parent exists and every required review child is complete for one exact frozen range.

Use [review-composer](https://aihero.dev/skills-review-composer) when the swarm still needs to be designed or launched. Use `review-synthesizer` only after the evidence set is complete and ready for adjudication.

## Prerequisites

The composer parent, native child hierarchy, coverage matrix, frozen range, and required child reports must already exist. ChatGPT Web is the default operator and requires `@devspace` plus connected `@github` MCP.

## Finding register

The leading idea is **disposition plus convergence**. Findings receive stable IDs such as `F-001`, are deduplicated by root cause and correction boundary, and separately record technical severity, confidence, evidence level, likelihood, user exposure, release relevance, proposed action, solution shape, and whether the correction boundary is still converging.

The synthesizer evaluates those fields against the frozen Delivery Context from the confirmed spec. Operating envelope and feedback-loop relevance come before severity when scheduling work. In an internal alpha, resilience for transient network loss, process crash, multi-worker concurrency, storage exhaustion, or distributed recovery is normally deferred unless the confirmed release gate actually depends on it.

Before proposing another corrective Issue, the synthesizer also checks the recent correction lineage. If the same retry, reconnect, ordering, acknowledgement, concurrency, recovery, or lifecycle family keeps resurfacing, or local fixes are growing a commodity subsystem, it marks the boundary as correction churn and proposes `reframe` instead of automatically patching again.

`reframe` separates **must address the problem** from **must patch this implementation**. The candidate register compares accepting the risk, simplifying the requirement, adopting an existing package or platform primitive, replacing the boundary, redesigning it, or running bounded research/wayfinding. A library is never asserted to exist without evidence, but adoption is a first-class option when the capability is likely commodity infrastructure.

The candidate register starts with a Delivery recommendation: `PRODUCT_EVALUATION`, `BOUNDED_CORRECTION`, `REFRAME`, `DIAGNOSE`, or `VERIFY`. This gate approves finding treatment and solution shape, not the product direction you already confirmed at spec time. Only after explicit approval does the skill materialize bounded corrective work, solution-shape decision Issues, diagnosis/verification, or accepted deferred risk.

## Execution frontier

Corrective, solution-shape decision, diagnosis, and verification Issues are native direct children of the Workstream root, not children of the composer. Deferred findings remain durable on the composer parent and do not silently become acceptance criteria for active corrections.

The final handoff chooses the next frontier by delivery value rather than finding order. If the feedback loop is already ready, it proceeds to product evaluation or the current release-gate artifact. If correction churn is detected, it routes to a solution-shape decision before more implementation. Only a bounded, convergent correction routes straight to the configured Codex Implementer.

## It's working if

- every candidate finding has a stable ID and source evidence;
- severity and disposition remain independent;
- operating envelope and feedback-loop relevance are evaluated before hardening severity;
- repeated correction families trigger a convergence assessment rather than endless patching;
- `reframe` can route a commodity capability toward research, adoption, simplification, replacement, or redesign;
- the candidate register explains each disposition against the frozen Delivery Context;
- no follow-up Issue exists before explicit human approval;
- corrective tickets are grouped by correction boundary rather than reviewer comment;
- a `fix-now` finding does not automatically imply a local code patch;
- deferred findings remain visible without blocking active correction;
- the Workstream handoff names an exact frontier artifact and next operator;
- the composer closes only after synthesis, materialization, and handoff succeed.

## Where it fits

`review-synthesizer` is the decision-and-materialization step after delegated review:

```txt
review-composer → delegated code-review → review-synthesizer → correction, diagnosis, verification, or integration
```

Its closest neighbours are [review-composer](https://aihero.dev/skills-review-composer), which constructs the swarm, [code-review](https://aihero.dev/skills-code-review), which produces bounded child evidence, and [workstream-tracking](https://aihero.dev/skills-workstream-tracking), which transfers the claim and execution frontier. [ask-matt](https://aihero.dev/skills-ask-matt) routes to it when review children are complete.
