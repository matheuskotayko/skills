---
name: project-readme
description: Write or rewrite a project's README in a professional structure (hook, why, how it works, quick start, everyday use, docs, license), choosing only the sections the project has evidence for, so it fits any stack or size. Use when the user wants a README created, improved, made more professional, restructured, or says the current README looks bad or amateur.
---

# Project README

One structure, adapted to the project. A section goes in only if the repo backs it. A CLI gets
no screenshots, and a weekend library gets no "Teams" section. Every command in the README must
actually run.

## Workflow

1. **Collect facts.** Run the script from the project root:
   ```bash
   node <skill-dir>/scripts/readme-facts.mjs           # writes readme-facts.json
   ```
   It reports manifests and package manager, run scripts, binaries, license, git remote, latest
   tag, monorepo workspaces, CI workflows, Docker, `docs/`, community files, images, and the existing README's
   headings. Then read the code entry points yourself. The script gives facts, not the pitch.
2. **Classify the project.** Library, CLI, app/service, framework or plugin, monorepo, or
   collection/docs. The type decides which sections lead. See [REFERENCE.md](REFERENCE.md)
   § Project types.
3. **Pick sections.** Walk the catalog in [REFERENCE.md](REFERENCE.md) § Section catalog. Each
   section has an *include when* rule. No evidence, no section. Never write a placeholder
   ("Coming soon", "TODO", an empty table).
4. **Write the hook first.** One or two sentences: what it is, for whom, and the concrete
   payoff. Then 3–5 "why" bullets, each with a bold claim and one sentence of proof from the code.
5. **Write the rest** in catalog order. Short paragraphs. Tables for comparisons and matrices.
   Code blocks only for commands someone will run.
6. **Verify.** Run every install and quick-start command you wrote, or say plainly which ones
   you couldn't. Check every relative link and badge URL. Make sure nothing in the README claims
   a feature the code lacks.
7. **Keep what is real.** When rewriting, keep the existing README's true content: attribution,
   install quirks, warnings. Restructure it. Don't drop it.

## Rules

- **Evidence over adjectives.** "Starts in 40 ms (benchmark in `bench/`)" beats "blazing fast".
  No number without a source.
- **Badges only for facts that exist:** CI workflow, published version, license file, runtime
  version. No vanity badges.
- **Quick start fits in one screen.** Longer setups move to `docs/` with a pointer.
- **Match the project's language.** A Portuguese project gets a Portuguese README unless the
  user says otherwise.
- **Never invent:** a logo, a website, a benchmark, a user count, a roadmap.

Section catalog, per-type layouts, badge recipes, and the final checklist: [REFERENCE.md](REFERENCE.md).
