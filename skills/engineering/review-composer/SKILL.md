---
name: review-composer
description: Compose and synthesize a review swarm for a frozen multi-ticket, multi-domain, or cross-cutting implementation range. Use when one code reviewer would need to hold too much scope, when a cumulative corrective range needs re-review, or when findings must be deduplicated across bounded review slices.
---

# Review Composer

Orchestrate a bounded review swarm around one frozen range. The composer owns review topology, native Issue hierarchy, coverage, synthesis, and routing. It does not perform the entire code review itself.

Use `/code-review` directly for one small Pull Request, one implementation ticket, or one narrow domain slice. Use this skill when the cumulative range spans several source tickets, several domains, a large diff, or cross-domain seams that cannot be judged reliably by one reviewer context.

The issue tracker and Workstream protocol must already be configured. Run `/setup-matt-pocock-skills` when `docs/agents/issue-tracker.md` or `docs/agents/workstreams.md` is missing.

## Operator contract

`/review-composer` is a **ChatGPT Web-owned flow by default**.

Unless the user explicitly overrides the operator for this run:

1. Require the configured operator to be `ChatGPT Web`.
2. Use `@devspace` for every local file read, code inspection, Git command, diff, and verification command.
3. Use connected `@github` MCP for every GitHub read and write, including Issues, native sub-issue relationships, comments, labels, Project items, and handoffs.
4. Never use native Codex filesystem or shell access as a substitute, `gh`, the ChatGPT GitHub App, or direct REST/GraphQL fallback.
5. If either required transport is unavailable or lacks native sub-issue mutation, stop and report the exact capability gap. Body links are not a substitute for native hierarchy.
6. Do not ask Codex to run the review swarm. Codex may hand off a frozen range, but ChatGPT Web composes and synthesizes it.

An explicit operator override changes only the operator for that run. The selected operator must still use its configured execution profile.

## Choose the phase

This skill has two phases:

- **Phase 1: Compose** — freeze the contract, create the parent and child review Issues, prove coverage, and hand off each child to a delegated reviewer.
- **Phase 2: Synthesize** — after every child is complete, verify the range, read every review, deduplicate findings, publish the verdict, create coherent follow-up Issues, and hand off the Workstream.

If the user names an existing composer parent whose children are complete, synthesize. Otherwise compose. Never synthesize from partial child results unless the user explicitly requests an interim status report, and never close the parent from an interim report.

## Phase 1: Compose

### 1. Resolve and claim

Run `/workstream-tracking` with operation `resolve`, then `reconcile`.

Resolve the canonical Workstream root before creating any review artifact. Claim activity `review-composition`. When reusing an existing composer, make it the active artifact immediately. When creating a new composer, use the Workstream root as the temporary bootstrap artifact, then update the claim to the composer parent as soon as the native child relationship exists. The Workstream-level claim remains with the composer throughout the swarm.

If another operator still owns a writing activity, or implementation has not handed off a pinned reviewed HEAD, stop. A composer never reviews a moving target.

### 2. Freeze the review contract

Record all of the following before partitioning work:

- fixed point;
- reviewed HEAD;
- exact three-dot diff command;
- commit list command and resulting commits;
- implementation and corrective source tickets included in the range;
- applicable specifications and precedence rules;
- explicit exclusions;
- known verification evidence and known environment gaps.

Resolve both refs through `@devspace`, confirm the diff is non-empty, and capture `git diff --stat`, changed paths, and the commit list. Do not infer the range from a branch name or from the current tip alone.

### 3. Inspect the review topology

Inspect enough of the diff, source-ticket boundaries, domain modules, and cross-domain seams to partition the review. This is composition, not the full review.

Identify:

- domain slices with coherent ownership boundaries;
- review axes required by the contract, normally Standards and Specification;
- source tickets that share one correction boundary;
- requirements that cross several slices;
- seams where a Primary reviewer needs a Secondary reviewer;
- explicit exclusions that must be repeated in every affected prompt.

