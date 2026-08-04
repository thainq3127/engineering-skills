---
name: to-tickets
description: Break a plan, spec, or the current conversation into a set of tracer-bullet tickets, each declaring its blocking edges, published to the configured tracker — edges as text in one file per ticket locally, or native blocking links on a real tracker.
disable-model-invocation: true
---

# To Tickets

Break a plan, specification, or conversation into **tracer-bullet tickets**, each declaring the tickets that block it.

The issue tracker, Workstream protocol, and triage vocabulary should have been configured. Run `/setup-matt-pocock-skills` if the required `docs/agents/*.md` files are missing.

## Workstream envelope

Run `/workstream-tracking` with operation `resolve`, then claim activity `ticketing`.

- Reuse the Workstream attached to the source specification or issue.
- Never create a second Workstream because implementation is being sliced.
- Child implementation Issues sit directly under the Workstream root so the hierarchy remains one level deep; each also links the source specification.
- The Workstream root and source specification are not implementation tickets.

## Process

### 1. Gather context

Use the current conversation. If the user supplies a specification path, Issue number, or URL, fetch the full artifact and comments. Read the Workstream root and latest handoff.

### 2. Explore the codebase when needed

Understand current code, domain vocabulary, ADRs, and likely testing seams. Look for prefactoring opportunities: make the change easy, then make the easy change.

### 3. Draft vertical slices

Each tracer bullet:

- cuts a narrow but complete path through every needed layer;
- is independently demoable or verifiable;
- fits in one fresh context window;
- includes prefactoring first when that unlocks the slice.

Give every ticket its **blocking edges**. A ticket with no open blockers is on the frontier.

#### Wide-refactor exception

A wide mechanical refactor whose blast radius cannot land as vertical slices uses expand-contract:

1. expand with the new form beside the old;
2. migrate callers in green batches;
3. contract only after every migration completes.

When batches cannot stay green alone, use an integration branch and a final integrate-and-verify ticket.

### 4. Quiz the user

Present a numbered proposal. For each ticket show:

- title;
- blocked by;
- end-to-end behavior delivered.

Ask whether granularity and blocking edges are correct and whether any ticket should be merged or split. Iterate until approved.

### 5. Publish idempotently

Publish blockers first so later tickets can reference real identifiers.

For local files, write one file per ticket under `.scratch/<feature-slug>/issues/`, in dependency order.

For a real tracker, for each approved ticket:

1. Search open and recently closed Issues for an existing match in the same Workstream.
2. Create only when no durable equivalent exists.
3. Apply `kind:implementation`, `ws:<slug>`, `ready-for-agent`, and approved area labels.
4. Add the Workstream marker, root link, source specification link, acceptance criteria, and blocker references.
5. Link directly to the Workstream root as a native child when supported.
6. Wire native blocking relationships in a second pass. If MCP lacks that operation, use the configured body fallback and report the capability gap; do not fall back to `gh`.
7. Add only frontier tickets to the Project with queued status. Leave later blocked tickets in the Issue hierarchy until they become actionable or need operational visibility.

Do not close or rewrite the source specification or Workstream root.

After publishing, run `/workstream-tracking` with operation `reconcile`, then hand off to the first frontier ticket with activity `implementation` and an unassigned next operator unless the user has named one.

<local-ticket-template>

# <NN> — <Ticket title>

**What to build:** the complete end-to-end behavior this ticket makes work.

**Blocked by:** the tickets that genuinely gate it, or "None — can start immediately".

**Status:** ready-for-agent

- [ ] Acceptance criterion 1
- [ ] Acceptance criterion 2

</local-ticket-template>

<issue-template>

<!-- workstream-root:<owner>/<repo>#<number> -->

## Workstream

- <linked Workstream root title>

## Source specification

- <linked specification>

## What to build

The complete end-to-end behavior this ticket makes work.

## Acceptance criteria

- [ ] Criterion 1
- [ ] Criterion 2

## Blocked by

- <blocking Issue links, or "None — can start immediately">

</issue-template>

Avoid ordinary file paths or code snippets. A prototype may contribute a small decision-rich snippet when prose would be less precise.
