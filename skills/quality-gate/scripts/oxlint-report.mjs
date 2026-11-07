#!/usr/bin/env node
// oxlint-report.mjs — run oxlint and write its findings in eslint's JSON shape, the one
// quality-gate.mjs reads for `lint` and `complexity`. Zero deps, Node >= 18.
//
// oxlint emits { diagnostics: [...] }; the gate expects [{ messages: [...] }].
// Usage (from the project root): node oxlint-report.mjs [out=reports/oxlint.json]
// Then set reports.lint to the output and complexityRule to "eslint(complexity)".
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const out = process.argv[2] || "reports/oxlint.json";
mkdirSync(dirname(out), { recursive: true });

let raw = "{}";
try {
  raw = execFileSync("npx", ["oxlint", "--format=json"], { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
} catch (err) {
  // oxlint exits != 0 when it finds problems; the JSON is still on stdout.
  raw = err.stdout?.toString() || "{}";
}

// ruleId = oxlint's `code` (e.g. "eslint(complexity)"): the gate uses it to split the complexity
// rule (metric `complexity`) from the rest of lint.
const diagnostics = (JSON.parse(raw).diagnostics ?? []).map((d) => ({ ...d, ruleId: d.code }));
writeFileSync(out, JSON.stringify([{ messages: diagnostics }]));
console.log(`oxlint: ${diagnostics.length} diagnostics -> ${out}`);
