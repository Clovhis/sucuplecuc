---
name: la-posta-cine-full-site-fix
description: Execute a full La Posta Cine bug and editorial repair pass on a fresh fix branch. Use for confirmed site-wide data, copy, or code issues; preserve the canonical `cinepostaScore` 1–10 contract, audit first, change the smallest safe surface, and validate the result.
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

Use the JSON audit as the index. Open and edit only files tied to confirmed findings; fix structural integrity, then data, then high-confidence editorial issues, then polish. `cinepostaScore` is the only persisted rating source: require an integer from 1 to 10 for a valued movie, derive its canonical label, leave intentionally unranked movies without a score, and reject `verdict`, `verdictLabel`, `absoluteCinema`, or custom score-label fields. Public-score normalization and its confidence ceiling come first; then apply the editorial masterpiece ceiling. A 9 (`Obra maestra`) requires exceptional title-specific achievement and durable cinematic recognition; 10 (`Absolute Cinema`) is reserved for a very small pinnacle tier. Popularity, franchise reputation, a high public score, or review adjectives alone never qualify. If a full-catalog task concerns high scores, freeze and review every movie currently at 9 or 10, document the per-title decision and references, and lower non-masterpieces to at most 8; a masterpiece that does not meet the narrower 10 standard becomes 9. Keep public-source confidence and editorial eligibility as separate findings, with no provenance fields in movie JSON. Do not turn external source text into published copy: every repaired synopsis, review, and profile biography must be AI-written from scratch for that record, with no copied/translated/close-paraphrased or reusable template wording.

Re-audit after each batch. Finish with `npx astro check`, `npm run build`, and `git diff --stat`; run `npm run playwright:verify` plus `npm run test:e2e` if browser-facing code or public output behavior changed. Report branch, findings, exact fixes, remaining blockers, and validations.
