---
name: code-review
description: Review a frozen change range between a fixed point and a pinned reviewed HEAD along two axes — Standards and Spec — then publish findings and hand off the Workstream. Runs both reviews in parallel sub-agents. Use when the user wants to review a branch, PR, or work-in-progress range.
---

Two-axis review of the diff between a pinned reviewed `HEAD` and a fixed point:

- **Standards** — does the code conform to this repo's documented coding standards?
- **Spec** — does the code faithfully implement the originating issue / PRD / spec?

Both axes run as **parallel sub-agents** so they don't pollute each other's context, then this skill aggregates their findings.

The issue tracker and Workstream protocol should have been provided to you — run `/setup-matt-pocock-skills` if `docs/agents/issue-tracker.md` or `docs/agents/workstreams.md` is missing.

## Workstream envelope

Before reviewing, run `/workstream-tracking` with operation `resolve`, then `reconcile`.

Choose the durable review surface before doing the review:

- **Pull Request review** — publish the review on the Pull Request.
- **Branch or specification review without a Pull Request** — search for an existing review Issue, otherwise create one with `kind:review` and the current `ws:<slug>` label.
- **Small verification of one source Issue** — use a comment on that Issue when a separate review artifact would add no value.

Claim activity `review`. A review claim is read-only by default and must pin both the fixed point and reviewed `HEAD`. Record `reviewed-head=$(git rev-parse HEAD)` at claim time. Do not review while another operator is still writing or while `HEAD` is moving.

## Process

### 1. Pin the fixed point

Use the fixed point the user supplied or the implementation handoff pinned. If neither exists, ask for one. Never guess a review range from a branch name alone.

Capture the diff command once: `git diff <fixed-point>...<reviewed-head>` (three-dot, so the comparison is against the merge-base). Also note the list of commits via `git log <fixed-point>..<reviewed-head> --oneline`.

Before going further, confirm both refs resolve and the diff is non-empty. A bad ref or empty diff should fail here — not inside two parallel sub-agents.

### 2. Identify the spec source

Look for the originating spec, in this order:

1. Issue references in the commit messages (`#123`, `Closes #45`, GitLab `!67`, etc.) — fetch via the workflow in `docs/agents/issue-tracker.md`.
2. A path the user passed as an argument.
3. A PRD/spec file under `docs/`, `specs/`, or `.scratch/` matching the branch name or feature.
4. If nothing is found, ask the user where the spec is. If they say there isn't one, the **Spec** sub-agent will skip and report "no spec available".

### 3. Identify the standards sources

Anything in the repo that documents how code should be written, such as `CODING_STANDARDS.md` or `CONTRIBUTING.md`.

On top of whatever the repo documents, the Standards axis always carries the **smell baseline** below — a fixed set of Fowler code smells (_Refactoring_, ch.3) that applies even when a repo documents nothing. Two rules bind it:

- **The repo overrides.** A documented repo standard always wins; where it endorses something the baseline would flag, suppress the smell.
- **Always a judgement call.** Each smell is a labelled heuristic ("possible Feature Envy"), never a hard violation — and, like any standard here, skip anything tooling already enforces.

Each smell reads *what it is* → *how to fix*; match it against the diff:

- **Mysterious Name** — a function, variable, or type whose name doesn't reveal what it does or holds. → rename it; if no honest name comes, the design's murky.
- **Duplicated Code** — the same logic shape appears in more than one hunk or file in the change. → extract the shared shape, call it from both.
- **Feature Envy** — a method that reaches into another object's data more than its own. → move the method onto the data it envies.
- **Data Clumps** — the same few fields or params keep travelling together (a type wanting to be born). → bundle them into one type, pass that.
- **Primitive Obsession** — a primitive or string standing in for a domain concept that deserves its own type. → give the concept its own small type.
- **Repeated Switches** — the same `switch`/`if`-cascade on the same type recurs across the change. → replace with polymorphism, or one map both sites share.
- **Shotgun Surgery** — one logical change forces scattered edits across many files in the diff. → gather what changes together into one module.
- **Divergent Change** — one file or module is edited for several unrelated reasons. → split so each module changes for one reason.
- **Speculative Generality** — abstraction, parameters, or hooks added for needs the spec doesn't have. → delete it; inline back until a real need shows.
- **Message Chains** — long `a.b().c().d()` navigation the caller shouldn't depend on. → hide the walk behind one method on the first object.
- **Middle Man** — a class or function that mostly just delegates onward. → cut it, call the real target direct.
- **Refused Bequest** — a subclass or implementer that ignores or overrides most of what it inherits. → drop the inheritance, use composition.

### 4. Spawn both sub-agents in parallel

Send a single message with two `Agent` tool calls. Use the `general-purpose` subagent for both.

**Standards sub-agent prompt** — include:

- The full diff command and commit list.
- The list of standards-source files you found in step 3, **plus the smell baseline from step 3** pasted in full — the sub-agent has no other access to it.
- The brief: "Report — per file/hunk where relevant — (a) every place the diff violates a documented standard: cite the standard (file + the rule); and (b) any baseline smell you spot: name it and quote the hunk. Distinguish hard violations from judgement calls — documented-standard breaches can be hard, but baseline smells are always judgement calls, and a documented repo standard overrides the baseline. Skip anything tooling enforces. Under 400 words."

**Spec sub-agent prompt** — include:

- The diff command and commit list.
- The path or fetched contents of the spec.
- The brief: "Report: (a) requirements the spec asked for that are missing or partial; (b) behaviour in the diff that wasn't asked for (scope creep); (c) requirements that look implemented but where the implementation looks wrong. Quote the spec line for each finding. Under 400 words."

If the spec is missing, skip the Spec sub-agent and note this in the final report.

### 5. Aggregate

Present the two reports under `## Standards` and `## Spec` headings, verbatim or lightly cleaned. Do **not** merge or rerank findings — the two axes are deliberately separate (see _Why two axes_).

End with a one-line summary: total findings per axis, and the worst issue _within each axis_ (if any). Don't pick a single winner across axes — that's the reranking the separation exists to prevent.

### 6. Publish and hand off

Before publishing, confirm `git rev-parse HEAD` still equals `<reviewed-head>`. If it changed, stop and restart against a newly handed-off range; do not publish a review of a moving target.

Publish the two-axis report to the durable review surface selected above.

Route findings deliberately:

- a small finding within the current Issue's scope stays on the review artifact;
- independent corrective work gets its own Issue only when it has a distinct outcome and acceptance conditions;
- every corrective Issue receives `kind:corrective`, the Workstream label and marker, links to the review and source implementation artifact, and Project registration only when active or on the immediate frontier;
- do not create one corrective Issue per comment when several findings share one coherent fix.

Then run `/workstream-tracking` with operation `handoff`:

- no blocking findings → transition to `integration` or complete the source artifact as appropriate;
- blocking findings → transition to `correction`, naming the first corrective artifact and next operator;
- no specification available → preserve that limitation in the handoff rather than silently treating the Spec axis as passed.

Keep the Workstream root open while further implementation, correction, review, or integration remains.

## Why two axes

A change can pass one axis and fail the other:

- Code that follows every standard but implements the wrong thing → **Standards pass, Spec fail.**
- Code that does exactly what the issue asked but breaks the project's conventions → **Spec pass, Standards fail.**

Reporting them separately stops one axis from masking the other.
