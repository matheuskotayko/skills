#!/usr/bin/env node
// lint-skills.mjs — enforces the AGENTS.md house rules on every skills/<name>/. Zero deps.
// Usage: node scripts/lint-skills.mjs [--selftest]. Exit 1 on any problem.
import assert from "node:assert";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

export const MAX_LINES = 120;

// Pure: problems for one skill. `readme` is the full README text.
export function lintSkill(name, skillMd, readme) {
  const out = [];
  const m = skillMd.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) return [`${name}: missing frontmatter`];
  const keys = [...m[1].matchAll(/^([A-Za-z_-]+):/gm)].map((x) => x[1]);
  if (keys.join() !== "name,description") out.push(`${name}: frontmatter must be exactly name + description (got ${keys.join(",") || "none"})`);
  const fm = (k) => (m[1].match(new RegExp(`^${k}:\\s*(.+)$`, "m")) || [])[1]?.trim();
  if (fm("name") !== name) out.push(`${name}: frontmatter name "${fm("name")}" != directory`);
  if (!/\bUse when\b/.test(fm("description") || "")) out.push(`${name}: description needs a "Use when ..." sentence`);
  const lines = skillMd.trimEnd().split("\n").length;
  if (lines > MAX_LINES) out.push(`${name}: SKILL.md is ${lines} lines (cap ${MAX_LINES}) — move bulk to REFERENCE.md`);
  if (!readme.includes(`](skills/${name}/SKILL.md)`)) out.push(`${name}: no row in README ## Skills table`);
  const attr = readme.split(/^## Attribution\s*$/m)[1] || "";
  if (!attr.includes(`\`${name}\``)) out.push(`${name}: no paragraph in README ## Attribution`);
  return out;
}

function lintRepo(root = ".") {
  const readme = readFileSync(join(root, "README.md"), "utf8");
  const dir = join(root, "skills");
  return readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory()).flatMap((d) => {
    const p = join(dir, d.name, "SKILL.md");
    return existsSync(p) ? lintSkill(d.name, readFileSync(p, "utf8"), readme) : [`${d.name}: missing SKILL.md`];
  });
}

function selftest() {
  const ok = "---\nname: x\ndescription: Does a thing. Use when asked.\n---\n# X\n";
  const readme = "| [x](skills/x/SKILL.md) | d |\n## Attribution\n\n`x` is original.\n";
  assert.deepEqual(lintSkill("x", ok, readme), []);
  assert.ok(lintSkill("y", ok, readme).some((p) => p.includes("!= directory")));
  assert.ok(lintSkill("x", ok.replace("name: x", "name: x\nextra: 1"), readme).some((p) => p.includes("exactly name + description")));
  assert.ok(lintSkill("x", ok.replace(" Use when asked.", ""), readme).some((p) => p.includes("Use when")));
  assert.ok(lintSkill("x", ok + "l\n".repeat(MAX_LINES), readme).some((p) => p.includes("cap")));
  assert.ok(lintSkill("x", ok, "## Attribution\n").length === 2, "missing README row and attribution");
  assert.ok(lintSkill("x", "# no frontmatter", readme)[0].includes("frontmatter"));
  console.log("selftest OK");
}

if (process.argv[2] === "--selftest") selftest();
else if (process.argv[1]?.endsWith("lint-skills.mjs")) {
  const problems = lintRepo();
  problems.forEach((p) => console.error("✗ " + p));
  console.log(problems.length ? `${problems.length} problem(s)` : "all skills OK");
  process.exit(problems.length ? 1 : 0);
}
