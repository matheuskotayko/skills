#!/usr/bin/env node
// readme-facts.mjs — collect verifiable facts about a project for writing its README.
// Zero dependencies, Node >= 18, ESM. Evidence, not prose: every field comes from a file
// or from git. A fact it can't find is null/empty — the agent leaves that section out.
//
//   node readme-facts.mjs [--root=.] [--out=readme-facts.json]
//   node readme-facts.mjs --selftest

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import assert from "node:assert";

// --- pure helpers (--selftest) ----------------------------------------------

// git remote URL -> "owner/repo" + host, or null.
export function parseRemote(url) {
  const m = /^(?:https?:\/\/|git@|ssh:\/\/git@)([^/:]+)[/:]([^/]+)\/([^/]+?)(?:\.git)?\/?$/.exec((url || "").trim());
  return m ? { host: m[1], slug: `${m[2]}/${m[3]}` } : null;
}

// First lines of a LICENSE file -> SPDX-ish id, or "unknown".
export function detectLicense(text) {
  const t = (text || "").slice(0, 600);
  const rules = [
    [/MIT License|Permission is hereby granted, free of charge/i, "MIT"],
    [/Apache License[\s\S]*Version 2\.0/i, "Apache-2.0"],
    [/GNU AFFERO GENERAL PUBLIC LICENSE/i, "AGPL-3.0"],
    [/GNU LESSER GENERAL PUBLIC LICENSE/i, "LGPL"],
    [/GNU GENERAL PUBLIC LICENSE[\s\S]*Version 3/i, "GPL-3.0"],
    [/GNU GENERAL PUBLIC LICENSE[\s\S]*Version 2/i, "GPL-2.0"],
    [/Mozilla Public License[\s\S]*2\.0/i, "MPL-2.0"],
    [/BSD 3-Clause|Redistributions of source code[\s\S]*Neither the name/i, "BSD-3-Clause"],
    [/BSD 2-Clause/i, "BSD-2-Clause"],
    [/ISC License/i, "ISC"],
    [/This is free and unencumbered software/i, "Unlicense"],
  ];
  for (const [re, id] of rules) if (re.test(t)) return id;
  return text ? "unknown" : null;
}

// Manifest file name -> { ecosystem, install hint }. Order = priority when several exist.
export const MANIFESTS = [
  ["package.json", "node"], ["Cargo.toml", "rust"], ["go.mod", "go"], ["pyproject.toml", "python"],
  ["requirements.txt", "python"], ["pom.xml", "java-maven"], ["build.gradle", "java-gradle"],
  ["build.gradle.kts", "java-gradle"], ["Gemfile", "ruby"], ["composer.json", "php"],
  ["mix.exs", "elixir"], ["pubspec.yaml", "dart"], ["Package.swift", "swift"], ["deno.json", "deno"],
];

// Lockfile -> package manager (node only; others have one manager).
export function nodePackageManager(files) {
  if (files.includes("pnpm-lock.yaml")) return "pnpm";
  if (files.includes("yarn.lock")) return "yarn";
  if (files.includes("bun.lockb") || files.includes("bun.lock")) return "bun";
  if (files.includes("package-lock.json")) return "npm";
  return files.includes("package.json") ? "npm" : null;
}

// package.json -> the facts a README needs. Scripts filtered to the ones users run.
export function nodeFacts(pkg) {
  const scripts = Object.keys(pkg.scripts || {}).filter((s) => /^(dev|start|build|test|lint|serve|preview|typecheck|format)$/.test(s));
  return {
    name: pkg.name ?? null,
    description: pkg.description ?? null,
    version: pkg.version ?? null,
    bin: pkg.bin ? (typeof pkg.bin === "string" ? [pkg.name] : Object.keys(pkg.bin)) : [],
    engines: pkg.engines ?? null,
    private: pkg.private === true,
    scripts,
    homepage: pkg.homepage ?? null,
    // npm/yarn/bun workspaces (array or { packages: [] }) — a monorepo signal
    workspaces: Array.isArray(pkg.workspaces) ? pkg.workspaces : pkg.workspaces?.packages ?? [],
  };
}

// Simple TOML-ish key read (name/version/description under the first table). Good enough
// for Cargo.toml / pyproject.toml headers; no full TOML parser on purpose.
export function tomlField(text, key) {
  const m = new RegExp(`^${key}\\s*=\\s*"([^"]*)"`, "m").exec(text || "");
  return m ? m[1] : null;
}

