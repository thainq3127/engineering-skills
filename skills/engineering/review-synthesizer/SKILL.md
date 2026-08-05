---
name: review-synthesizer
description: Turn one completed Review Composer swarm into a human-approved finding register, coherent corrective or diagnosis work, deferred finding ledger, verdict, and exact Workstream handoff.
---

# Review Synthesizer

Convert completed delegated review evidence into an execution frontier. The synthesizer owns finding identity, deduplication, disagreement resolution, the human evaluation gate, dispositions, follow-up Issue creation, the final verdict, and handoff to correction, diagnosis, verification, or integration.

It does not compose reviewer prompts, perform delegated reviews, modify production code, or invent approval. Use `/review-composer` first when the review swarm does not yet exist.

## Operator contract

`/review-synthesizer` is a **ChatGPT Web-owned flow by default**.

Unless the user explicitly overrides the operator for this run:

1. Require the configured operator to be `ChatGPT Web`.
2. Use `@devspace` for every local file read, Git inspection, range verification, and non-mutating verification command.
3. Use connected `@github` MCP for every GitHub read and write, including the composer, children, native relationships, follow-up Issues, Project state, and handoffs.
4. Never substitute native Codex filesystem or shell access, `gh`, the ChatGPT GitHub App, or direct REST/GraphQL.
5. Missing transport, ambiguous Workstream identity, incomplete native hierarchy, mixed frozen ranges, incomplete required children, or unresolved coverage gaps are stop conditions.

## State machine

Run exactly these stages:

```text
COLLECT
-> PREPARE_EVALUATION
-> AWAIT_HUMAN_EVALUATION
-> MATERIALIZE
-> HANDOFF
-> CLOSE
```

Never skip the human evaluation gate. Never create corrective, diagnosis, or verification Issues from an unapproved candidate register.

## 1. Collect

Run `/workstream-tracking` with `resolve`, then `reconcile`. Require an existing composer parent and claim activity `review-synthesis` on it.

Verify:

- current local HEAD equals the composer reviewed HEAD;
- the composer contains one frozen, user-confirmed Delivery Context snapshot with its controlling specification and confirmation evidence;
- the product stage, current objective, critical user journeys, release gate, operating envelope, and explicit non-goals are complete and internally consistent;
- every required child is a native direct child of the composer;
- every required child is complete;
- every child used the exact same fixed point, reviewed HEAD, slice, and axis recorded by its lease;
- the coverage matrix has no unresolved required row;
- all child bodies and review comments are readable.

Read every child completely. Do not synthesize from summaries alone.

The upstream specification confirmation is authoritative for this frozen review. Do not ask the user to confirm the Delivery Context again unless it is missing, contradictory, or the implementation makes the stated operating envelope impossible.

## 2. Prepare evaluation

Deduplicate reviewer findings by causal defect and correction boundary, not wording, file count, or reviewer count.

Assign stable IDs in deterministic order:

```text
F-001
F-002
F-003
```

Every candidate finding records:

- stable ID;
- short title;
- root cause;
- affected behavior and impact;
- originating child Issues and evidence locations;
- controlling requirement or repository invariant;
- proposed severity: `blocker`, `major`, or `minor`;
- proposed confidence: `high`, `medium`, or `low`;
- evidence level: `observed`, `reproducible`, `plausible`, or `theoretical`;
- user exposure: `critical-path`, `reachable`, `future-only`, or `currently-unreachable`;
- likelihood: `high`, `medium`, `low`, or `unknown`;
- failure consequence;
- release relevance: `gating` or `non-gating`;
- proposed correction boundary;
- proposed disposition;
- disposition rationale against the frozen Delivery Context;
- revisit trigger when the proposed disposition is `defer`;
- verification limits and open questions.

Resolve reviewer disagreements from the controlling specification, repository standards, code, and verification evidence. When evidence cannot settle a factual claim without reproduction or instrumentation, propose `diagnose`, not a vote.

Use these dispositions:

- `fix-now`;
- `defer`;
- `diagnose`;
- `verify`;
- `reject`;
- `duplicate`;
- `already-fixed`.

### Product-priority policy

Review exhaustively, schedule selectively. Technical severity describes the consequence if a defect occurs; it does not determine delivery priority or disposition.

Optimize for the next meaningful user feedback loop defined by the frozen Delivery Context.

Propose `fix-now` when a finding:

- blocks the current objective, release gate, or a critical user journey;
- violates an acceptance criterion of the reviewed Workstream;
- exposes a currently reachable security, privacy, or irreversible data-integrity boundary;
- is observed or reproducible with enough likelihood to make user evaluation unreliable.

Propose `diagnose` when the possible consequence is severe or catastrophic but reproduction, instrumentation, likelihood, or operating-envelope evidence is insufficient.

Propose `defer` by default for low-likelihood, future-only, currently unreachable, or theoretical risks outside the confirmed operating envelope. Every deferred finding must retain its evidence, rationale, and a concrete revisit trigger such as enabling multi-worker execution, increasing scale, introducing retries, or preparing production launch.