Do not create duplicated full-scope reviews. A child may own one bounded slice across one axis, or a deliberately narrow seam review, but it must not be told to review the whole batch “just in case.”

### 4. Create the parent composer Issue

Search first for an existing composer for the same Workstream and frozen range. Otherwise create one parent Review Composer Issue with:

- `kind:review` and `ws:<slug>` labels;
- the review contract;
- source tickets and specifications;
- the planned slices and axes;
- the coverage matrix;
- synthesis acceptance criteria;
- marker `<!-- review-composer:v1 -->`.

The composer parent must be a **native direct sub-issue of the Workstream root**. Add the parent to the configured GitHub Project and set it to the configured active status, normally `In Progress`.

After the native relationship is confirmed, update the Workstream claim so the composer parent is the active artifact.

If the configured GitHub transport cannot create the native relationship, report the capability gap and stop. Do not silently degrade to a body link.

### 5. Create child review Issues

Create one child Issue per assigned slice and axis. Every child must:

- carry `kind:review` and `ws:<slug>`;
- be a **native direct sub-issue of the composer parent**;
- contain one self-contained reviewer prompt;
- contain one delegated review lease;
- remain outside the Project by default.

Add a child to the Project only when it is blocked or needs human attention. Track normal progress through the parent Issue's native `Sub-issues progress`.

A review child must never be parented by an implementation ticket. Corrective and diagnosis Issues must never be children of the composer.

### 6. Prove coverage

Maintain a coverage matrix on the parent. It must prove:

- every source implementation or corrective ticket has at least one Primary reviewer;
- every applicable requirement has an owner;
- cross-domain seams have a Secondary reviewer where independent inspection is useful;
- every child has a unique bounded assignment;
- no full-scope review is duplicated.

Use a table with at least these columns:

| Coverage item | Source | Primary child | Secondary child | Status |
| --- | --- | --- | --- | --- |

Coverage items may be source tickets, specification requirements, migrations, transaction seams, lifecycle boundaries, authorization boundaries, or integration seams. A child title alone is not proof of coverage; name the concrete item.

### 7. Write self-contained child prompts

Each child body must contain enough context to run in a separate chat without relying on the composer's conversation history:

- repository, branch, Workstream root, composer parent, and child Issue;
- fixed point, reviewed HEAD, diff command, and commit list;
- assigned axis and slice;
- source tickets and applicable specification sections;
- exact concerns and seams to inspect;
- explicit exclusions and precedence rules;
- delegated worker contract;
- required output schema;
- delegated review lease.

Use this lease shape:

```markdown
<!-- delegated-review-lease:v1 -->
## Delegated review lease

- Composer issue: #<composer>
- Child review issue: #<child>
- Frozen range: `<fixed-point>...<reviewed-head>`
- Slice: <bounded slice>
- Axis: <Standards|Specification|explicit seam axis>
- Allowed write surface: this child Issue only
- Local code writes: forbidden
- Project and Workstream mutations: forbidden
```

Use this minimum reviewer output contract:

- scope;
- reviewed HEAD and frozen range;
- axis and slice;
- findings with severity, confidence, location, evidence, impact, and correction boundary;
- no-finding areas;
- questions or insufficient evidence;
- verification performed and not performed;
- explicit exclusions;
- completion status.

Missing delegated lease is a stop condition for the worker.

### 8. Handoff the swarm

After every child exists and the coverage matrix is complete, publish a launch list containing one child link and one concise handoff instruction per reviewer. Each reviewer should run `/code-review` in delegated worker mode in a separate chat.

The composer does not execute all child reviews inside the compose phase and does not publish a parent verdict yet.

## Phase 2: Synthesize

### 1. Re-resolve and freeze again

Run `/workstream-tracking` with `resolve`, then `reconcile`. Claim activity `review-synthesis` on the composer parent.

Re-read the Workstream root, composer parent, every child relationship, latest handoff, and local Git state. Confirm:

