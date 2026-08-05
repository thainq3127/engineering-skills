---
name: code-review
description: Review a frozen change range in either focused mode or as one delegated worker in a Review Composer swarm. Use for a small PR, one implementation ticket, one narrow domain slice, or a composer child with an exact slice, axis, lease, and write surface.
---

# Code Review

Review the diff between a fixed point and a pinned reviewed `HEAD`.

This skill has two modes:

- **Focused mode** — one small Pull Request, one implementation ticket, or one narrow domain slice that one reviewer can hold reliably.
- **Delegated worker mode** — one native child Issue of a Review Composer, bounded to an exact frozen range, slice, axis, and allowed write surface.

Do not use focused mode to absorb a large cumulative implementation batch. When the range spans several tickets, several domains, a large diff, or cross-domain seams, route to `/review-composer`.

The issue tracker and Workstream protocol should already be configured. Run `/setup-matt-pocock-skills` if `docs/agents/issue-tracker.md` or `docs/agents/workstreams.md` is missing.

## Operator contract

`/code-review` is a **ChatGPT Web-owned flow by default**.

Unless the user explicitly overrides the operator for this run:

1. Require the configured operator to be `ChatGPT Web`.
2. Use `@devspace` for every local file read, code inspection, Git command, diff, test, and local write.
3. Use connected `@github` MCP for every GitHub read and write, including review surfaces, comments, labels, native sub-issue relationships, Project items, corrective Issues, and handoffs.
4. Never use native Codex filesystem or shell access as a substitute, `gh`, the ChatGPT GitHub App, or direct REST/GraphQL fallback.
5. If `@devspace` or `@github` is unavailable, stop and report the missing capability.
6. If invoked from Codex without an explicit operator override, do not perform the review. Preserve the frozen implementation handoff and transfer the next action to ChatGPT Web.

An explicit override changes the operator only for that run. The overridden operator must still use its configured execution profile.

## Select the mode

Resolve the active review artifact and its native parent before inspecting the diff.

Use **delegated worker mode** when all of these are true:

- the active Issue is a native direct sub-issue of an Issue whose composer identity is verified as `<!-- review-composer:v1 -->`;
- the child contains a delegated lease whose identity is verified as `<!-- delegated-review-lease:v1 -->`;
- the lease pins the composer Issue, child Issue, frozen range, slice, axis, and allowed write surface.

Missing delegated lease is a stop condition. A body link to a parent is not enough.

### Marker transport rule

GitHub detail reads may sanitize issue bodies and remove HTML comments. Absence of a hidden marker from an `issue_read` response is therefore not proof that the marker is absent on GitHub.

Before stopping for a missing composer or lease marker:

1. Accept the exact visible protocol line when present:
   - ``- Protocol: `<!-- review-composer:v1 -->` `` on the parent;
   - ``- Protocol: `<!-- delegated-review-lease:v1 -->` `` on the child.
2. Otherwise run a raw-preserving GitHub issue search scoped to the same owner and repository for the exact hidden marker.
3. Require the search result to include the exact expected issue number and require its returned body to contain the exact marker.
4. Treat no exact-number match, ambiguous repository identity, or unavailable raw-preserving search as a stop condition.

Do not accept `<!-- review-composer-launch:v1 -->`, a comment on another Issue, a title convention, a body link, or a structurally similar heading as a substitute for the exact composer identity.

Use **focused mode** otherwise, but only when the review is genuinely bounded to one small PR, one source ticket, or one narrow domain slice. If the range is multi-ticket, multi-domain, cross-cutting, or too large for one reviewer context, stop and hand it to `/review-composer` instead of quietly widening focused mode.

## Shared frozen-range checks

Before either mode:

1. Run `/workstream-tracking` with operation `resolve`, then `reconcile`.
2. Use the fixed point and reviewed HEAD supplied by the implementation handoff, composer parent, or child lease. Never guess from a branch name.
3. Resolve both refs through `@devspace`.
4. Capture `git diff <fixed-point>...<reviewed-head>` and `git log <fixed-point>..<reviewed-head> --oneline`.
5. Confirm the diff is non-empty.
6. Confirm no unexpected merge or rebase is active.

Review is read-only against local files. Verification commands may run only when they do not modify tracked or untracked workspace state. If a command would install dependencies, rewrite snapshots, generate artifacts, or mutate the workspace, do not run it; record the limitation.

## Review sources

### Specification sources

Resolve the applicable specification in this order:

1. the Review Composer parent and child prompt, when delegated;
2. source Issue references in commit messages;
3. a user-supplied Issue, PRD, or spec path;
4. a matching file under `docs/`, `specs/`, or `.scratch/`.

In delegated mode, do not replace the composer's precedence rules or add excluded requirements. In focused mode, if no specification exists, report `no spec available` rather than inventing one.

### Standards sources

Read repository instructions and documented standards such as `AGENTS.md`, `CLAUDE.md`, `CONTRIBUTING.md`, or `CODING_STANDARDS.md`.

The Standards axis also carries this Fowler smell baseline. Repository rules override it, tooling-enforced formatting is skipped, and every baseline smell remains a judgement call:

