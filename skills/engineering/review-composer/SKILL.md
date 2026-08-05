---
name: review-composer
description: Compose a bounded review swarm for one frozen multi-ticket, multi-domain, or cross-cutting range. Use when one reviewer cannot reliably hold the whole scope and delegated review children need exact prompts, leases, hierarchy, and coverage.
---

# Review Composer

Compose a bounded review swarm around one frozen range. The composer owns topology, native Issue hierarchy, coverage, reviewer prompts, delegated leases, and the launch handoff. It does not synthesize findings, issue a verdict, create corrective work, or modify production code.

Use `/code-review` directly for one small Pull Request, one implementation ticket, or one narrow domain slice. Use `/review-composer` when a cumulative range spans several tickets, domains, a large diff, or cross-domain seams that cannot be judged reliably in one reviewer context.

After every required child review is complete, hand the existing composer parent to `/review-synthesizer`.

The issue tracker and Workstream protocol must already be configured. Run `/setup-matt-pocock-skills` when `docs/agents/issue-tracker.md` or `docs/agents/workstreams.md` is missing.

## Operator contract

`/review-composer` is a **ChatGPT Web-owned flow by default**.

Unless the user explicitly overrides the operator for this run:

1. Require the configured operator to be `ChatGPT Web`.
2. Use `@devspace` for every local file read, code inspection, Git command, diff, and verification command.
3. Use connected `@github` MCP for every GitHub read and write, including Issues, native sub-issue relationships, comments, labels, Project items, and handoffs.
4. Never use native Codex filesystem or shell access as a substitute, `gh`, the ChatGPT GitHub App, or direct REST/GraphQL fallback.
5. If either required transport is unavailable or lacks native sub-issue mutation, stop and report the exact capability gap. Body links are not a substitute for native hierarchy.
6. Do not ask Codex to compose or run the review swarm. Codex may hand off a frozen range, but ChatGPT Web owns composition.

An explicit operator override changes only the operator for that run. The selected operator must still use its configured execution profile.

## Compose

### 1. Resolve and claim

Run `/workstream-tracking` with operation `resolve`, then `reconcile`.

Resolve the canonical Workstream root before creating review artifacts. Claim activity `review-composition`. When creating a composer, use the Workstream root as the bootstrap artifact, then update the claim to the composer parent after the native relationship exists.

If another operator owns a writing activity, or implementation has not handed off a pinned reviewed HEAD, stop. Never compose against a moving target.

### 2. Freeze the review contract

Resolve the controlling specification and read its user-confirmed **Delivery Context**. Require the product stage, current objective, critical user journeys, release gate, operating envelope, explicit non-goals, and durable confirmation evidence.

Do not ask the user to confirm that context again. If it is missing, contradictory across controlling sources, or clearly invalidated by the implementation, stop and route the specification back through `/to-spec` for amendment and confirmation.

Record:

- fixed point;
- reviewed HEAD;
- exact three-dot diff command;
- commit list command and resulting commits;
- included implementation and corrective source tickets;
- applicable specifications and precedence rules;
- the controlling specification and its confirmation evidence;
- a frozen Delivery Context snapshot containing product stage, current objective, critical user journeys, release gate, operating envelope, and explicit non-goals;
- explicit exclusions;
- known verification evidence and environment gaps.

Resolve both refs through `@devspace`, confirm the diff is non-empty, and capture `git diff --stat`, changed paths, and the commit list. Do not infer the range from a branch name or current tip alone.

### 3. Inspect topology

Inspect enough of the diff, source-ticket boundaries, domain modules, requirements, and cross-domain seams to partition the work. This is composition, not the full review.

Identify:

- coherent domain slices;
- required axes, normally Standards and Specification;
- source tickets that share one correction boundary;
- cross-slice requirements;
- seams that benefit from Primary and Secondary review;
- exclusions every affected prompt must repeat.

Do not create duplicated full-scope reviews.

