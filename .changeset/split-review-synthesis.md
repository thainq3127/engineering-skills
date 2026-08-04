---
"mattpocock-skills": minor
---

Split cumulative review orchestration into two explicit roles.

- `review-composer` now freezes the range, creates the native review hierarchy, writes delegated prompts and leases, proves coverage, launches reviewers, and stops.
- New `review-synthesizer` collects completed child evidence, assigns stable finding IDs, pauses for human evaluation, materializes approved corrective, diagnosis, or verification work, preserves deferred findings, and hands off one exact execution frontier.
- Add the Review Synthesizer skill, router guidance, Workstream ownership rules, docs, and semantic validation.
