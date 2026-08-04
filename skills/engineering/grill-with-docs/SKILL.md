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

## Interview and capture

Use `/grilling` one question at a time. As decisions crystallise:

- update the glossary inline through `/domain-modeling`;
- create ADRs only when the decision is hard to reverse, surprising without context, and the result of a real trade-off;
- record implementation requirements in the eventual specification or source Issue, not in `CONTEXT.md`;
- keep the Workstream root low resolution.

## Handoff

When the conversation reaches a stable boundary, use `/workstream-tracking` to hand off to the next activity:

- unresolved runnable design question → `prototype`;
- settled multi-session build → `specification`;
- genuinely small build → `implementation`;
- more fog than one session can hold → recommend `/wayfinder` and hand off to `planning`.

Record the decisions made, files updated, open questions, and one concrete next action on the Workstream's active planning artifact or root issue. Do not use a chat transcript as the only durable context.
