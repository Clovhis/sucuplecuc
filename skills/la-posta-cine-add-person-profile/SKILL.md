---
name: la-posta-cine-add-person-profile
description: Add or update a Cine Posta person profile with verified facts, an original AI-written Rioplatense editorial biography, and the repository publication safeguards. Use for dedicated actor, director, or filmmaker profile work.
---

# la-posta-cine-add-person-profile

Use `src/data/people.json` for factual cache and `src/data/personProfiles.ts` for extended profiles. Read only the target profile and its row in `docs/person-profile-catalog-reference.md`; do not scan unrelated filmography or movie files.

- Preserve `biography` only as contamination evidence. Public text is exclusively `editorialBiography`; never render, search, summarize, translate, paraphrase, or use legacy biography text as a draft.
- Research with a compact evidence ledger from official biographies, award bodies, reputable references, or direct interviews. Write two original paragraphs (normally 100–150 words) in Rioplatense Spanish. It must be AI-written from scratch for that person, factual, specific, and not template-shaped or source-derived.
- Keep roles vocabulary stable; connect `knownFor` to existing movie slugs; preserve verified nationality, dates, local compact portrait, profile hero, awards, and visible `referenceUrls`. Do not hand-build directory cards, filters, counts, credits, or URLs.
- Start new/uncertain profiles as `pending`; only complete, source-reviewed original work can be `approved`. Pending/informational remains navigable but must stay noindex, out of sitemap, and ad-free.

Run the canonical full-corpus checks because originality is comparative:

```bash
npm run audit:profiles --all
npm run audit:profile-originality
npm run build
npm run audit:profiles --all -- --require-dist
npm run audit:profile-originality -- --require-dist
```

When directory data changed, also run `npx playwright test tests/e2e/person-index.spec.ts --project=desktop-chromium`. Report slug, status, compact source URLs, validations, and unresolved factual gaps.
