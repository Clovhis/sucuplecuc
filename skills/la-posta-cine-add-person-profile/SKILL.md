---
name: la-posta-cine-add-person-profile
description: Add or update a Cine Posta person profile with identity-safe sourcing, a verified portrait, an original Rioplatense editorial biography, and the repository publication safeguards. Use for dedicated actor, director, or filmmaker profile work.
---

# la-posta-cine-add-person-profile

Use `src/data/people.json` for factual cache and `src/data/personProfiles.ts` for extended profiles. Read only the target profile and its row in `docs/person-profile-catalog-reference.md`; do not scan unrelated filmography or movie files.

- Preserve `biography` only as contamination evidence. Public text is exclusively `editorialBiography`; never render, search, summarize, translate, paraphrase, or use legacy biography text as a draft.
- Research with a compact evidence ledger from official biographies, award bodies, reputable references, or direct interviews. Write exactly two original paragraphs of 70–150 words total in Rioplatense Spanish. It must be AI-written from scratch for that person, factual, specific, and not template-shaped or source-derived.
- Verify identity with at least two independent signals before saving an IMDb/Wikidata/TMDb identifier: exact name plus filmography, nationality, date, official agency/production credit, or another disambiguator. Do not trust the first search result for a homonymous person.
- Inspect every new portrait visually. It must show the credited person clearly; reject posters, logos, stills, placeholders and ambiguous group photos. A cropped event/production portrait is allowed only when the source identifies the person and the crop is unambiguous. Do not create a dedicated public profile for an incidental minor merely because the person appears in a movie credit.
- Keep roles vocabulary stable; connect `knownFor` to existing movie slugs; preserve verified nationality, dates, local compact portrait, profile hero, awards, and visible `referenceUrls`. Do not hand-build directory cards, filters, counts, credits, or URLs.
- Treat missing public birth data as an explicit factual gap, never as a reason to invent a date. Missing identity, nationality, traceable reference or portrait blocks approval.
- Start new/uncertain profiles as `pending`; only complete, source-reviewed original work can be `approved`. Pending/informational remains navigable but must stay noindex, out of sitemap, and ad-free.

The legacy `biography` array must remain at least three paragraphs and 2508 normalized characters when a profile is approved; it is historical contamination evidence, not public copy. Before closing, run the source audit first so a short or contaminated profile fails before an expensive build.

Run the canonical full-corpus checks because originality is comparative:

```bash
npm run audit:profiles --all
npm run audit:profile-originality
npm run build
npm run audit:profiles --all -- --require-dist
npm run audit:profile-originality -- --require-dist
npm run validate:public-output
npm run validate:sitemap-indexability
```

When directory data changed, also run `npx playwright test tests/e2e/person-index.spec.ts --project=desktop-chromium`. If a movie load introduced the person, run the candidate movie auditor and `npm run audit:movie-people` too. Report slug, status, compact source URLs, validations, and unresolved factual gaps; do not call a profile complete while any hard identity/portrait gate remains open.
