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

The leading idea is **disposition**. Findings receive stable IDs such as `F-001`, are deduplicated by root cause and correction boundary, and separately record technical severity, confidence, evidence level, likelihood, user exposure, release relevance, and proposed action.

The synthesizer evaluates those fields against the frozen Delivery Context from the confirmed spec. A severe rare race outside the operating envelope can be deferred without pretending it is technically minor; a catastrophic but unproven risk is routed to diagnosis instead of becoming automatic correction work.

The candidate register is posted for free-form human evaluation. This gate approves finding treatment, not the product direction you already confirmed at spec time. Only after explicit approval of the evaluated register does the skill group `fix-now` findings into coherent corrective Issues, route evidence gaps to diagnosis or verification, and preserve deferred or rejected findings with rationale and revisit triggers.

## Execution frontier

Corrective, diagnosis, and verification Issues are native direct children of the Workstream root, not children of the composer. Deferred findings remain durable on the composer parent and do not silently become acceptance criteria for active corrections.

The final handoff names one exact active artifact, operator, activity, reviewed range, acceptance boundary, verification requirements, and next action. For correction, it routes to the configured Codex Implementer.

## It's working if

- every candidate finding has a stable ID and source evidence;
- severity and disposition remain independent;
- the candidate register explains each disposition against the frozen Delivery Context;
- no follow-up Issue exists before explicit human approval;
- corrective tickets are grouped by correction boundary rather than reviewer comment;
- deferred findings remain visible without blocking active correction;
- the Workstream handoff names an exact frontier artifact and next operator;
- the composer closes only after synthesis, materialization, and handoff succeed.

## Where it fits

`review-synthesizer` is the decision-and-materialization step after delegated review:

```txt
review-composer → delegated code-review → review-synthesizer → correction, diagnosis, verification, or integration
```

Its closest neighbours are [review-composer](https://aihero.dev/skills-review-composer), which constructs the swarm, [code-review](https://aihero.dev/skills-code-review), which produces bounded child evidence, and [workstream-tracking](https://aihero.dev/skills-workstream-tracking), which transfers the claim and execution frontier. [ask-matt](https://aihero.dev/skills-ask-matt) routes to it when review children are complete.
