#!/usr/bin/env node
// oxlint-report.mjs — run oxlint and write its findings in eslint's JSON shape, the one
// quality-gate.mjs reads for `lint` and `complexity`. Zero deps, Node >= 18.
//
// oxlint emits { diagnostics: [...] }; the gate expects [{ messages: [...] }].
// Usage (from the project root): node oxlint-report.mjs [out=reports/oxlint.json]
// Then set reports.lint to the output and complexityRule to "eslint(complexity)".
import assert from "node:assert";
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

// Pure: oxlint JSON text -> eslint-shaped report. ruleId = oxlint's `code` (e.g.
// "eslint(complexity)"): the gate uses it to split the complexity rule from the rest of lint.
export function toEslint(raw) {
  const diagnostics = (JSON.parse(raw).diagnostics ?? []).map((d) => ({ ...d, ruleId: d.code }));
  return [{ messages: diagnostics }];
}

if (process.argv[2] === "--selftest") {
  const r = toEslint('{"diagnostics":[{"code":"eslint(complexity)"},{"code":"eslint(no-unused-vars)"}]}');
  assert.equal(r[0].messages.length, 2);
  assert.equal(r[0].messages[0].ruleId, "eslint(complexity)");
  assert.deepEqual(toEslint("{}"), [{ messages: [] }]);
  console.log("selftest OK");
  process.exit(0);
}

const out = process.argv[2] || "reports/oxlint.json";
mkdirSync(dirname(out), { recursive: true });

let raw = "{}";
try {
  raw = execFileSync("npx", ["oxlint", "--format=json"], { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
} catch (err) {
  // oxlint exits != 0 when it finds problems; the JSON is still on stdout.
  raw = err.stdout?.toString() || "{}";
}

const report = toEslint(raw);
writeFileSync(out, JSON.stringify(report));
console.log(`oxlint: ${report[0].messages.length} diagnostics -> ${out}`);
