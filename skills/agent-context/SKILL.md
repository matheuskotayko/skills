---
name: agent-context
description: Reorganize a repo's AI-agent instruction files into a canonical layout — one AGENTS.md per directory as the single source of truth, deep topic docs split under docs/, and project skills consolidated in .claude/skills/, plus an optional CLAUDE.md pointer only where Claude Code needs one — then makes the canonical file actionable (numbered invariants with what guarantees them, a task-to-doc routing table, an upkeep protocol) and prunes stale context agents would read as current. Use when a CLAUDE.md or AGENTS.md is bloated, duplicated, or drifted out of sync, when setting up agent instructions for a repo or monorepo, or when the user mentions organizing, splitting, or cleaning up AI context, CLAUDE.md, or AGENTS.md.
---

# Organize agent context

One source of truth per directory, optional thin pointers where a tool needs one, deep detail split out and loaded
on demand. Works for a single repo or a monorepo.

## Target layout

| File | Role |
|---|---|
| `AGENTS.md` (per directory) | **Canonical.** Read natively by Codex, Cursor, the Copilot coding agent and Claude Code (v2.1.277+, only when no `CLAUDE.md` exists); Gemini CLI and other Copilot surfaces need a pointer. Only what applies to *every* task: stack, structure, invariant rules, pointers. Aim under ~200 lines. |
| `CLAUDE.md` (per directory) | **Optional** thin pointer: `@AGENTS.md` + one line "don't add rules here, edit AGENTS.md". Claude Code reads `AGENTS.md` directly only when no `CLAUDE.md` exists above the cwd; once one exists it reads that and ignores a bare `AGENTS.md`. Keep the pointer only if a `CLAUDE.md` is already there or someone runs an older/restricted Claude Code. |
| `GEMINI.md`, `.github/copilot-instructions.md` | Same thin pointer, only for tools the team actually uses. Gemini CLI reads `GEMINI.md` unless `context.fileName` is configured. Never a second copy of the rules. |
| `<pkg>/docs/*.md` | One file per topic — the *why* and *how*. Reference, loaded on demand, linked from `AGENTS.md`. Split here only when `AGENTS.md` outgrows ~200 lines. |
| `.claude/skills/<name>/` | Project skills, one real dir each, versioned. |

Monorepo: root `AGENTS.md` (overview + team + repo map + cross-cutting rules) plus one `AGENTS.md`
per package. Nested `CLAUDE.md` files load on demand when the agent touches that directory.

## Workflow

1. **Recon.** Run the audit block below. List every instruction file with its line count, and any
   `CLAUDE.md`/`AGENTS.md` pair that has drifted.
2. **Pick canonical.** `AGENTS.md` per directory. If both a `CLAUDE.md` and `AGENTS.md` hold real
   content, the fuller / more current one wins → it *becomes* `AGENTS.md`; the stale one is discarded.
3. **Split by altitude.** Walk the canonical file top to bottom. For each section:
   - a rule that applies every task (short "always / never X") → **stays** in `AGENTS.md`
   - narrative, a lookup table, a runbook, a per-feature deep-dive → **moves** to
     `<pkg>/docs/<topic>.md` with a one-line pointer left behind. Rule stays, explanation moves.
   - verify facts against the code as you go — stale canonical files lie; recover anything real
     that no file documents.
   - history in running text ("added in v39", "used to be…", "phase 4") → **out**; git keeps it.
     A *why* that still drives decisions stays as a short **Why** block.
4. **Shape the canonical file.** Numbered invariants, each with **Guaranteed by** (a test, the
   compiler/lint, or review only); a **Read before…** table routing each kind of task to its doc;
   a **Keeping context current** section; a standard header on every `docs/*.md`. Formats and
   examples: [REFERENCE.md](REFERENCE.md) § Shaping the canonical file.
5. **Prune what reads as current but isn't.** A doc site duplicating `docs/`, specs of delivered
   features, loose review/notes files, code comments pointing at a pointer file. Move anything still
   true into the canonical place, then delete. See [REFERENCE.md](REFERENCE.md) § Pruning.
6. **Write the pointers — only where needed.** If a `CLAUDE.md` holds nothing but the old rules, delete
   it once its content is in `AGENTS.md`. Keep or write one when it must stay (it has Claude-only
   lines, or someone's Claude Code is pre-2.1.277 / can't read `AGENTS.md` directly): `@AGENTS.md` +
   the "don't duplicate" line. Use the `@import`, not a symlink, on native Windows. Same pointer for `GEMINI.md`
   / `copilot-instructions.md` when those tools are in use — see [REFERENCE.md](REFERENCE.md) § Other tools.
7. **Consolidate skills.** One skill root: `.claude/skills/`. See [REFERENCE.md](REFERENCE.md) § Skills.
8. **Verify.** New Claude Code session → `/context` lists the files under **Memory files**. Re-run
   the audit block: no dangling pointers, no stray `@token` imports in `AGENTS.md`, no broken
   relative links, and every test/class/endpoint named in an invariant found by `grep`.

## Audit block

```bash
# every agent instruction file + size, smallest first
# -r on xargs (skip the command on empty input): with none found, plain `xargs wc -l`
# runs `wc -l` with no file arg and hangs reading stdin — exactly the fresh-repo case this skill targets.
find . \( -name CLAUDE.md -o -name AGENTS.md -o -name .cursorrules -o -name copilot-instructions.md \) \
  -not -path '*/node_modules/*' -print0 | xargs -0 -r wc -l | sort -n
# drift: diff each CLAUDE.md against its sibling AGENTS.md
# stray @imports in AGENTS.md that Claude Code would try to load (bare @word, not in backticks)
# same empty-input guard (-r): grep with zero file args reads stdin and hangs. -print0/xargs, not
# an unquoted $files: zsh doesn't word-split it and hands grep one long, nonexistent file name.
find . -name AGENTS.md -not -path '*/node_modules/*' -print0 \
  | xargs -0 -r grep -nE '(^|[[:space:]])@[A-Za-z]' | grep -vE '`@' || true
```

## Don't

- Add `SECURITY.md` unless the repo is public with outside vulnerability reporters.
- Add `CHANGELOG.md` unless the project cuts versioned releases.
- Split `docs/` preemptively — only split a file already over ~200 lines.
- Copy a PR/issue template verbatim — adapt it to the repo's real verification commands, drop
  sections that don't apply (semver, changelog-gate).
- Bundle a copy of a script inside a skill — the script lives in `scripts/`, the `SKILL.md` points
  at it.

Claude Code loading mechanics, skill consolidation detail, and a worked before/after: [REFERENCE.md](REFERENCE.md).
