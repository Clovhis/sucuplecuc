---
name: la-posta-cine-full-site-fix
description: Execute a full La Posta Cine bug and editorial repair pass on a fresh fix branch. Use when the user asks to find and correct confirmed site-wide data, copy, or code issues; audit first, change the smallest safe surface, and validate the result.
---

# la-posta-cine-full-site-fix

Never work on `main`. If the tree is dirty before branch creation, ask how to proceed; never stash or discard work.

```bash
git fetch origin main
git switch main
git pull --ff-only origin main
git switch -c fix/<short-topic>-<yyyymmdd>
node skills/la-posta-cine-full-site-fix/scripts/full_site_audit.cjs --format json
```

Use the JSON audit as the index. Open and edit only files tied to confirmed findings; fix structural integrity, then data, then high-confidence editorial issues, then polish. Do not turn external source text into published copy: every repaired synopsis, review, and profile biography must be AI-written from scratch for that record, with no copied/translated/close-paraphrased or reusable template wording.

Re-audit after each batch. Finish with `npx astro check`, `npm run build`, and `git diff --stat`; run `npm run playwright:verify` plus `npm run test:e2e` if browser-facing code or public output behavior changed. Report branch, findings, exact fixes, remaining blockers, and validations.