// Markdown text -> list of "## heading" strings (to see what an existing README already has).
export function headings(md) {
  return [...(md || "").replace(/```[\s\S]*?```/g, "").matchAll(/^(#{1,3})\s+(.+)$/gm)].map((m) => `${m[1]} ${m[2].trim()}`);
}

// --- io ----------------------------------------------------------------------

const git = (root, args) => {
  try { return execFileSync("git", ["-C", root, ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim(); }
  catch { return ""; }
};
const read = (p) => (existsSync(p) ? readFileSync(p, "utf8") : null);
const ls = (p) => { try { return readdirSync(p); } catch { return []; } };
const isDir = (p) => { try { return statSync(p).isDirectory(); } catch { return false; } };

function collect(root) {
  const files = ls(root);
  const has = (f) => files.includes(f);
  const manifests = MANIFESTS.filter(([f]) => has(f)).map(([file, ecosystem]) => ({ file, ecosystem }));
  const pkg = has("package.json") ? (() => { try { return JSON.parse(read(join(root, "package.json"))); } catch { return null; } })() : null;
  const toml = read(join(root, "Cargo.toml")) ?? read(join(root, "pyproject.toml"));
  const licenseFile = files.find((f) => /^(LICEN[CS]E|COPYING)(\.|$)/i.test(f));
  const readmeFile = files.find((f) => /^readme(\.md)?$/i.test(f));
  const workflows = ls(join(root, ".github", "workflows")).filter((f) => /\.ya?ml$/.test(f));
  const remote = parseRemote(git(root, ["remote", "get-url", "origin"]));
  const tags = git(root, ["tag", "--sort=-v:refname"]).split("\n").filter(Boolean);
  const images = [...ls(root), ...ls(join(root, "docs")).map((f) => `docs/${f}`), ...ls(join(root, "assets")).map((f) => `assets/${f}`)]
    .filter((f) => /\.(png|svg|gif|jpe?g|webp)$/i.test(f));

  return {
    root,
    name: (pkg && pkg.name) || tomlField(toml, "name") || basename(resolve(root)),
    description: (pkg && pkg.description) || tomlField(toml, "description") || null,
    version: (pkg && pkg.version) || tomlField(toml, "version") || tags[0] || null,
    manifests,
    node: pkg ? { ...nodeFacts(pkg), packageManager: nodePackageManager(files) } : null,
    license: licenseFile ? { file: licenseFile, id: detectLicense(read(join(root, licenseFile))) } : null,
    remote,
    latestTag: tags[0] || null,
    ci: workflows.map((f) => `.github/workflows/${f}`),
    docker: has("Dockerfile") || has("compose.yaml") || has("docker-compose.yml"),
    docsDir: isDir(join(root, "docs")) ? ls(join(root, "docs")).filter((f) => f.endsWith(".md")) : [],
    examplesDir: isDir(join(root, "examples")),
    community: ["CHANGELOG.md", "CONTRIBUTING.md", "SECURITY.md", "CODE_OF_CONDUCT.md", "AGENTS.md"].filter(has),
    images,
    existingReadme: readmeFile ? { file: readmeFile, headings: headings(read(join(root, readmeFile))) } : null,
    monorepo: Boolean(pkg && nodeFacts(pkg).workspaces.length) || files.includes("pnpm-workspace.yaml")
      || /^\[workspace\]/m.test(read(join(root, "Cargo.toml")) || "") || files.includes("go.work"),
    commits: Number(git(root, ["rev-list", "--count", "HEAD"])) || 0,
  };
}

// --- selftest ----------------------------------------------------------------

function selftest() {
  assert.deepEqual(parseRemote("git@github.com:acme/tool.git"), { host: "github.com", slug: "acme/tool" });
  assert.deepEqual(parseRemote("https://gitlab.com/acme/tool"), { host: "gitlab.com", slug: "acme/tool" });
  assert.equal(parseRemote(""), null);
  assert.equal(detectLicense("MIT License\n\nCopyright (c) 2026 x"), "MIT");
  assert.equal(detectLicense("                                 Apache License\n                           Version 2.0, January 2004"), "Apache-2.0");
  assert.equal(detectLicense("some custom terms"), "unknown");
  assert.equal(detectLicense(null), null);
  assert.equal(nodePackageManager(["package.json", "pnpm-lock.yaml"]), "pnpm");
  assert.equal(nodePackageManager(["package.json"]), "npm");
  assert.equal(nodePackageManager(["Cargo.toml"]), null);
  const nf = nodeFacts({ name: "x", bin: { x: "cli.js" }, scripts: { dev: "", test: "", postinstall: "" } });
  assert.deepEqual(nf.bin, ["x"]);
  assert.deepEqual(nf.scripts, ["dev", "test"]);
  assert.deepEqual(nodeFacts({ workspaces: ["packages/a"] }).workspaces, ["packages/a"]);
  assert.deepEqual(nodeFacts({ workspaces: { packages: ["apps/*"] } }).workspaces, ["apps/*"]);
  assert.deepEqual(nf.workspaces, []);
  assert.equal(tomlField('[package]\nname = "tool"\nversion = "0.3.1"', "version"), "0.3.1");
  assert.equal(tomlField("", "name"), null);
  assert.deepEqual(headings("# A\n```\n# not a heading\n```\n## B\ntext"), ["# A", "## B"]);
  console.log("selftest OK");
}

// --- cli ---------------------------------------------------------------------

const args = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, "").split("=")).map(([k, v]) => [k, v ?? true]));
if (args.selftest) selftest();
else if (process.argv[1]?.endsWith("readme-facts.mjs")) {
  const facts = collect(args.root || ".");
  const out = args.out || "readme-facts.json";
  writeFileSync(out, JSON.stringify(facts, null, 2));
  console.log(`readme-facts: ${facts.manifests.map((m) => m.ecosystem).join(", ") || "no manifest"}; license ${facts.license?.id ?? "none"}; ${facts.ci.length} CI workflow(s) -> ${out}`);
}
