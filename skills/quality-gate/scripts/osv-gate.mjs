#!/usr/bin/env node
// osv-gate.mjs — judge an osv-scanner JSON report by severity. Zero deps, Node >= 18.
//
// osv-scanner exits != 0 on any vulnerability, with no severity cut. This makes the cut explicit:
// block CVSS >= --min (default 7.0, high/critical) and unscored vulnerabilities (you can't prove
// they're low); below that, only warn. Justified exceptions live in osv-scanner.toml
// (IgnoredVulns with reason/ignoreUntil) — osv-scanner already drops those from the report.
//
// Works for any ecosystem osv-scanner reads (lockfiles, SBOMs: npm, Maven, pip, Go, Cargo…).
// Pass/fail, outside the ratchet: a vulnerability isn't a metric that "may not get worse",
// it's a known-bad dependency that must go.
//
// Usage: node osv-gate.mjs <report.json> [--min=7.0] | --selftest
import { readFileSync } from "node:fs";

/** One row per alias group (the same CVE under several ids counts once). */
export function findings(report) {
  const rows = [];
  for (const result of report.results ?? []) {
    for (const pkg of result.packages ?? []) {
      for (const group of pkg.groups ?? []) {
        const score = Number.parseFloat(group.max_severity);
        rows.push({
          pkg: `${pkg.package.name} ${pkg.package.version}`,
          ids: group.ids.join(", "),
          score: Number.isNaN(score) ? null : score,
        });
      }
    }
  }
  return rows;
}

/** Split what blocks (score >= min or unscored) from what only warns. */
export function judge(rows, min) {
  const blocking = rows.filter((r) => r.score === null || r.score >= min);
  const warning = rows.filter((r) => r.score !== null && r.score < min);
  return { blocking, warning };
}

function print(title, rows) {
  if (!rows.length) return;
  console.log(`\n${title}`);
  for (const r of rows) console.log(`  [${r.score ?? "unscored"}] ${r.pkg} — ${r.ids}`);
}

function selftest() {
  const assert = (cond, msg) => { if (!cond) { console.error("FAIL:", msg); process.exit(1); } };
  const report = { results: [{ packages: [
    { package: { name: "lib-a", version: "1.0" }, groups: [{ ids: ["GHSA-a"], max_severity: "9.8" }] },
    { package: { name: "lib-b", version: "1.0" }, groups: [{ ids: ["GHSA-b"], max_severity: "6.3" }] },
    { package: { name: "lib-c", version: "1.0" }, groups: [{ ids: ["GHSA-c"], max_severity: "" }] },
    { package: { name: "lib-d", version: "1.0" }, groups: [{ ids: ["GHSA-d"], max_severity: "7.0" }] },
  ] }] };
  const { blocking, warning } = judge(findings(report), 7.0);
  assert(blocking.some((r) => r.ids === "GHSA-a"), "critical (9.8) blocks");
  assert(blocking.some((r) => r.ids === "GHSA-d"), "exactly at the cut (7.0) blocks");
  assert(blocking.some((r) => r.ids === "GHSA-c"), "unscored blocks — can't prove it's low");
  assert(warning.length === 1 && warning[0].ids === "GHSA-b", "medium (6.3) only warns");
  assert(judge(findings({ results: [] }), 7.0).blocking.length === 0, "empty report doesn't block");
  console.log("selftest OK");
}

if (process.argv.includes("--selftest")) { selftest(); process.exit(0); }

const path = process.argv[2];
if (!path) {
  console.error("usage: osv-gate.mjs <report.json> [--min=7.0] | --selftest");
  process.exit(2);
}
const min = Number.parseFloat((process.argv.find((a) => a.startsWith("--min=")) ?? "--min=7.0").slice(6));
const { blocking, warning } = judge(findings(JSON.parse(readFileSync(path, "utf8"))), min);
print(`Blocking (CVSS >= ${min} or unscored):`, blocking);
print(`Warning (CVSS < ${min}):`, warning);
console.log(`\nosv-gate: ${blocking.length} blocking, ${warning.length} warning(s).`);
process.exit(blocking.length ? 1 : 0);