### 4. Create or reuse the composer parent

Search first for a composer with the same Workstream and frozen range. Otherwise create one parent Issue containing:

- `kind:review` and `ws:<slug>` labels;
- hidden marker `<!-- review-composer:v1 -->`;
- visible protocol line ``- Protocol: `<!-- review-composer:v1 -->` `` so transports that sanitize HTML comments can still verify the identity;
- frozen review contract;
- frozen Delivery Context snapshot and source specification;
- source tickets and specifications;
- planned slices and axes;
- coverage matrix;
- composition acceptance criteria;
- synthesis-ready conditions.

The composer parent must be a **native direct sub-issue of the Workstream root**. Add it to the configured GitHub Project and set the active status. Update the Workstream claim to the composer parent only after the relationship is confirmed.

### 5. Create review children

Create one native child Issue per bounded slice and axis. Every child must:

- carry `kind:review` and `ws:<slug>`;
- be a native direct child of the composer parent;
- contain one self-contained reviewer prompt;
- contain one delegated review lease;
- remain outside the Project by default.

Corrective, diagnosis, and verification Issues must never be children of the composer.

### 6. Prove coverage

Maintain a coverage matrix on the parent with at least:

| Coverage item | Source | Primary child | Secondary child | Status |
| --- | --- | --- | --- | --- |

Prove that every included source ticket and applicable requirement has an owner, cross-domain seams have Secondary review where useful, child assignments are unique, and exclusions are explicit.

### 7. Write reviewer prompts and leases

Every child prompt must be runnable in a separate chat and include:

- repository, branch, Workstream root, composer parent, and child Issue;
- fixed point, reviewed HEAD, diff command, and commit list;
- assigned axis and slice;
- source tickets and specification sections;
- the frozen Delivery Context snapshot, including release gate, operating envelope, and explicit non-goals;
- concerns and seams to inspect;
- exclusions and precedence rules;
- delegated worker boundary;
- required report schema;
- delegated review lease.

Tell every reviewer to report technical findings exhaustively while keeping technical severity separate from delivery priority. Review children produce evidence; they do not decide that a severe, rare, or theoretical risk is automatically `fix-now`.

Use this lease shape:

```markdown
<!-- delegated-review-lease:v1 -->
## Delegated review lease

- Protocol: `<!-- delegated-review-lease:v1 -->`
- Composer issue: #<composer>
- Child review issue: #<child>
- Frozen range: `<fixed-point>...<reviewed-head>`
- Slice: <bounded slice>
- Axis: <Standards|Specification|explicit seam axis>
- Allowed write surface: this child Issue only
- Local code writes: forbidden
- Project and Workstream mutations: forbidden
```

The hidden marker and visible protocol line are the same identity expressed twice for transport compatibility. Do not replace either with a launch marker, title convention, or prose-only heading.

The minimum reviewer report contains scope, reviewed range, axis and slice, findings with evidence and correction boundary, no-finding areas, questions or insufficient evidence, verification limits, exclusions, and completion status.

### 8. Launch and hand off

After every child exists and coverage is complete:

1. publish a launch list with one child link and one concise instruction per reviewer;
2. transition the Workstream from `review-composition` to `delegated-review` while retaining the composer parent as active artifact;
3. record the required child list and synthesis-ready conditions on the parent;
4. leave this exact next action: run each child through `/code-review` in delegated worker mode;
5. name `/review-synthesizer` as the next agent after all required children complete;
6. stop.

Do not wait in the same chat for reviewers, inspect child findings, create a finding register, issue a verdict, create follow-up work, or hand off an implementer. Those belong to `/review-synthesizer`.

## Required hierarchy

```text
Workstream root
├── Review Composer
│   ├── Review child
│   ├── Review child
│   └── Review child
├── Corrective issues created later by Review Synthesizer
├── Diagnosis issues created later by Review Synthesizer
└── Verification or integration artifacts
```

