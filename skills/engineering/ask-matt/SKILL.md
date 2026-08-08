---
name: ask-matt
description: Ask which skill or flow fits your situation. A router over the skills in this repo.
disable-model-invocation: true
---

# Ask Matt

You don't remember every skill, so ask.

A **flow** is a path through the skills. Most paths run along one **main flow**, and two **on-ramps** merge onto it. Everything else is standalone, or a vocabulary layer that runs underneath.

## The main flow: idea → ship

The route most work travels. You have an idea and want it built.

0. **Need a new durable Workstream first?** Run **`/workstream-bootstrap` in Codex** from the configured bootstrap checkout. It confirms the durable objective and completion conditions, provisions the root Issue, branch, worktree, and Project item, then emits the ChatGPT Project instructions. Skip it for a one-ticket change or when the Workstream already exists.

1. **`/grill-with-docs`** — sharpen the idea by interview. Start here when you **have a codebase**: it's stateful, retaining what it learns in `CONTEXT.md` and ADRs. (No codebase? Use `/grill-me` — see Standalone. Both run the same `/grilling` primitive; `grill-with-docs` is the one that leaves a paper trail.)
2. **Branch — can you settle every question in conversation?** If a question needs a runnable answer (state, business logic, a UI you have to see), detour through a prototype, bridged by **`/handoff`** in both directions (see Crossing sessions):
   - **`/handoff`** out, then open a fresh session against that file,
   - **`/prototype`** to answer the question with throwaway code,
   - **`/handoff`** back what you learned, and reference it from the original idea thread.
3. **Branch — is this a multi-session build?**
   - **Yes** → **`/to-spec`** (turn the thread into a spec and confirm its Delivery Context plus testing seams), then **`/to-tickets`** to split it into tracer-bullet tickets, each declaring its **blocking edges**. On a local tracker that's one file per ticket under `.scratch/<feature>/issues/`, worked blockers-first by hand; on a real tracker the edges become native blocking links, so any ticket whose blockers are done can be grabbed — kick off **`/implement`** per ticket, **clearing context between each one**. When Workstreams are enabled, the whole chain stays attached to one root issue, one persistent local worktree, and one branch.
   - **No** → **`/implement`** right here, in the same context window.

   Either way, **`/implement`** builds each issue by driving **`/tdd`** internally — one red-green slice at a time — verifies and commits the bounded change, then hands off a frozen range. A focused single-ticket or single-domain range goes to **`/code-review`**. A cumulative range spanning several tickets, several domains, a large diff, or cross-cutting seams goes to **`/review-composer`**, which freezes the spec's confirmed Delivery Context, creates bounded child reviews, and launches delegated reviewers. When every required child is complete, **`/review-synthesizer`** uses that context to propose finding dispositions, pauses for human approval of the finding treatment, then creates coherent follow-up work and hands off the execution frontier. It does not ask you to approve the product direction a second time unless the frozen context is missing or contradictory. The same operator may continue into focused review only after the handoff; swarm review transfers to ChatGPT Web. `/workstream-tracking` runs underneath all four: it claims the shared worktree, pins the range, registers the active artifacts, and writes durable handoffs between operators. Reach for **`/tdd`** on its own when you just want to build a concrete behaviour test-first without a full spec.

### Context hygiene

Keep steps 1–3 in **one unbroken context window** — don't compact or clear until after `/to-tickets` — so the grilling, spec, and tickets all build on the same thinking. Each `/implement` then starts fresh, working from the ticket.

Durable state does not wait for the end of that window. In a tracked Workstream, `/grill-with-docs` and `/wayfinder` checkpoint each human-confirmed decision and the exact next open question to their active Issue before continuing. `/setup-matt-pocock-skills` also commits the repository setup before `/workstream-bootstrap` creates a new worktree from the base branch.

