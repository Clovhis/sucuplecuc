---
name: la-posta-cine-poster-repair
description: Repair, audit, or investigate broken La Posta Cine movie posters. Use when a poster fails to load, appears wrong, or recurring external image failures need a fast, identity-safe catalog sweep; do not use for ordinary movie loads.
---

# La Posta Cine Poster Repair

Repair only confirmed poster defects in `C:\WebsitePeliculas`. Keep the fix narrow: movie JSON `poster` fields plus legitimately regenerated catalogs. The existing site-wide runtime fallback is a contingency, never evidence that a broken source is acceptable.

## Fast triage

- Start from the reported title, but when a user reports a broken poster or asks for poster maintenance, audit the complete catalog. External URLs fail independently and a one-title patch leaves the same incident elsewhere.
- Use the repository verifier; it follows redirects and validates HTTP, MIME type, raster dimensions and portrait orientation:

  ```powershell
  node skills/la-posta-cine-auditor/scripts/verify_posters.cjs --all --timeout-ms 15000 --retries 2 --per-host-concurrency 2 --global-concurrency 8 --host-spacing-ms 200
  ```

- Treat `poster-http`, invalid URL/content type/image, and horizontal-image results as repair candidates. Treat `429`, 5xx, timeouts and network errors as external warnings: retry the exact candidate once with the same bounded settings before changing data. Do not mass-replace URLs on warnings.
- Preserve an explicit candidate manifest from the verifier. It is the only list used for edits and final validation; do not expand scope to pre-existing editorial, trailer, people, or low-resolution warnings.

## Select a replacement

For each confirmed failure, verify the movie identity before editing: title, release year, edition and artwork must agree with a canonical film page and visual inspection. A reachable image, a matching filename, or Spanish text alone is insufficient.

- Prefer durable, direct portrait artwork from a stable source already acceptable to the catalog. Favor official distributor/studio assets or the established TMDB image CDN when the image is exact; use JustWatch only as a last resort because its poster URLs are comparatively volatile.
- Never use a backdrop, banner, logo, thumbnail, actor photo, or a poster from a remake/release with the same title. Keep neutral/original art if Argentine localization cannot be established safely.
- Edit only the `poster` value. Do not use a poster repair to rewrite title, people, platform, taxonomy, copy, trailer, or any unrelated metadata.

## Required proof

After each repair batch, rerun the verifier against every manifest path:

```powershell
node skills/la-posta-cine-auditor/scripts/verify_posters.cjs --candidate <path> --candidate <path>
npm run validate:content
git diff --check
```

Build and inspect each affected compiled movie route in desktop and mobile Playwright. Scroll the poster into view and prove `complete`, `naturalWidth > 0`, `naturalHeight > naturalWidth`, and the expected `currentSrc` (or its verified final redirect). The fallback script may exist in the document, but it must not be the rendered result for a repaired poster.

Keep hard repair results separate from inherited warnings. Report the total audited, confirmed failures, transient warnings retained, exact changed paths, source identity evidence, verifier totals and browser totals.

## Branches and publication

Follow the user's requested branch and publication scope. Do not push, publish, or modify deployment workflows unless explicitly authorized. If publication is authorized, preserve unrelated work, commit only the validated poster scope, prove the remote SHA and successful deploy, verify the live affected route, then return the checkout to a clean synchronized `main` without deleting unknown files.
