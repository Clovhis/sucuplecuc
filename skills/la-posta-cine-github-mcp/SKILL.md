---
name: la-posta-cine-github-mcp
description: Use GitHub MCP as the compact default GitHub interface for Clovhis/sucuplecuc. Trigger for repo PRs, issues, reviews, comments, installations, or small validated text-only publishes when MCP can answer directly without verbose shell or browser workflows.
---

# la-posta-cine-github-mcp

Defaults: `Clovhis/sucuplecuc`, owner `Clovhis`, branch `main`. Do not ask for these unless the user changes them.

Use GitHub MCP first for PR/issue/review/comment/install reads and writes. Use `mcp__github__.push_files` only for an atomic change to one/few final plain-text files after local validation and targeted diff inspection. Read those final files from disk and push only the intended paths.

Use local `git`/`gh` instead for branch creation, history-aware staging, deletions/renames, binary assets, multi-file refactors, or any worktree containing unrelated edits. Avoid doing the same lookup through MCP, web, and shell; report the MCP result directly and keep diffs summarized.
