---
name: grill-with-docs
description: A relentless interview to sharpen a plan or design while maintaining the repository's domain glossary, ADRs, and durable Workstream context.
disable-model-invocation: true
---

# Grill With Docs

Run a `/grilling` session while using `/domain-modeling` to capture resolved language and hard-to-reverse decisions.

## Workstream envelope

Read `docs/agents/workstreams.md` when it exists.

- If the conversation already belongs to a Workstream, run `/workstream-tracking` with `resolve` and `reconcile`, then claim activity `planning` before changing `CONTEXT.md`, ADRs, or other repository files.
- If the user is still exploring a small or standalone idea, discussion may remain untracked and read-only.
- Once the conversation establishes a durable multi-session objective with a clear name and the user wants it tracked, run `ensure`, then claim `planning` before writing durable repository context.
- Never create a Workstream merely because `/grill-with-docs` was invoked.
- If another operator owns the Workstream, continue only as a read-only discussion or stop for an explicit handoff. Do not write around the claim.

Nested `/domain-modeling` inherits this claim; it does not create a second one.

For a tracked grill, use one durable planning artifact as the active write surface:

- reuse an existing specification, planning, or decision Issue when it already owns the question;
- otherwise create or reuse one native direct child of the Workstream root titled `[Planning] <topic>`;
- apply `kind:decision` and `ws:<slug>` plus marker `<!-- planning-decision:v1 -->`;
- register it through `/workstream-tracking` and claim `planning` on that Issue before the interview continues.

Do not use the Workstream root as a long-form notebook. It remains the low-resolution index unless it is itself the intentional planning artifact.

## Interview and capture

Use `/grilling` one question at a time. As decisions crystallise:

- update the glossary inline through `/domain-modeling`;
- create ADRs only when the decision is hard to reverse, surprising without context, and the result of a real trade-off;
- record implementation requirements in the eventual specification or source Issue, not in `CONTEXT.md`;
- keep the Workstream root low resolution.

After every answer the user explicitly confirms as a decision:

1. update any glossary or ADR artifact that the decision requires;
2. run `/workstream-tracking` with operation `checkpoint` on the active planning Issue;
3. record the confirmed decision, rationale, evidence or source, and the exact next open question;
4. verify the checkpoint is durable before asking that next question.

Do not batch confirmed decisions until the end of the session. Recommendations, tentative answers, and unanswered options are not checkpoints. At most one newly confirmed decision may exist only in chat at any time.

## Handoff

When the conversation reaches a stable boundary, use `/workstream-tracking` to hand off to the next activity:

- unresolved runnable design question → `prototype`;
- settled multi-session build → `specification`;
- genuinely small build → `implementation`;
- more fog than one session can hold → recommend `/wayfinder` and hand off to `planning`.

Build the handoff from the active Issue's durable checkpoint block, not from chat memory.

- When planning is settled, post one resolution comment assembled from the confirmed checkpoints, set `Next open question` to `None`, close the planning Issue, and hand off to the next activity.
- When questions remain, leave the planning Issue open and hand off with its exact `Next open question` as the next action.
- When context pressure appears before a natural boundary, checkpoint immediately and hand off instead of asking another question.

Record files updated and one concrete next action. Do not use a chat transcript as the only durable context.
