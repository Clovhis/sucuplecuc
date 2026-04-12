---
name: la-posta-cine-full-site-fix
description: Execute a full La Posta Cine bug hunt plus editorial cleanup across the whole repo. Use when Codex must review the entire site for bugs, broken data, weak copy, malformed synopses, low-quality reviews, or badly written actor/director profiles, then fix those issues immediately on a fresh `fix/*` branch created from `main`.
---

# la-posta-cine-full-site-fix

Run a full-site QA and editorial repair pass for this repo.

This skill is not report-only. If it finds a clear issue, fix it in the same run, then revalidate.

## Non-negotiables

- Never work directly on `main`.
- Always start from a fresh `fix/*` branch created from `main`.
- If the worktree is dirty before branch prep, stop and ask the user how to handle it. Do not stash or discard changes on your own.
- Always run the bundled full-site auditor first.
- Always finish with `npx astro check` and `npm run build`.

## Branch prep

When the tree is clean:

```bash
git fetch origin main
git switch main
git pull --ff-only origin main
git switch -c fix/<short-topic>-<yyyymmdd>
```

If you are already on a fresh `fix/*` branch created from the current `main` for the same task, keep using it.

## Primary audit command

Run:

```bash
node skills/la-posta-cine-full-site-fix/scripts/full_site_audit.cjs
```

Use JSON output when you need to summarize or diff findings programmatically:

```bash
node skills/la-posta-cine-full-site-fix/scripts/full_site_audit.cjs --format json
```

The bundled auditor combines:

- full movie audit through `skills/la-posta-cine-auditor/scripts/audit_recent_movies.cjs --all --skip-youtube`
- full exclusive-profile audit through `skills/la-posta-cine-add-person-profile/scripts/person_profile_audit.cjs --all`
- extra editorial heuristics for:
  - truncated or metadata-like synopses
  - reviews that lean on external-critics wording instead of site voice
  - biographies that mention Wikipedia inside published copy
  - template-like biography filler

## Fix order

Work in this order:

1. Structural failures
2. Broken data integrity
3. Editorial errors with high confidence
4. Lower-confidence copy polish

Prefer fixing the smallest correct surface first.

## Editorial standards

### Reviews

- Keep Cine Posta voice: direct, opinionated, readable.
- Do not anchor the published review in `las resenas`, `la critica`, `consenso`, or similar meta-commentary unless it is truly essential.
- Do not mention third-party brands in published review copy.
- Replace vague reception-summary wording with an actual local verdict in the site tone.

### Synopses

- Keep them plot-facing, not critical.
- Do not start from cast metadata when a cleaner premise is possible.
- Do not leave truncated endings, dangling articles, or obvious scrape leftovers.
- Keep them concise and readable in Spanish rioplatense-neutral prose.

### Person profiles

- Never mention `Wikipedia` inside published biography paragraphs.
- Keep factual sourcing in `referenceUrls`, not inside the prose.
- Remove template filler and generic career-summary paragraphs.
- Prefer concrete biographical facts: origin, early steps, breakthrough, key works, verified awards.

## Useful helper scripts

Use these only as inputs to a manual fix, not as blind batch output you leave unchecked:

```bash
node scripts/enrich-movie-synopsis.mjs --only-bad
node scripts/generate-person-profile-editorial-overrides.mjs --slug <slug>
```

If a factual rewrite depends on external truth, verify it with trustworthy sources before editing.

## Validation loop

After each repair batch:

```bash
node skills/la-posta-cine-full-site-fix/scripts/full_site_audit.cjs
```

At the end:

```bash
npx astro check
npm run build
git diff --stat
```

If the audit still fails, continue fixing until the remaining findings are either resolved or explicitly blocked by missing source certainty.

## Output

Report:

- branch name used
- main areas audited
- concrete fixes applied
- remaining warnings, if any
- `astro check` result
- build result
