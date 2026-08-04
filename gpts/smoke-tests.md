# Phase 1 GPT smoke tests

Run these manually after creating the seven GPTs. Use a disposable Workstream or read-only fixture where a test would otherwise mutate durable state.

## Matt

1. Present a loose but bounded feature idea that still needs questioning. Expect one route to Grill With Docs and no repository or GitHub mutation.
2. Present a decision-complete feature that now needs a specification. Expect Engineering Planner.
3. Present a large effort with unresolved dependent decisions. Expect Wayfinder rather than premature specification.
4. Present a cumulative correction range spanning several tickets. Expect Review Composer rather than Code Reviewer.

## Grill With Docs

1. Present a fuzzy feature idea. Expect exactly one substantive question at a time, with later questions grounded in prior answers.
2. Establish a durable domain term and a hard-to-reverse trade-off. Expect the glossary to capture the term and an ADR to be offered only for the trade-off.
3. Ask it to publish a specification before important decisions are settled. Expect continued interview or a handoff, not a premature specification.
4. Let the idea become settled. Expect a durable handoff to Engineering Planner with decisions, open questions, and one next action.

## Engineering Planner

1. Provide a decision-rich conversation or Grill With Docs handoff and request a specification. Expect synthesis without restarting the interview.
2. Provide an approved specification. Expect tracer-bullet tickets, explicit blockers, a review checkpoint before publishing, and only frontier Project placement.
3. Provide conversationally resolvable decision gaps. Expect a Grill With Docs handoff rather than invented decisions.
4. Provide an effort with unresolved dependent decision fog. Expect a Wayfinder handoff instead of invented decisions.

## Wayfinder

1. Ask to chart a large uncertain effort. Expect one map, native decision children, blockers, fog, and no resolved ticket.
2. Ask to work the map without naming a ticket. Expect one frontier ticket to be claimed and resolved.
3. Ask it to implement after clearing one decision. Expect a handoff, not production code changes.

## Code Reviewer

1. Give a small frozen single-ticket range. Expect focused mode and evidence-based findings across specification and standards.
2. Give a valid composer child lease. Expect delegated mode, exact-range verification, and child-only writes.
3. Remove one required lease field or mismatch reviewed HEAD. Expect a stop with no review artifact mutation.

## Review Composer

1. Give a frozen cumulative range. Expect native composer hierarchy, bounded children, leases, and a complete coverage matrix.
2. Provide completed child reviews for one exact range. Expect deduplicated synthesis, normalized severity/confidence, verdict, and root-level follow-up Issues.
3. Introduce a range mismatch or missing child coverage. Expect synthesis to stop.

## Triage Operator

1. Give an incoming bug with incomplete reproduction details. Expect verification attempt, a needs-info recommendation, and specific unanswered questions.
2. Give an enhancement already present in the codebase. Expect redundancy evidence and an already-implemented outcome, not an out-of-scope record.
3. Give a verified, bounded enhancement and approve the recommendation. Expect one category, one state, an agent brief, appropriate Workstream placement, and a Codex implementation handoff.

## Cross-cutting failures

Every GPT should stop rather than fall back when `@devspace` or `@github` is unavailable. None should use the ChatGPT GitHub App, `gh`, direct REST/GraphQL, or an unconfigured workspace as a substitute.
