# Project README — reference

## Section catalog

Order is the default reading order. Each row says when it belongs. `facts.*` refers to
`readme-facts.json`.

| # | Section | Include when | What goes in it |
|---|---|---|---|
| 1 | **Title + logo** | Always a title. Logo only if `facts.images` has one. | `<h1 align="center">` or `<picture>` for light and dark logos. Never generate a logo. |
| 2 | **Hook** | Always | A `>` quote of 1–2 sentences: what it is, for whom, and the concrete payoff. A scenario beats a feature list ("Quit X mid-task, open Y, continue"). |
| 3 | **Badges** | One per real fact | CI (`facts.ci`), version or release (`facts.latestTag`, registry), license (`facts.license`), runtime (`engines`, toolchain file). Max ~5. |
| 4 | **Why** | Always, sized to the project | 3–5 bullets. Each has a **bold claim** and one sentence of proof. For a tiny tool, 2 bullets is fine. |
| 5 | **How it works** | Non-trivial flow (pipeline, client/server, plugin hooks) | A small ASCII diagram plus one paragraph. Link the architecture doc if `facts.docsDir` has one. |
| 6 | **Features / Catalog** | Several distinct capabilities, commands, or packages | A table: name, one line each. For a monorepo or collection, list the packages or items. |
| 7 | **Support matrix** | Runs on several OSes, runtimes, or integrations that CI actually checks | A table of Area and Status. Only list what's tested. Mark the rest "experimental" or omit it. |
| 8 | **Comparison** ("Coming from X?") | There are well-known alternatives *and* a real difference | A table of Coming from, What's similar, What you gain. Be honest. Never trash a competitor. |
| 9 | **Quick start** | Always | The shortest path to a first success. Install and first run, one block per platform if needed. |
| 10 | **Everyday use / Usage** | Always (library: API example, CLI: commands, app: workflows) | Real tasks as bullets or short code: "Ask/run X to get Y". |
| 11 | **Configuration** | Env vars or a config file exist | A table of Key, Default, and Meaning. Mark the required ones. Never real secrets. |
| 12 | **Deployment** | App or service with Docker or deploy files | A minimal production recipe and a pointer to `docs/` for the rest. |
| 13 | **Security** | Handles auth, secrets, or network exposure, or `SECURITY.md` exists | Threat-model summary in a few bullets and how to report a vulnerability. |
| 14 | **Architecture / Project layout** | Contributors need a map (multi-module, non-obvious layout) | A directory tree with one comment per folder. |
| 15 | **Docs** | `facts.docsDir` is non-empty | Links grouped "For users" and "For contributors". |
| 16 | **Contributing** | Accepts contributions, or `CONTRIBUTING.md` / `AGENTS.md` exists | How to run tests and lint before a PR. Link the file and don't duplicate it. |
| 17 | **Changelog / Releases** | `CHANGELOG.md` or tags exist | One line with a link. |
| 18 | **License** | `facts.license` | "MIT. See [LICENSE](LICENSE)." If none, tell the user. Don't pick one for them. |
| 19 | **Acknowledgements / Attribution** | Built on someone's idea, code, or design | Credit by name and link. Keep any credits the old README had. |

Order may shift by type (below). The hook, Quick start, and License never drop.

## Project types

| Type | Signals | Lead with | Usually skip |
|---|---|---|---|
| **Library** | manifest with no `bin`, exports | Hook, install, a 10-line usage example, API link | Deployment, support matrix (unless multi-runtime) |
| **CLI** | `bin`, `[[bin]]`, `cmd/` | Hook, install, a demo command with its output, command table | Architecture (unless large) |
| **App / service** | `dev`/`start` scripts, Dockerfile, env config | Hook, screenshot (if `facts.images`), quick start, configuration, deployment | API usage |
| **Framework / plugin** | peer deps, hooks, extension API | Hook, how it works diagram, minimal plugin example | Comparison, unless asked |
| **Monorepo** | workspaces, several manifests | Hook, package table, getting started per package | Per-package detail (link each package's README) |
| **Collection / docs** | no manifest, many items in folders | Hook, catalog table, install, examples | Configuration, deployment |
| **Course / academic** | exercises, slides, report | Context (course, term), how to run, authors | Badges, comparison |

## Badge recipes (shields.io)

Only add a badge when its target exists.

```markdown
[![CI](https://github.com/OWNER/REPO/actions/workflows/FILE.yml/badge.svg)](https://github.com/OWNER/REPO/actions/workflows/FILE.yml)
[![Release](https://img.shields.io/github/v/release/OWNER/REPO)](https://github.com/OWNER/REPO/releases/latest)
[![npm](https://img.shields.io/npm/v/PKG)](https://www.npmjs.com/package/PKG)
[![crates.io](https://img.shields.io/crates/v/CRATE)](https://crates.io/crates/CRATE)
[![PyPI](https://img.shields.io/pypi/v/PKG)](https://pypi.org/project/PKG/)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Node](https://img.shields.io/badge/node-18+-blue)](package.json)
```

`OWNER/REPO` comes from `facts.remote.slug`. For a non-GitHub host, use that host's
pipeline-badge URL or skip the badge. Registry badges only make sense when the package is
actually published.

## Writing the hook

- Name the reader and the payoff: "Long-term memory for AI coding agents", not "A powerful,
  flexible memory solution".
- One concrete scenario is worth three adjectives.
- If you can't say what it does in one sentence from the code, ask the user. Don't guess.

## Anti-patterns

- Sections with nothing in them ("Roadmap: TBD", "Screenshots coming soon").
- An install command that was never run, or one for a registry the package isn't on.
- A wall of badges, emoji headings, or "⭐ star this repo" banners.
- Duplicating `CONTRIBUTING.md`, `docs/`, or the changelog inline. Link them instead.
- Marketing superlatives ("blazing", "revolutionary", "best-in-class").
- Long code blocks in Quick start. If it needs more than one screen, it's a guide in `docs/`.
- Deleting the old README's attribution or warnings while restructuring.

## Final checklist

- [ ] The hook says what, for whom, and the payoff in two sentences or fewer.
- [ ] Every section passed its *include when* rule. No placeholders.
- [ ] Every command was run, or is marked as not verified.
- [ ] Every relative link resolves (`ls` the target). Every badge points at something that exists.
- [ ] Nothing in the README claims a feature or number the repo can't back.
- [ ] License stated, or its absence reported to the user.
- [ ] Credits from the old README preserved.
- [ ] Written in the project's language.
