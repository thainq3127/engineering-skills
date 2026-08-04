---
name: to-spec
description: Turn the current conversation into a spec and publish it to the project issue tracker — no interview, just synthesis of what you've already discussed.
disable-model-invocation: true
---

# To Spec

Turn the current conversation context and codebase understanding into a specification. Do not interview the user again; synthesize what is already known.

The issue tracker, Workstream protocol, and triage vocabulary should have been configured. Run `/setup-matt-pocock-skills` if `docs/agents/issue-tracker.md` or `docs/agents/workstreams.md` is missing.

## Workstream envelope

Before writing, run `/workstream-tracking` with operation `resolve`.

- Reuse the current Workstream when the objective is unchanged.
- If this is a durable multi-session objective and no Workstream exists, run `ensure` only after the Workstream name and objective are already clear from the conversation.
- Do not create a Workstream for a small standalone change that one Issue can fully describe.
- Claim activity `specification` before publishing.

The Workstream root is an index and execution anchor. The specification remains a separate Issue unless a wayfinder map is already serving as the root.

## Process

### 1. Explore the current state

Explore the repository if needed. Use the project's domain glossary vocabulary and respect ADRs in the area being changed.

Read the Workstream root, relevant decisions, previous handoffs, and any source issue before drafting.

### 2. Choose testing seams

Sketch the seams at which the feature will be tested. Prefer existing seams to new ones and use the highest seam possible. The fewer seams across the codebase, the better; the ideal is one.

Check with the user that these seams match their expectations.

### 3. Write and publish

Write the specification with the template below, then publish it to the configured tracker.

For a real tracker:

1. Search for an existing matching specification before creating one.
2. Apply the configured `kind:spec`, `ws:<slug>`, and any approved area labels.
3. Add the Workstream marker and linked root section.
4. Link the spec to the root through the native child relationship when available.
5. Apply `ready-for-agent` when that remains the configured triage convention.
6. Register the specification in the Project because it is active.
7. Use `/workstream-tracking` to hand off to `ticketing`, with the spec as the active artifact and one concrete next action.

Do not duplicate the full specification in the Workstream root or Project fields.

<spec-template>

## Problem Statement

The problem that the user is facing, from the user's perspective.

## Solution

The solution to the problem, from the user's perspective.

## User Stories

A LONG, numbered list of user stories. Each user story should be in the format:

1. As an <actor>, I want a <feature>, so that <benefit>

<user-story-example>
1. As a mobile bank customer, I want to see balance on my accounts, so that I can make better informed decisions about my spending
</user-story-example>

This list should be extensive and cover all aspects of the feature.

## Implementation Decisions

A list of decisions already made, including where relevant:

- modules to build or modify;
- module interfaces;
- technical clarifications;
- architectural decisions;
- schema changes;
- API contracts;
- specific interactions.

Do not include specific file paths or ordinary code snippets; they age quickly.

Exception: if a prototype produced a snippet that encodes a decision more precisely than prose can, inline only the decision-rich part and note that it came from a prototype.

## Testing Decisions

Include:

- what makes a good external-behaviour test;
- which modules or seams will be tested;
- prior art for similar tests in the codebase.

## Out of Scope

Things explicitly outside this specification.

## Further Notes

Any further information needed to preserve the decisions.

</spec-template>
