Quickstart:

```bash
npx skills add thainq3127/engineering-skills --skill=review-composer
```

```bash
npx skills update review-composer
```

[Source](https://github.com/thainq3127/engineering-skills/tree/main/skills/engineering/review-composer)

## What it does

`review-composer` turns one large frozen implementation range into a bounded review swarm, then turns the completed child reviews back into one deduplicated verdict and correction frontier.

It does not ask one reviewer to swallow a multi-ticket, multi-domain batch whole. The composer owns the map, coverage, native Issue hierarchy, synthesis, and follow-up routing; delegated `/code-review` workers own only their assigned slice and axis.

## When to reach for it

Type `/review-composer`, or the agent reaches for it automatically when a cumulative review spans several tickets, several domains, a large diff, cross-cutting seams, or a multi-ticket correction range.

Use [code-review](https://aihero.dev/skills-code-review) directly for one small Pull Request, one implementation ticket, or one narrow domain slice. Use `review-composer` when a single review context would either miss interactions or duplicate a full-scope pass across several reviewers.

## Prerequisites

Run [setup-matt-pocock-skills](https://aihero.dev/skills-setup-matt-pocock-skills) first. The repository must define its Workstream root, Project, native sub-issue support, labels, and operator execution profiles. ChatGPT Web is the default operator and requires `@devspace` plus connected `@github` MCP; missing native hierarchy mutation is a stop condition.

## Compose, then synthesize

The leading idea is **composition**. In the first phase the skill freezes the fixed point and reviewed HEAD, maps source tickets and requirements to bounded slice/axis children, creates one Review Composer parent under the Workstream root, and proves coverage with a matrix. Review children sit under that parent, carry self-contained prompts and delegated leases, and stay out of the Project unless blocked.

In the second phase the composer verifies the frozen range again, reads every completed child, resolves disagreements, and deduplicates by root cause rather than wording. It alone publishes the parent verdict and creates coherent corrective or diagnosis Issues. Those follow-up Issues return to the Workstream root instead of becoming grandchildren under the review.

## Delegated leases

A delegated reviewer receives one child Issue, one frozen range, one slice, one axis, and one allowed write surface. The worker may inspect code but may write only to that child Issue. It cannot modify local files, Project state, the Workstream root, the parent verdict, or follow-up tickets. This bounded lease is what makes parallel review safe without creating several competing Workstream writers.

## It's working if

- every source ticket and applicable requirement has a named Primary reviewer;
- cross-domain seams have a Secondary reviewer only where it adds independent coverage;
- no child is assigned a duplicate full-batch review;
- the parent tracks progress through native sub-issues;
- findings are deduplicated into correction boundaries rather than copied one comment at a time;
- corrective and diagnosis Issues are direct children of the Workstream root, never children of the composer.

## Where it fits

`review-composer` is the swarm-review step in the extended build chain:

```txt
wayfinder → grill-with-docs → to-spec → to-tickets → implement → review-composer → delegated code-review → synthesis → correction or verification → integration
```

Its closest neighbours are [implement](https://aihero.dev/skills-implement), which freezes and hands off the cumulative range, [code-review](https://aihero.dev/skills-code-review), whose delegated workers inspect the children, and [workstream-tracking](https://aihero.dev/skills-workstream-tracking), which holds the composer claim and bounded leases. [ask-matt](https://aihero.dev/skills-ask-matt) routes between focused and swarm review.
