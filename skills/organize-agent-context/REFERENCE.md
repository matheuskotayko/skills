# Organize agent context — reference

## Claude Code loading mechanics

Confirmed against the Claude Code memory docs. These drive the layout.

- Claude Code loads `CLAUDE.md` and `CLAUDE.local.md` from the working directory and **every
  directory above it**, concatenated root-first. It does **not** read `AGENTS.md`.
- `CLAUDE.md` in a **subdirectory** loads *on demand* — when the agent reads a file in that
  subtree, not at launch. So a monorepo's `packages/api/CLAUDE.md` only costs context while
  working in `packages/api/`.
- `@path/to/file` **imports**: expanded into context at launch alongside the file that references
  them. Relative paths resolve against the *importing* file, not the cwd. Parsing skips Markdown
  code spans and fenced blocks — so `` `@Valid` `` in backticks is safe, a bare `@Valid` is not
  (it tries to import `./Valid`). Max import depth 4.
- Block-level HTML comments (`<!-- ... -->`) are **stripped before** the content enters context.
  Use them for maintainer notes that shouldn't cost tokens. (They stay visible when a human opens
  the file, or when the agent Reads it directly.)
- Target **under ~200 lines** per `CLAUDE.md`; a file over 4 MiB is skipped entirely. Shorter =
  better adherence.
- `.claude/rules/*.md` with `paths:` frontmatter — instructions scoped to a glob, loaded only
  when the agent opens a matching file. A Claude-only alternative to a `docs/` split for
  "only matters when touching X" guidance. Rules **without** `paths:` load every session like
  `.claude/CLAUDE.md`.
- Survives `/compact`: the root `CLAUDE.md` is re-read from disk; nested `CLAUDE.md` and
  path-scoped rules reload when the agent next touches a matching file.

## The pointer file

Prefer the import so Windows contributors are covered:

```markdown
@AGENTS.md

# Claude Code

Read and follow `AGENTS.md`. This repo keeps one canonical agent instruction file per directory —
Claude Code, Codex, Cursor, Gemini, OpenCode all read it. Don't duplicate rules here; edit
`AGENTS.md` (or the matching `docs/*.md`).
```

Symlink (`ln -s AGENTS.md CLAUDE.md`) also works but breaks on native Windows checkouts and can't
carry Claude-specific lines. The `@AGENTS.md` line still expands the file into context, so the prose
below it is a reinforcement for the agent and a signpost for humans, not a duplicate.

## Splitting by altitude

The test for every section of a bloated canonical file: **would the agent need this on every
task in this directory?**

| Stays in `AGENTS.md` | Moves to `docs/<topic>.md` |
|---|---|
| "`core` module is framework-free" | *why* that boundary exists, the bug that motivated it |
| "every list endpoint is paginated, never returns a bare array" | the full pagination implementation walk |
| exception → HTTP status table (short, load-bearing every handler change) | the auth method table, per-role capability matrix |
| build / test commands | build troubleshooting, "the migration failed in prod" runbook |
| "codes are generated server-side, stored without separators" | the per-entity code format table |
| pointers to the `docs/` files | per-feature deep-dives (file upload, audit log, status flow) |

Leave a one-line pointer where content moved: `` Auth: `AuthService` centralizes checks — table in [docs/authz.md](docs/authz.md). ``

## Skills

**Project skill vs personal skill.**
- *Project skill* — genuinely part of this repo's machinery (a quality gate the CI runs, a
  repo-specific review checklist). Versioned in the repo.
- *Personal skill* — reusable across projects, a style or workflow preference (caveman, ponytail,
  a house design skill). Stays **out** of the repo: a Claude Code plugin, `~/.claude/skills/`, or
  a personal skills repo installed per machine. Its *output* that matters to the project (a
  `DESIGN.md` it generated) is committed as plain markdown; the generator is not.

**One skill root.** `.claude/skills/` — Claude Code reads it natively. A parallel
`.agents/skills/` bridged by symlinks adds indirection and nothing reads it natively (not Codex,
not Gemini). Drop it unless a second tool genuinely consumes that path. For Codex/Gemini a
`SKILL.md` is just markdown you point at in the conversation — same in either location.

**Real dirs, not symlinks.** One directory per skill under `.claude/skills/<name>/`, containing
`SKILL.md` (+ `REFERENCE.md`, `scripts/` as needed).

**Never bundle a script copy.** If a skill runs a script that the repo also runs (CI, a hook),
the script lives once in `scripts/` and the `SKILL.md` points at it (`../../../scripts/x.mjs`).
Two copies drift — the "which one wins" rule is the smell that proves it already happened. If the
skill is a local fork of an upstream skill's script, say so in the script header and note the
patch to re-apply on sync.

**`.gitignore`.** Version `.claude/skills/`. Ignore only the local noise: `.claude/worktrees`,
`.claude/settings.local.json`.

## Worked before / after (monorepo)

```
BEFORE                                   AFTER
CLAUDE.md            (823 lines, real)    CLAUDE.md            @AGENTS.md + prose (7 lines)
AGENTS.md            (123, stale, drift)  AGENTS.md            canonical, ~90 lines
                                          docs/
                                            architecture.md   modules, persistence, pagination, CORS
                                            authz.md          role table, 401 vs 403, test layers
                                            domain.md         entity table, business codes
                                            <feature>.md      one per deep feature
                                            build-troubleshoot.md  traps + prod runbooks
frontend/AGENTS.md   (fine, 110)          frontend/CLAUDE.md   @AGENTS.md (new)
                                          frontend/AGENTS.md   unchanged
.agents/skills/qg/   + symlink + forked   .claude/skills/qg/   SKILL.md + REFERENCE.md
scripts/qg.mjs         script copy          scripts/qg.mjs     one copy, provenance header
```

Net: the same knowledge, redistributed by altitude; the stale duplicate's content discarded; one
script instead of two; `.gitignore` shorter.

## Templates (optional)

A `.github/pull_request_template.md` is worth adding if the team wants consistent PR descriptions.
Adapt, don't copy: swap the verification commands for the repo's real ones, and drop sections that
don't apply (semver "release impact", "CHANGELOG merge gate") unless the project actually versions
releases. Same for `ISSUE_TEMPLATE/` — match the project's domain (environments, user roles).
