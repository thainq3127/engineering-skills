---
"mattpocock-skills": patch
---

Make review marker validation robust to GitHub transports that sanitize HTML comments.

Review Composer now emits visible protocol lines alongside hidden markers. Code Review and Workstream Tracking verify exact marker identity through a visible line or a raw-preserving repository-scoped Issue search before reporting a missing-marker stop condition.
