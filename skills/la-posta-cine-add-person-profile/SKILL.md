---
name: la-posta-cine-add-person-profile
description: Add or update a Cine Posta person profile with original, sourced editorial biography and the repository's publication safeguards.
---

# la-posta-cine-add-person-profile

Use this workflow to add or update a dedicated person page in this repository.

## Scope and source of truth

- `src/data/people.json` is the factual person cache.
- `src/data/personProfiles.ts` is the extended profile source.
- `biography` is historical/imported material. Preserve it if needed for traceability, but never use it to draft, render, index, or assess public editorial copy.
- `editorialBiography` is the only public biography field.
- `editorialStatus` controls publication: `approved` is indexable and may load normal advertising; `pending` and `informational` are navigable but must remain `noindex, follow`, outside the sitemap and without advertising.

Read `docs/person-profile-catalog-reference.md` and the current profile before editing. Do not modify movie reviews, trailers, or unrelated catalog content.

## Person directory integration

`/personas/` is a derived, filterable directory. A profile added to `src/data/personProfiles.ts` appears there through `getPersonProfiles()`; never add a card, filter option, search record, or result count by hand.

Future loads must keep the directory facets useful:

- Use the existing stable vocabulary in `roles`; avoid one-off synonyms that would create confusing duplicate role options.
- Keep `nationalityPrimary`, birth/death data and the best compact portrait aligned in `src/data/people.json`; nationality and age filters derive from those fields.
- Keep `knownFor` connected to real movie slugs. The directory derives film count, searchable movie titles and the card showcase from the live filmography graph.
- Keep verified award highlights in `awards`; award filtering and ordering derive from that array.
- Define an optimized `profileImage` for the profile hero while preserving the compact person image used by directory cards.
- Do not edit URL parameters or client-side filter options manually. `src/pages/personas/index.astro` and `src/scripts/person-index.ts` own the directory contract.

Pending and informational profiles remain navigable and may appear in the directory, but the existing publication policy still keeps them `noindex`, outside the sitemap and without advertising. Do not weaken that quarantine to make a profile discoverable.

## Editorial rules

For a new or revised `editorialBiography`:

- Research concrete, trustworthy sources first (official biographies, award institutions, reputable reference works and direct interviews where appropriate).
- Write two short original paragraphs in natural Rioplatense Spanish, normally 100–150 words total. Adapt the focus to the person's actual work.
- Include only facts that the cited sources support. Never invent training, awards, career links, opinions or anecdotes.
- Do not translate, summarize, paraphrase or synonym-swap `biography` or other imported copy. It is useful only as a contamination check.
- Avoid reusable skeletons, catalog/site metacommentary, vague praise and filmography lists disguised as prose.
- Include visible, specific `referenceUrls` for the material used.
- Leave a profile `pending` until factual, source and originality review is complete. Do not promote it merely because it meets a word count.

Required profile data remains `slug`, `name`, `profileImage`, `headline`, `roles`, `knownFor`, and usable factual references. Keep filmography connected through the existing catalog rather than creating credits by hand.

## Publication policy and canonical audit

There is exactly one policy: `scripts/validate-person-profile-originality.mjs`.
`skills/la-posta-cine-add-person-profile/scripts/person_profile_audit.cjs` is only a compatibility entrypoint to that canonical validator; it contains no competing editorial rules.

The canonical validator audits the complete corpus because it must detect imported fragments and cross-profile similarity:

- every profile needs a two-paragraph `editorialBiography`, visible sources and no legacy-copy leakage;
- `approved` profiles must satisfy those editorial checks and produce indexable public output;
- `pending` and `informational` profiles must remain quarantined: noindex, excluded from sitemap, no ads, and no historical biography rendered;
- no profile may expose internal preview or audit copy in production;
- high six-word n-gram similarity and repeated paragraphs block the audit.

Run:

```bash
npm run audit:profiles --all
npm run audit:profile-originality
npm run build
npm run audit:profiles --all -- --require-dist
npm run audit:profile-originality -- --require-dist
```

When a load changes data consumed by the directory, also run:

```bash
npx playwright test tests/e2e/person-index.spec.ts --project=desktop-chromium
```

`--candidate` is accepted for compatibility, but still evaluates the complete corpus so similarity and publication controls remain reliable. Do not weaken or duplicate the validator to make a batch pass.

## Before finishing

1. Confirm no `profile.biography` is rendered or used by search.
2. Confirm references are visible on the public profile.
3. Confirm `approved` entries alone are in the sitemap and indexable.
4. Confirm pending/informational pages do not load ads and have `noindex, follow`.
5. Run the complete audit and build chain above.
6. Review the diff and update the catalog reference if the profile set changed.
7. Confirm the new profile can be found in `/personas/` by name and remains correctly classified by role, nationality, age, catalog presence and awards.

Report the affected slugs, source strategy, editorial status, validation result and any factual uncertainty that leaves a profile pending.