- current `HEAD` still equals the pinned reviewed HEAD;
- the fixed point and reviewed HEAD in every child match the parent;
- no child silently widened or changed the range;
- all review children are complete.

If the worktree moved or the frozen range changed, stop and require a new compose phase or restoration of the exact frozen review context. Do not synthesize findings from different reviewed states.

### 2. Read every child completely

Read each child body and all review comments. Confirm the output contract is complete, the lease was respected, and explicit exclusions are visible.

Do not synthesize from summaries alone. A child with missing evidence, ambiguous completion, or a lease violation remains incomplete until corrected or explicitly classified as a verification gap.

### 3. Complete the coverage matrix

Mark every coverage row complete, partial, or unsupported by evidence. A green child count is not enough. Every source ticket and applicable requirement must have an owned result.

Uncovered requirements block synthesis completion unless they are explicitly reclassified as out of scope by the controlling specification.

### 4. Deduplicate by root cause

Deduplicate findings by causal defect and correction boundary, not by wording or file count.

- Merge findings that arise from one underlying ownership, transaction, identity, lifecycle, or authorization defect.
- Keep findings separate when they require different acceptance criteria or can be corrected independently.
- Preserve all originating child links and evidence locations on the deduplicated finding.
- Do not create one ticket per reviewer comment.

### 5. Resolve disagreements

When reviewers disagree:

1. compare the controlling specification and repository standard;
2. compare concrete code and verification evidence;
3. determine whether the disagreement is factual, interpretive, or caused by insufficient evidence;
4. record the resolution and confidence.

If the disagreement cannot be resolved without reproducing or instrumenting the behavior, classify it as `diagnosis required` rather than voting by reviewer count.

Normalize severity to `blocker`, `major`, or `minor`, and confidence to `high`, `medium`, or `low`. Severity follows impact; confidence follows evidence quality.

### 6. Classify every result

Classify every deduplicated item as exactly one of:

- `blocker`;
- `corrective`;
- `diagnosis required`;
- `verification gap`;
- `deferred`;
- `not actionable`.

State why the classification applies and whether it changes the Workstream verdict.

### 7. Publish the synthesis and verdict

Post the final synthesis on the composer parent. Include:

- frozen range and source artifacts;
- coverage result;
- deduplicated findings with originating child reviews;
- disagreement resolutions;
- normalized severity and confidence;
- classification;
- verification limitations;
- final verdict;
- next frontier.

Only the composer updates the parent verdict.

### 8. Create coherent follow-up Issues

Only the composer may create corrective or diagnosis Issues from a review swarm.

Every corrective or diagnosis Issue must:

- be a **native direct sub-issue of the Workstream root**;
- never be a child of the composer;
- carry `kind:corrective` for corrective work, or the configured diagnosis/bug label for diagnosis work;
- carry `ws:<slug>`;
- name the originating composer;
- link all source child reviews;
- state the deduplicated root cause;
- define acceptance criteria;
- define verification requirements.

Add a follow-up Issue to the Project only when it is active or on the immediate frontier. Keep queued corrections outside the Project until they need operational visibility.

### 9. Handoff and close

Run `/workstream-tracking` with operation `handoff`, then transition to:

- `correction` when actionable corrections exist;
- `diagnosis` when evidence must be produced before a correction can be defined;
- `review` for a newly frozen re-review range;
- `integration` when the review passes but integration remains;
- `verification` when environment evidence is the remaining frontier.

The composer parent must not close before every child is complete and the final synthesis is posted. After those conditions are met, close the parent as completed and leave the Workstream root open while correction, diagnosis, verification, or integration remains.

## Required hierarchy

```text
Workstream root
├── Specifications
├── Implementation tickets
├── Review Composer
│   ├── Review child
│   ├── Review child
│   └── Review child
├── Corrective issues
├── Diagnosis issues
└── Verification or integration artifacts
```

The parent composer is a direct child of the Workstream root. Review children are direct children of the composer. Corrective and diagnosis Issues are direct children of the Workstream root and must not be children of the composer.
