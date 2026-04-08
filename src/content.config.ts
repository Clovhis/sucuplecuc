/**
 * Astro 6 looks for `src/content.config.*` when a project evolves toward
 * content collections. This site currently stores movies in `src/data/` and
 * does not register any collections yet, so we keep the registry explicit and
 * empty instead of relying on implicit startup behavior.
 */

export const collections = {};
