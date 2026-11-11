# skills

[![ci](https://github.com/matheuskotayko/skills/actions/workflows/ci.yml/badge.svg)](https://github.com/matheuskotayko/skills/actions/workflows/ci.yml)

Installable [Agent Skills](https://github.com/vercel-labs/skills) for Claude Code, Codex, Cursor, and any agent that reads the `SKILL.md` format. Each skill is a small, focused playbook. Some ship a zero-dependency Node script, so the agent runs a tested tool instead of improvising.

## Install

```bash
npx skills add matheuskotayko/skills                        # all skills
npx skills add matheuskotayko/skills --skill quality-gate   # one skill
```

## Skills

### Code quality and security

| Skill | What it does |
|---|---|
| [quality-gate](skills/quality-gate/SKILL.md) | Ratchet CI gate: a PR may add code but never regress a metric. Also includes a loop that drives the PR to green. |
| [self-pentest](skills/self-pentest/SKILL.md) | Red-teams your own app before release. It scores each attack by how many independent layers stop it, then writes fix reports and ready-to-paste issues. |
| [secret-scan](skills/secret-scan/SKILL.md) | Finds exposed keys, tokens, and passwords in the working tree and git history. It redacts every match and fails CI. |

### Agent workflow

| Skill | What it does |
|---|---|
| [agent-context](skills/agent-context/SKILL.md) | Reorganizes `AGENTS.md` / `CLAUDE.md` files into one canonical source per directory. Splits out deep docs and prunes stale context. |

### Career and product

| Skill | What it does |
|---|---|
| [brag-doc](skills/brag-doc/SKILL.md) | Turns git history, merged PRs, and metric trends into evidence-backed résumé bullets. |
| [career-profile](skills/career-profile/SKILL.md) | Writes LinkedIn, résumé, and portfolio copy from validated facts, using the X-Y-Z method. Chains with `brag-doc`. |
| [landing-review](skills/landing-review/SKILL.md) | Audits a landing page or marketing copy against Marc Lou's 31 rules for viral products. |

## Quality gate at a glance

One engine, adopted in stages. `--preset=lite` runs the base metrics and `--preset=full` runs everything.

| Stage | Metrics |
|---|---|
| Base (`lite`) | coverage, duplication, lint, large files, vulnerabilities |
| Wave 1 | cyclomatic complexity, circular dependencies |
| Wave 2 | mutation score (own CI job) |
| Wave 3 | microbenchmarks, judged against a ±10% noise band (own CI job) |
| Pass/fail | e2e, regression, `osv-gate` (vulnerabilities on any stack) |

Details, per-stack recipes, and the GitHub Actions workflow: [quality-gate/REFERENCE.md](skills/quality-gate/REFERENCE.md).

## Contributing

House rules for adding or editing a skill (structure, style, privacy, verification) live in [AGENTS.md](AGENTS.md). [CLAUDE.md](CLAUDE.md) is only a pointer to it. Before opening a PR:

```bash
node scripts/lint-skills.mjs                                  # house rules for every skill
for f in scripts/*.mjs skills/*/scripts/*.mjs; do node "$f" --selftest; done
```

CI runs both on every PR.

> **Renamed in Nov 2026.** `marclou-review` became `landing-review`, `pentest-me` became `self-pentest`, `brag-me` became `brag-doc`, `profile-me` became `career-profile`, and `organize-agent-context` became `agent-context`. Reinstall with the new names.

## Attribution

Credit where the ideas come from:

- **`quality-gate`** implements Lucas Montano's ratchet and AI-babysitting method from [Como garantir qualidade de código com IA](https://youtu.be/qToBgU8K4Ms). The concept is his. The script, recipes, and CI workflow are this repo's.
- **`landing-review`** packages Marc Lou's [31 Principles of a Viral Product](https://newsletter.marclou.com/p/31-principles-of-a-viral-product) as an agent-checkable rubric.
- **`brag-doc`** automates Julia Evans' [brag document](https://jvns.ca/blog/brag-documents/) idea.
- **`career-profile`** uses Laszlo Bock's X-Y-Z bullet formula, plus common LinkedIn practice, distilled.
- **`self-pentest`**, **`secret-scan`**, and **`agent-context`** are original work. `secret-scan` follows the spirit of gitleaks and trufflehog. `agent-context` builds on Claude Code's documented memory loading, and this repo's own `AGENTS.md` was written with it.
- The skill-writing standard in [AGENTS.md](AGENTS.md) is adapted from Matt Pocock's [`write-a-skill`](https://github.com/mattpocock/skills/blob/main/skills/productivity/write-a-skill/SKILL.md).
