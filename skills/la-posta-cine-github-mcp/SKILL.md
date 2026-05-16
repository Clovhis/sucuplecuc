---
name: la-posta-cine-github-mcp
description: Use GitHub MCP as the default GitHub surface for Clovhis/sucuplecuc. Trigger this skill when Codex is working in this repo and needs token-efficient GitHub operations such as checking PRs, issues, review threads, installations, comments, reactions, or pushing a small validated text-only change set to `main` or another branch without relying on verbose shell workflows.
---

# la-posta-cine-github-mcp

Use GitHub MCP first for GitHub work in this project.

Keep this skill small in practice: use the MCP tool that directly answers the request, avoid extra repo narration, and fall back to `gh` only when MCP cannot do the job safely.

## Repo defaults

- Repository: `Clovhis/sucuplecuc`
- Owner: `Clovhis`
- Repo: `sucuplecuc`
- Default branch: `main`
- Do not ask the user for these values unless they explicitly say they changed.

## Tool policy

Prefer this order:

1. `mcp__codex_apps__github` for repository/PR/issue/comment/review reads and writes
2. `mcp__github__.push_files` for small text-file commits
3. local `git` or `gh` only when MCP does not cover the operation or when the change shape makes MCP unsafe

Do not browse GitHub in the web browser if MCP already covers the request.

## MCP tool map

Use `mcp__codex_apps__github` for:

- reading PR metadata and diffs
- listing changed files on a PR
- fetching PR discussion or review threads
- adding or updating PR comments
- replying to inline review comments
- adding reviews
- listing installations or installed accounts

Use `mcp__github__.push_files` for:

- pushing one or a few text files after local validation
- direct `main` pushes only when the user explicitly wants that and the diff is small and safe
- small branch commits when a shell-based git push would add noise without adding safety

## When `push_files` is allowed

Use `push_files` only if all of these are true:

- every target file is plain text
- there are no deletions or renames in the intended change
- the final contents are already correct in the local workspace
- the commit can be described as one clear atomic change
- no target file includes unrelated edits that you do not want to publish

Before `push_files`:

- run the relevant local validation first
- read the final file contents from disk, not from memory
- push only the exact files needed for the task
- use a short imperative commit message

Do not use `push_files` for:

- binary assets
- large multi-file refactors
- changes that depend on git history inspection or selective staging
- situations where the file also contains user changes you should not publish
- delete or rename operations

If any of those apply, use local `git` or `gh`.

## Safe push workflow

For a normal MCP-first publish flow:

1. Validate locally
2. Inspect `git diff --stat` or specific file diffs so the scope is explicit
3. Read the final file contents from disk
4. Call `mcp__github__.push_files`
5. Confirm branch and commit message in the final response

If the user asked for `main`, push to `main`. Otherwise prefer the current task branch or a fresh feature branch.

## Token discipline

- Keep GitHub operations terse and repo-scoped.
- Do not dump large diffs or repeat metadata the MCP call already resolved.
- When the user asks a GitHub question, answer from MCP output directly instead of re-checking the same thing with shell commands.
- Avoid mixing MCP, web, and `gh` for the same simple lookup.

## Fallbacks

Use local `gh` or `git` when you need:

- deletion or rename commits
- branch creation or rebasing workflows not covered by MCP
- non-text assets
- full worktree-aware operations where the commit should include many local edits exactly as staged

If the repo copy of this skill and the installed global copy diverge, treat the repo copy as the source of truth and sync it to `$CODEX_HOME/skills/la-posta-cine-github-mcp` before relying on it in later sessions.