- **Mysterious Name** — a name does not reveal what it does or holds. Rename it; if no honest name exists, the design is unclear.
- **Duplicated Code** — the same logic shape appears in more than one changed place. Extract the shared shape.
- **Feature Envy** — a function reaches into another object's data more than its own. Move behavior toward the data.
- **Data Clumps** — the same fields repeatedly travel together. Give the group a type.
- **Primitive Obsession** — a primitive stands in for a domain concept. Model the concept explicitly.
- **Repeated Switches** — the same type switch recurs. Centralize it or replace it with polymorphism.
- **Shotgun Surgery** — one logical change requires scattered edits. Gather the changing behavior behind one boundary.
- **Divergent Change** — one module changes for unrelated reasons. Split responsibilities.
- **Speculative Generality** — abstraction exists for requirements the spec does not have. Remove it until a real need appears.
- **Message Chains** — callers navigate deep object graphs. Hide navigation behind a suitable interface.
- **Middle Man** — a layer only delegates. Remove it or give it real policy.
- **Refused Bequest** — an implementation rejects most inherited behavior. Prefer composition.

## Focused mode

### 1. Claim and choose the review surface

Claim activity `review` through `/workstream-tracking` with the pinned fixed point and reviewed HEAD.

Choose one durable surface:

- Pull Request review for a PR;
- focused review Issue for a branch or source ticket without a PR;
- source-Issue comment only for a tiny verification where a separate artifact would add no value.

### 2. Review both axes

Focused mode reviews two independent axes:

- **Standards** — repo instructions, documented conventions, architecture boundaries, and the smell baseline.
- **Specification** — missing or partial requirements, incorrect implementations, and unrequested scope.

Use separate contexts or parallel sub-agents when the harness supports them, so one axis does not anchor the other. Keep the reports separate. Do not merge or rerank Standards and Specification findings into one blended list before publication.

Each finding must include:

- severity and confidence;
- location;
- violated standard or specification requirement;
- evidence;
- impact;
- suggested correction boundary.

Also report no-finding areas, questions or insufficient evidence, verification performed and not performed, and explicit exclusions.

### 3. Publish and route

Before publishing, confirm `git rev-parse <reviewed-head>` still resolves to the pinned commit and the review surface still names the same range.

Publish Standards and Specification separately, then summarize the count and worst severity within each axis.

In focused mode, coherent corrective work may be registered through `/workstream-tracking` when it has an independent outcome and acceptance criteria. Do not create one Issue per comment. Route unclear defects to `/diagnosing-bugs`.

Handoff:

- no blocking findings → integration, verification, or source-artifact completion;
- blocking findings → correction with the first coherent corrective artifact;
- insufficient evidence → diagnosis or verification, preserving the limitation.

Keep the Workstream root open while work remains.

## Delegated worker mode

Delegated mode is not a smaller composer. It is one bounded reviewer lease.

### 1. Validate hierarchy and lease

Read the Workstream root, composer parent, child Issue, parent relationship, and lease through `@github`.

Validate hidden marker identity through the marker transport rule above. Do not conclude that a marker is missing merely because the normal Issue detail response omitted HTML comments.

Confirm:

- the composer parent is a native direct child of the Workstream root;
- this child is a native direct child of the composer;
- the composer holds the Workstream-level `review-composition` or `delegated-review` claim;
- the lease names this exact composer and child;
- the lease range matches the parent;
- the assigned slice and axis are unambiguous;
- the allowed write surface is this child Issue only.

Run `/workstream-tracking` with activity `delegated-review`. This records or validates the delegated lease without replacing the composer's Workstream-level claim.

If any condition fails, stop. Do not repair hierarchy, change the lease, or take over the root.

### 2. Stay inside the assignment

Review only the exact frozen range and assigned slice/axis.

- Do not review explicit exclusions.
- Do not broaden into a full-batch review.
- Do not change the fixed point or reviewed HEAD.
- Do not modify local files.
- Do not update the composer parent verdict.
- Do not change Workstream root state or Project state.
- Do not create corrective or diagnosis Issues.
- Do not deduplicate or rerank findings from other reviewers.

When evidence crosses a domain boundary, inspect only enough of the adjacent seam to support or reject the assigned finding. Record the cross-slice dependency for synthesis rather than claiming the adjacent slice.

### 3. Write the child report

Write findings only to the assigned child Issue. The minimum output is:

```markdown
## Scope

- Reviewed HEAD: `<sha>`
- Frozen range: `<fixed-point>...<reviewed-head>`
- Axis: <axis>
- Slice: <slice>

## Findings

### <finding>

- Severity: <blocker|major|minor>
- Confidence: <high|medium|low>
- Location: <file, symbol, or hunk>
- Requirement or standard: <source>
- Evidence: <concrete evidence>
- Impact: <why it matters>
- Correction boundary: <coherent owning fix>
- Cross-slice dependency: <child or none>

## No-finding areas

- <area checked with no finding>

## Questions or insufficient evidence

- <question or none>

## Verification

- Performed: <commands or inspection>
- Not performed: <limitations>

## Explicit exclusions

- <exclusion>

## Completion

- Status: complete
```

Do not omit no-finding areas or exclusions. They are coverage evidence for the composer.

### 4. Complete only the child

Before completion, confirm the reviewed commit and range still match the lease. Post the final report and close the child Issue as completed.

Do not post a Workstream handoff, alter the composer parent, create follow-up tickets, or transition the Project. Review Synthesizer is the only writer for synthesis, final parent verdict, Workstream transition, and corrective, diagnosis, or verification Issue creation after every required child is complete.

## Why the modes stay separate

Focused review owns one coherent review and may route its own result. Delegated review contributes evidence to a larger review but owns no global verdict. Mixing the two would allow parallel workers to race on the parent, duplicate tickets, widen ranges, and turn six bounded reviews into six conflicting control planes.
