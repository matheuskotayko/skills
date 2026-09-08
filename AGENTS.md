# skills — agent instructions

Personal collection of installable Agent Skills (`npx skills add matheusgmello/skills`). What
this repo is, the full skill catalog, and attribution: [README.md](README.md) — this file is
operational rules for anyone (human or agent) adding to or editing a skill here, not a duplicate
of the catalog.

## Structure

```
skills/<name>/
  SKILL.md        required — frontmatter (name + description only) + thin body
  REFERENCE.md     optional — bulk content: tables, recipes, templates
  scripts/         optional — zero-dependency Node scripts the skill runs
```

Flat repo, one skill per directory. No monorepo packages, no nested `AGENTS.md` needed.

## House style for a skill

- **Frontmatter**: `name` (kebab-case, matches the directory) and `description` only. Description
  in third person: first sentence what it does, second sentence "Use when [specific triggers]".
- **`SKILL.md` stays thin** — aim ~20–50 lines, hard cap 100 (see `write-a-skill`'s own rubric).
  Quick start first. Anything long — a full recipe table, a report template, a worked example —
  moves to `REFERENCE.md` with a one-line pointer left behind. Don't duplicate content between
  the two.
- **Scripts** are zero-dependency Node (ESM, `#!/usr/bin/env node`), pure functions exported for
  testing, no framework, no build step. Any script with non-trivial logic (a parser, a comparator,
  a branch) ships a `--selftest` — inline `assert` calls, no fixtures/test framework. Run it
  before every commit that touches the script.
- **Never duplicate a script two skills share.** One copy lives in `scripts/`; a variant is a
  flag or a config preset on that one script, not a second skill or a copy kept in sync by hand
  (`quality-gate --preset=lite|full` replaced an actual `quality-gate-lite` skill after the
  hand-sync cost bit once — don't repeat that).
- **One skill root, no lite/full split as separate skills.** If a skill needs a lighter mode,
  it's a flag or a config option, not a new `SKILL.md`.

## Adding or changing a skill

1. Write `skills/<name>/SKILL.md` (+ `REFERENCE.md`, `scripts/` as needed).
2. Add one row to README.md's `## Skills` table.
3. If the skill isn't fully original work, add a paragraph under README.md's `## Attribution`
   crediting the source explicitly (see `marclou-review`, `grill-while-coding`, `write-a-skill`,
   `quality-gate` for the pattern) — silence on sourcing is not acceptable here.
4. Run every touched script's `--selftest`.
5. If the skill does real work (scans a filesystem, greps a repo, calls `git`/`gh`), smoke-test
   it against a real project before committing — a passing selftest alone doesn't prove the tool
   behaves on real input.

## Privacy — never publish private data

This repo is public and installable by anyone. Never commit a user's real project names,
metrics, client names, salary figures, tokens, or keys into a skill, its `REFERENCE.md`, or a
worked example — examples are anonymized/fictional (see `profile-me`). A skill that needs the
user's real facts as input reads them from the user's own private, gitignored file; it never
ships them inside the skill. If private material ever lands in this repo, `.gitignore` it
immediately and confirm with `git status` / `git check-ignore` before any commit.

## Verification

No build or test suite for the repo itself — plain Markdown plus a handful of zero-dependency
scripts. Verify a change by:

- `node skills/<name>/scripts/<script>.mjs --selftest` for every script touched.
- A real-project smoke test when the script touches real behavior (filesystem, git, network
  tools) — not selftest alone.
- `git status` clean before committing, nothing staged beyond the intended skill/README edit.

## Don't

- Add a "lite" or duplicate skill when a flag/config preset on the existing one does the job.
- Duplicate a script between two skill directories.
- Put a real name, company, client, or metric into a published skill or example.
- Add commit-message or PR conventions here — already governed globally in the user's own
  `~/.claude/CLAUDE.md`; don't restate or drift from it here.
