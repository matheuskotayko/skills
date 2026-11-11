<h1 align="center">skills</h1>

> Installable playbooks for AI coding agents. Ask your agent to "set up a
> quality gate" or "pentest this before we ship", and it follows a tested
> method instead of improvising one.

[![CI](https://github.com/matheuskotayko/skills/actions/workflows/ci.yml/badge.svg)](https://github.com/matheuskotayko/skills/actions/workflows/ci.yml)
[![Agent Skills](https://img.shields.io/badge/format-Agent%20Skills-blue)](https://github.com/vercel-labs/skills)
[![Node](https://img.shields.io/badge/node-18+-blue)](#how-a-skill-is-built)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

## Why these skills

An agent asked to "check security" or "improve the résumé" will produce something. It just won't be the same thing twice, and it rarely says how sure it is. These skills pin the method down.

- **They measure, not just advise.** `quality-gate`, `secret-scan`, and `self-pentest` ship zero-dependency Node scripts with self-tests. The agent runs a tool that exits non-zero, and doesn't decide by feel.
- **They don't invent facts.** `brag-doc` and `career-profile` pull every claim from git history, merged PRs, or a fact you confirmed. A number with no source gets flagged, not written.
- **They work in any agent.** Claude Code, Codex, Cursor, and anything that reads the `SKILL.md` format. Install once, use everywhere.
- **They stay small.** Each `SKILL.md` is a short playbook. Tables, recipes, and templates load only when the agent needs them.

## How it works

```
you ask ──▶ agent matches ──▶ loads SKILL.md ──▶ runs scripts/ ──▶ report
"is this     the skill's       (short playbook;   (tested tool,     + next
 safe to     "Use when"        REFERENCE.md on    exit code         steps
 ship?"      description       demand)            decides)
```

The agent picks a skill from its description, reads the short `SKILL.md`, and pulls in `REFERENCE.md` only for the step it is on. Where a script exists, the script's result decides, not the model's opinion.

## Skills

| Area | Skill | What it does |
|---|---|---|
| Quality | [quality-gate](skills/quality-gate/SKILL.md) | Ratchet CI gate: a PR may add code but never regress a metric. Also includes a loop that drives the PR to green. |
| Security | [self-pentest](skills/self-pentest/SKILL.md) | Red-teams your own app before release. It scores each attack by how many independent layers stop it, then writes fix reports and ready-to-paste issues. |
| Security | [secret-scan](skills/secret-scan/SKILL.md) | Finds exposed keys, tokens, and passwords in the working tree and git history. It redacts every match and fails CI. |
| Agents | [agent-context](skills/agent-context/SKILL.md) | Reorganizes `AGENTS.md` / `CLAUDE.md` into one canonical source per directory. Splits out deep docs and prunes stale context. |
| Career | [brag-doc](skills/brag-doc/SKILL.md) | Turns git history, merged PRs, and metric trends into evidence-backed résumé bullets. |
| Career | [career-profile](skills/career-profile/SKILL.md) | Writes LinkedIn, résumé, and portfolio copy from validated facts, using the X-Y-Z method. Chains with `brag-doc`. |
| Docs | [project-readme](skills/project-readme/SKILL.md) | Writes or rewrites a project's README in a professional structure, including only the sections the repo has evidence for. Fits any stack. |
| Product | [landing-review](skills/landing-review/SKILL.md) | Audits a landing page or marketing copy against Marc Lou's 31 rules for viral products. |

## Quick start

```bash
npx skills add matheuskotayko/skills                        # every skill
npx skills add matheuskotayko/skills --skill quality-gate   # just one
```

Then ask your agent in plain words. The skill loads on its own.

> **Renamed in Nov 2026.** `marclou-review` became `landing-review`, `pentest-me` became `self-pentest`, `brag-me` became `brag-doc`, `profile-me` became `career-profile`, and `organize-agent-context` became `agent-context`. Reinstall with the new names.

## Everyday use

- "Set up a quality gate for this repo." The agent writes the config and `baseline.json` and adds the GitHub Actions workflow.
- "Babysit this PR until it's green." The agent fixes the code, never the baseline.
- "Are we safe to ship?" or "pentest the API." You get a depth score per attack vector and a fix report.
- "Did we ever commit a key?" `secret-scan --git` sweeps the full history, with every match redacted.
- "Our `CLAUDE.md` is 800 lines, clean it up." The agent splits it by altitude, leaves one canonical `AGENTS.md`, and prunes the rest.
- "What did I ship on this project?" and then "turn it into my LinkedIn." `brag-doc` harvests the facts and `career-profile` writes them per channel.
- "Review this landing page." The page is checked rule by rule, and each fix is concrete.

### Quality gate stages

One engine, adopted as the project matures. `--preset=lite` runs the base metrics and `--preset=full` runs everything.

| Stage | Metrics |
|---|---|
| Base (`lite`) | coverage, duplication, lint, large files, vulnerabilities |
| Wave 1 | cyclomatic complexity, circular dependencies |
| Wave 2 | mutation score (own CI job) |
| Wave 3 | microbenchmarks, judged against a ±10% noise band (own CI job) |
| Pass/fail | e2e, regression, `osv-gate` (vulnerabilities on any stack) |

Per-stack recipes and the full workflow: [quality-gate/REFERENCE.md](skills/quality-gate/REFERENCE.md).

## How a skill is built

```
skills/<name>/
  SKILL.md        frontmatter (name + description) + short playbook, max 120 lines
  REFERENCE.md    tables, recipes, templates, loaded on demand
  scripts/        zero-dependency Node (18+), each with --selftest
scripts/
  lint-skills.mjs checks every skill against the house rules
```

## Contributing

House rules for adding or editing a skill (structure, style, privacy, verification) live in [AGENTS.md](AGENTS.md). Before opening a PR:

```bash
node scripts/lint-skills.mjs
for f in scripts/*.mjs skills/*/scripts/*.mjs; do node "$f" --selftest; done
```

CI runs both on every push and PR.

## Attribution

- **`quality-gate`** implements Lucas Montano's ratchet and AI-babysitting method from [Como garantir qualidade de código com IA](https://youtu.be/qToBgU8K4Ms). The concept is his. The script, recipes, and CI workflow are this repo's.
- **`landing-review`** packages Marc Lou's [31 Principles of a Viral Product](https://newsletter.marclou.com/p/31-principles-of-a-viral-product) as an agent-checkable rubric.
- **`brag-doc`** automates Julia Evans' [brag document](https://jvns.ca/blog/brag-documents/) idea.
- **`career-profile`** uses Laszlo Bock's X-Y-Z bullet formula, plus common LinkedIn practice, distilled.
- **`project-readme`** takes its section structure from the README of [akitaonrails/ai-memory](https://github.com/akitaonrails/ai-memory), generalized for any project. The fact collector and the include-when rules are this repo's.
- **`self-pentest`**, **`secret-scan`**, and **`agent-context`** are original work. `secret-scan` follows the spirit of gitleaks and trufflehog. `agent-context` builds on Claude Code's documented memory loading, and this repo's own `AGENTS.md` was written with it.
- The skill-writing standard in [AGENTS.md](AGENTS.md) is adapted from Matt Pocock's [`write-a-skill`](https://github.com/mattpocock/skills/blob/main/skills/productivity/write-a-skill/SKILL.md).

## License

MIT. See [LICENSE](LICENSE). Changes are tracked in [CHANGELOG.md](CHANGELOG.md).

## Acknowledgements

Built collaboratively with Claude Code.