Use `reject` when the controlling requirement no longer applies, the alleged behavior is impossible inside the confirmed scope, or the evidence does not support a defect. Never reduce a finding's technical severity merely to justify deferral; severity and disposition remain independent fields.

Publish a **Candidate finding register** on the composer parent. Begin with a concise frozen Delivery Context summary, then group proposed findings by disposition so the current execution frontier is visible. State explicitly that it is not the final verdict and that no follow-up Issues have been created.

## 3. Await human evaluation

Stop and let the user free-prompt changes to IDs, grouping, severity, confidence, disposition, rationale, correction boundaries, or revisit triggers.

Accept concise decisions such as:

```text
F-001 fix-now.
F-002 defer.
F-003 diagnose.
Reject F-004 because the requirement no longer applies.
Group F-005 and F-006 into one corrective ticket.
```

Do not ask the user to repeat decisions already stated. Do not materialize until the user explicitly approves the evaluated finding set.

This gate approves finding treatment, not product direction. Do not ask the user to re-confirm the Delivery Context unless Collect identified one of the explicit context stop conditions.

## 4. Materialize the approved result

Before any GitHub write that creates follow-up work, require all of these approval guards:

- an explicit user approval made after the Candidate finding register was published;
- approval that names or unambiguously covers the evaluated register version;
- an approved disposition for every non-duplicate candidate ID;
- no unresolved user-requested regrouping, rationale, severity, confidence, or boundary change.

If any guard is absent, remain in `AWAIT_HUMAN_EVALUATION`. Silence, acknowledgement, upstream spec approval, or completion of child reviews is not synthesis approval.

Publish an **Approved finding register** and final verdict on the composer parent. Preserve every candidate ID and record the approved disposition and rationale.

Use one final verdict:

- `PASS` when no active or deferred review risk remains;
- `PASS_WITH_ACCEPTED_RISK` when only approved deferred findings remain and the current release gate is satisfied;
- `PRODUCT_EVALUATION_READY` when the confirmed pre-production feedback loop is ready even though explicitly deferred hardening remains;
- `CORRECTION_REQUIRED` when approved `fix-now` work blocks the current objective or release gate;
- `DIAGNOSIS_REQUIRED` when required evidence must be gathered before disposition can be finalized;
- `VERIFICATION_REQUIRED` when the implementation claim exists but required verification evidence is still missing.

### Corrective work

Group `fix-now` findings by coherent correction boundary. Create neither one Issue per reviewer comment nor one mega-Issue spanning independent acceptance criteria.

Every corrective Issue must:

- be a native direct child of the Workstream root, never the composer;
- carry `kind:corrective` and `ws:<slug>`;
- name the composer and approved finding IDs;
- link all source child reviews and evidence;
- state the deduplicated root cause and affected behavior;
- define the correction boundary and explicit exclusions;
- define acceptance criteria;
- define required regression tests and verification evidence;
- record the frozen reviewed range that produced the findings.

### Diagnosis and verification

Create diagnosis or verification Issues only for approved `diagnose` or `verify` findings, as native direct children of the Workstream root with evidence gaps and completion conditions.

### Deferred and rejected findings

Maintain a **Deferred and resolved-out findings ledger** on the composer parent:

- `defer` remains durable with ID, evidence, rationale, and suggested revisit trigger;
- `reject`, `duplicate`, and `already-fixed` remain durable with rationale and references;
- deferred findings are not acceptance criteria for active corrective Issues and do not block their completion;
- create a separate backlog Issue only when the user explicitly requests one.

Add only active or immediate-frontier follow-up Issues to the GitHub Project.

## 5. Handoff

Choose the next frontier deterministically:

1. first unblocked `fix-now` corrective Issue;
2. otherwise first required diagnosis Issue;
3. otherwise first required verification Issue;
4. otherwise integration when the review passes and integration remains;
5. otherwise completion when the Workstream objective is actually satisfied.

For correction:

- transition the Workstream to activity `correction`;
- set the selected corrective Issue as active artifact;
- place that Issue on the immediate Project frontier;
- write a handoff containing Workstream root, composer, corrective Issue, approved finding IDs, fixed point, reviewed HEAD, current HEAD, acceptance criteria, required tests, verification requirements, repository state, and one exact next action;
- route to the configured Codex Implementer and stop.

Use the equivalent exact handoff for diagnosis, verification, or integration. Do not say only “handoff the next frontier.” Name the operator, artifact, activity, and next action.

## 6. Close

Close the composer parent only after:

- every required review child is complete;
- coverage is complete;
- the user approved the evaluated finding register;
- the final verdict and deferred ledger are posted;
- all approved follow-up artifacts exist with correct native hierarchy;
- the Workstream handoff succeeded.

Leave the Workstream root open while correction, diagnosis, verification, or integration remains.

## Authority boundary

During synthesis, Review Synthesizer is the sole writer for the composer parent, final finding registers, verdict, deferred ledger, Workstream review transition, follow-up Issue creation, and Project placement. Delegated reviewers remain confined to their assigned children. Review Composer no longer writes after its synthesis-ready handoff.