The limit on this is the **[smart zone](https://www.aihero.dev/ai-coding-dictionary/smart-zone)**: the window (~120k tokens on state-of-the-art models) within which the model still reasons sharply. If a session approaches it before `/to-tickets`, don't push on degraded — `/handoff` and continue in a fresh thread.

## Control plane underneath

**`/workstream-tracking`** is the model-invoked protocol beneath the engineering flows. It is not another destination in the router. It keeps one durable Workstream aligned across:

- one canonical GitHub root issue;
- one persistent local worktree and branch;
- the currently active Issue or Pull Request;
- GitHub Projects v2 operational state;
- cooperative claims and durable handoffs between ChatGPT Web, Codex, and humans.

`grill-with-docs`, `to-spec`, `to-tickets`, `implement`, `review-composer`, `review-synthesizer`, `code-review`, `diagnosing-bugs`, `triage`, and `wayfinder` invoke it at their own lifecycle boundaries. Model-invoked writer disciplines such as `prototype`, `tdd`, `domain-modeling`, `research`, and `resolving-merge-conflicts` inherit the caller's claim or claim before standalone writes. Worktrees, branches, commits, and chat sessions never become tracking Issues.

`workstream-bootstrap` is the user-invoked entry before that lifecycle. It calls `ensure` from the configured bootstrap checkout, creates the durable identity, leaves it unassigned, and stops after producing the ChatGPT Project handoff.

## Review routing

- **Focused PR, focused single-ticket review, or one narrow domain slice** → `/code-review` in focused mode.
- **Large cumulative review, multi-ticket correction range, multi-domain review, or cross-cutting implementation batch** → `/review-composer`.
- **A child Issue under a Review Composer** → `/code-review` in delegated worker mode, bounded by the child lease.
- **A Review Composer whose required children are complete** → `/review-synthesizer`.
- **A defect whose cause is still unclear** → `/diagnosing-bugs`, not a speculative corrective ticket.

The composer owns topology, the frozen Delivery Context, prompts, leases, coverage, and launch. Delegated reviewers write only to assigned child Issues. The synthesizer owns stable finding IDs, product-aware dispositions, the human evaluation gate, final verdict, deferred ledger, Workstream transition, and corrective, diagnosis, or verification ticket creation.

## Workstream entry routing

- **Repository not configured for tracker, Workstreams, or operators** → `/setup-matt-pocock-skills`.
- **New durable multi-session objective with no Workstream yet** → run `/workstream-bootstrap` in Codex from the configured bootstrap checkout.
- **Existing Workstream** → resolve its latest handoff and continue with the named next skill; do not bootstrap another root because the chat changed.
- **One bounded ticket or small bug** → use the ordinary Issue flow without creating a Workstream.

## On-ramps

A starting situation that generates work, then merges onto the main flow.

- **Bugs and requests piling up** → **`/triage`**. It moves issues through triage roles and produces agent-ready issues, which **`/implement`** later picks up.

  Triage is only for issues **you didn't create** — bug reports, incoming feature requests, anything that arrives raw. Tickets that `/to-tickets` produced are already agent-ready, so **don't triage them**.

- **Something's broken** → **`/diagnosing-bugs`**. For the hard ones: the bug that resists a first glance, the intermittent flake, the regression that crept in between two known-good states. It refuses to theorise until it has a **tight feedback loop** — one command that already goes red on *this* bug — then fixes with a regression test. Its post-mortem hands off to **`/improve-codebase-architecture`** when the real finding is that there's no good seam to lock the bug down.

- **A huge, foggy effort — a greenfield project or a huge feature build, too big for one session** → **`/wayfinder`**, the most cognitively demanding flow here. When the way from here to the destination isn't visible yet, it charts a **shared map** of **decision tickets** on the issue tracker and resolves them one at a time — producing **decisions, not deliverables** — until the fog is pushed back and the way is clear. Where **`/grill-with-docs`** sharpens an idea you can hold in one session, wayfinder is for the idea you can't — and it's slower and denser, so save it for exactly that, never a well-scoped feature.

  When the map clears, **it hands off, it doesn't build**: merge onto the main flow at **`/to-spec`**, which collapses the map's linked decisions into a buildable plan, then `/to-tickets` and `/implement` as usual. Looping the map straight into `/implement` skips that collapse and throws the linked detail away — go straight to `/implement` only when the effort turned out genuinely small.

## Codebase health

Not feature work — upkeep.

- **`/improve-codebase-architecture`** — run whenever you have a spare moment to keep the codebase good for agents to operate in. It surfaces **deepening opportunities**; picking one _generates an idea_ you can take into the main flow at `/grill-with-docs`. It's the survey that finds the candidates; **`/codebase-design`** (below) is the bench you design the chosen one on.

## Vocabulary underneath

Two model-invoked references that run *beneath* the other skills — each the single source of truth for its vocabulary. Reach for them directly when the **words**, not the process, are the problem; or let the skills above pull them in.

- **`/domain-modeling`** — sharpen the project's *domain* language: challenge a fuzzy term, resolve an overloaded word ("account" doing three jobs), record a hard-to-reverse decision as an ADR. It's the active discipline `/grill-with-docs` drives to keep `CONTEXT.md` a clean glossary.
- **`/codebase-design`** — the deep-module vocabulary (module, interface, depth, seam, adapter, leverage, locality) for designing a module's *shape*: a lot of behaviour behind a small interface at a clean seam. `/tdd` and `/improve-codebase-architecture` both speak it.

## Crossing sessions

- **`/handoff`** — when a thread is full or you need to branch off (e.g. into a `/prototype` session), this compacts the conversation into a markdown file. You don't continue in place — you **open a new session and reference that file** to carry the context across. It's the bridge between context windows, in either direction. Use it when you want a **fresh session** but need the **current conversation preserved**.
- **`/compact`** (built-in) — stay in the **same conversation**, letting the earlier turns be summarized. Use it at **intentional breaks between phases**, when you don't mind losing the verbatim history. Don't compact mid-phase — the agent can lose its way. `/handoff` forks; `/compact` continues.

## Standalone

Off the main flow entirely.

- **`/grill-me`** — the same relentless interview as `/grill-with-docs`, but for when you have **no codebase**. Stateless: it saves nothing locally, builds no `CONTEXT.md`. Reach for it to sharpen any plan or design that doesn't live in a repo.
- **`/prototype`** — a small, throwaway program that answers one design question: does this state model feel right, or what should this UI look like. Throwaway from day one — keep the answer, delete the code. It's the detour in step 2 of the main flow, but reach for it any time a design question is hard to settle on paper.
- **`/research`** — delegate reading legwork to a **background agent**: it investigates a question against **primary sources**, then leaves a cited Markdown file in the repo. Keep working while it reads. The file it produces is something to take *into* the main flow at `/grill-with-docs` — research feeds the thinking, it doesn't replace it.
- **`/teach`** — learn a concept over multiple sessions, using the current directory as a stateful workspace.
- **`/writing-great-skills`** — reference for writing and editing skills well.

## Precondition

**`/setup-matt-pocock-skills`** — run before your first engineering flow to configure tracker access, the Workstream Project and worktree layout, triage labels, and domain docs. Custom issue trackers also work.
