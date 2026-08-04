# ChatGPT Web GPT packages

This directory packages six Phase 1 engineering roles as version-controlled GPT instructions:

- Matt
- Engineering Planner
- Wayfinder
- Code Reviewer
- Review Composer
- Triage Operator

The packages make role activation explicit instead of depending on automatic skill discovery. Generated instructions contain the executable boundaries and workflow. Canonical skill files remain the maintenance sources recorded in `manifest.json`.

## Generate and check

Run:

    npm run generate:gpts
    npm run check:gpts

`generate:gpts` rewrites `gpts/generated/*.instructions.md` deterministically. `check:gpts` fails when a generated file has drifted from its shared and role sources. `npm run validate` includes the same drift check plus semantic boundary checks.

Validation also enforces an internal 8,000-byte portability budget per instruction file. This is a repository design budget, not a claim about a documented GPT Builder hard limit.

## Create the GPTs

For each entry in `manifest.json`:

1. create a GPT with the listed display name;
2. paste the matching file from `gpts/generated/` into its instructions;
3. enable the connected `@devspace` and `@github` apps;
4. do not add Actions that duplicate those apps;
5. keep implementation, diagnosis, correction, and integration routed to Codex;
6. run the scenarios in `smoke-tests.md` before using the GPT on active work.

The GPT Builder configuration itself is intentionally manual. This repository owns the instruction source and validation, not the remote GPT identity.

## Configure a ChatGPT Project

Start from `project/instructions.template.md`. A Project records stable repository, workspace, Workstream, and routing identity. It must not cache dynamic Git or workflow state.

Open a normal chat inside the Project before invoking a GPT by name so the conversation remains attached to the Project context.

## Source layout

- `shared/` contains policies reused across roles.
- `roles/` contains the unique authority and workflow of each GPT.
- `generated/` contains complete instructions ready for GPT Builder.
- `manifest.json` declares composition, canonical skills, and output paths.
- `project/` contains the routing-only Project template.
- `smoke-tests.md` contains the manual acceptance suite.

Do not edit generated files directly. Change a shared or role source, regenerate, validate, and review the generated diff.
