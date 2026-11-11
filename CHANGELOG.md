# Changelog

Notable changes to this repo, newest first. The repo is versioned as a whole with
[SemVer](https://semver.org) git tags, and skills are not versioned individually. A major
version means a skill was renamed or removed, or a script's config or output changed
incompatibly. A minor version means a new skill or feature. A patch version means a fix.

## [Unreleased]

## [1.0.0] - 2026-11-11

First tagged release. Everything below is included.

### Changed
- Renamed skills to descriptive names: `marclou-review` became `landing-review`, `pentest-me` became `self-pentest`, `brag-me` became `brag-doc`, `profile-me` became `career-profile`, and `organize-agent-context` became `agent-context`. Reinstall with the new names.
- `SKILL.md` line cap raised from 100 to 120.
- README restructured around why, how it works, and everyday use.
- `agent-context`: the `CLAUDE.md` pointer is now optional, since Claude Code reads `AGENTS.md` natively when no `CLAUDE.md` exists.

### Added
- `quality-gate`:
  - `tolerances` noise bands for coverage and duplication.
  - Multi-module coverage and lint reports.
  - `securityBlockLevel: "high"`.
  - `duplicationFormats` and `duplicationIgnore`.
  - `osv-gate.mjs`, a vulnerability gate for any stack.
  - `oxlint-report.mjs`.
  - A rewritten CI workflow.
- `scripts/lint-skills.mjs` enforces the house rules. CI runs it and every script's `--selftest`.
- MIT license.

### Removed
- `grill-while-coding` skill.
- `write-a-skill` skill. Its standard now lives in `AGENTS.md`.
- Root `CLAUDE.md` pointer. Claude Code reads `AGENTS.md` directly.

## Before 1.0.0

### 2026-10

**Added**
- `agent-context`: numbered invariants with what guarantees each one, task-to-doc routing, an upkeep protocol, and a pruning step.

**Fixed**
- `agent-context`: audit block hung under zsh on empty results.

### 2026-09

**Added**
- `agent-context` skill.
- `AGENTS.md` as the canonical agent instruction file.

**Fixed**
- `career-profile`: channel count, an interview script, and the rule for unsourced numbers.

**Changed**
- GitHub username is now `matheuskotayko`.

### 2026-08

**Added**
- `quality-gate`:
  - Cyclomatic complexity and circular dependency metrics.
  - Mutation score.
  - Benchmark metric with a symmetric tolerance band.
  - Baseline/Current/Δ PR summary table.
  - `--preset=lite|full`, which replaced the separate `quality-gate-lite` skill.
- `self-pentest`: attack-surface mapper script, six more vectors (12 total), and a static-audit mode.
- `secret-scan` skill.
- `brag-doc` skill.
- `career-profile` skill.

### 2026-07

**Added**
- `landing-review` skill.
- `self-pentest` skill.
- `quality-gate` skill.
- `write-a-skill` and `grill-while-coding` skills (since removed).

[Unreleased]: https://github.com/matheuskotayko/skills/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/matheuskotayko/skills/releases/tag/v1.0.0
