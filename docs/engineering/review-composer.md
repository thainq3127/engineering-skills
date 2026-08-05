Quickstart:

```bash
npx skills add thainq3127/engineering-skills --skill=review-composer
```

```bash
npx skills update review-composer
```

[Source](https://github.com/thainq3127/engineering-skills/tree/main/skills/engineering/review-composer)

## What it does

`review-composer` turns one large frozen implementation range into a bounded review swarm with exact child prompts, delegated leases, native hierarchy, and proven coverage.

It stops after launch. The composer does not synthesize findings, issue a verdict, create corrective work, or hand off an implementer; completed children move to [review-synthesizer](https://aihero.dev/skills-review-synthesizer).

## When to reach for it

Type `/review-composer`, or the agent reaches for it automatically when a cumulative review spans several tickets, domains, a large diff, cross-cutting seams, or a multi-ticket correction range.

Use [code-review](https://aihero.dev/skills-code-review) directly for one focused Pull Request, one implementation ticket, or one narrow domain slice. Use `review-composer` when one review context would miss interactions or duplicated full-scope reviews would waste context.

## Prerequisites

Run [setup-matt-pocock-skills](https://aihero.dev/skills-setup-matt-pocock-skills) first. The repository must define its Workstream root, Project, native sub-issue support, labels, and operator profiles. ChatGPT Web is the default operator and requires `@devspace` plus connected `@github` MCP.

## Composition

The leading idea is **composition**. The skill freezes a fixed point and reviewed HEAD, copies the user-confirmed Delivery Context from the controlling spec, maps source tickets and requirements onto bounded slice-and-axis children, creates one Review Composer parent under the Workstream root, and proves coverage with a matrix.

Each child receives a self-contained prompt, frozen Delivery Context, and delegated lease. Reviewers still report technical findings exhaustively, but they do not turn severity into delivery priority. The composer does not ask you to confirm the context again; missing or contradictory context routes back to the spec instead. It publishes a launch list, records synthesis-ready conditions, then stops.

## It's working if

- every source ticket and applicable requirement has a named reviewer or explicit exclusion;
- the parent contains the confirmed Delivery Context snapshot and its source spec;
- cross-domain seams have Secondary coverage only where useful;
- no child receives a duplicate full-batch assignment;
- every child has an exact prompt and delegated lease;
- the parent tracks progress through native sub-issues;
- the final handoff names Review Synthesizer after all required children complete.

## Where it fits

`review-composer` is the swarm construction step:

```txt
implement → review-composer → delegated code-review → review-synthesizer → correction, diagnosis, verification, or integration
```

Its closest neighbours are [implement](https://aihero.dev/skills-implement), which freezes the cumulative range, [code-review](https://aihero.dev/skills-code-review), whose delegated workers inspect each child, and [review-synthesizer](https://aihero.dev/skills-review-synthesizer), which evaluates completed review evidence. [ask-matt](https://aihero.dev/skills-ask-matt) routes among them.

