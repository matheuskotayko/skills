# Quality Gate — Reference

The ratchet method is stack-agnostic — the comparator only reads numbers. What differs per stack is **collection**: how you produce the coverage / lint / audit reports the script reads. Recipes below cover Node and Java/Maven; jscpd and large-file counting are built into the script and work on any language.

---

## 1. `baseline.json` schema

`collect` writes `metrics.json` in this shape; committing it (via `update` or by hand) makes it the `baseline.json`.

```json
{
  "updatedAt": "2026-07-31T00:00:00.000Z",
  "metrics": {
    "coverage": 7,
    "duplication": 2.2,
    "lint": 483,
    "largeFiles": 19,
    "complexity": 12,
    "dependencies": 3,
    "mutation": 60,
    "benchmark": { "parseInvoice": 1.2, "renderTable": 45 },
    "security": { "critical": 0, "high": 0 }
  }
}
```

Directions are fixed in the script, not the file: `coverage` and `mutation` higher-is-better; `duplication`, `lint`, `largeFiles`, `complexity`, `dependencies` lower-is-better; `security.critical` blocks, `security.high` warns; `benchmark` is per-named-bench, lower-is-better (time per op) within a tolerance band. `complexity` is the count of functions over the cyclomatic limit; `dependencies` is the count of circular dependency cycles; `mutation` is the mutation score % (killed / valid mutants). A metric set to `null` (no report found) is skipped — never a regression, never an improvement.

**Lite or full.** One engine; how much runs is a choice. `--preset=lite` enables the five fundamentals (coverage, duplication, lint, largeFiles, security); `--preset=full` (the default) adds complexity, dependencies, and mutation. `qualitygate.lite.config.example.json` is the same lite set as a committed config. Resolution order: an explicit `metrics` list in the config > `--preset` > full. Start lite on a legacy project, graduate as it matures — mutation last (slow, and only meaningful with a solid suite).

---

## 2. Collection per stack

The script collects `duplication` (jscpd), `largeFiles` (line count), and `dependencies` (madge) itself. For `coverage`, `lint`, `complexity`, `mutation`, and `security` it reads a report file whose path you set in `reports.*`. Generate those reports before running `collect`.

`reports.coverage` and `reports.lint` also accept a **list of paths** — one report per module in a multi-module build (Maven modules, monorepo packages). Missing files are skipped; jacoco CSVs are summed by instruction count and jest summaries by covered/total lines, so a big module weighs more than a small one (don't mix formats in one list); lint counts are summed.

`complexity` reuses the **lint report** — turn the cyclomatic rule on so violations land there. In eslint: `"complexity": ["warn", 10]` in your config (the script counts messages whose `ruleId` matches `complexityRule`, default `"complexity"`). In checkstyle: the `CyclomaticComplexity` module (the script counts `<error>` whose `source` mentions `Cyclomatic`). When `complexity` is active, those violations are **not** also counted by `lint` — otherwise one complex function would regress two metrics, and turning the rule on would regress lint by the whole backlog.

`duplication` runs jscpd over every format it knows (markdown, json, xml…), so editing docs would move the code-duplication number. Restrict it with `duplicationFormats` (jscpd format names, e.g. `["typescript", "java"]` — not extensions) and exclude paths with `duplicationIgnore` (globs; jscpd ignores `exclude` and `.jscpdignore` here). `dependencies` uses madge, which only reads `.js` by default: a TS project needs a `.madgerc` with `{"fileExtensions": ["ts", "tsx"]}`, or it reports 0 cycles silently. jscpd and madge are pinned to a major version so a release can't shift the baseline under you.

`tolerances` (e.g. `{"duplication": 0.3, "coverage": 0.15}`) gives percentage metrics an **absolute-point** noise band: a change inside it is neither a regression nor an improvement, so the baseline still only advances on genuine improvement. Leave it unset for exact comparison.

`dependencies` runs `npx madge --circular --json <root>` and counts the cycles — JS/TS only; it degrades to `null` elsewhere.

`benchmark` reads a bench report set in `reports.benchmark` and tracks **each named benchmark separately** (a single total would hide which one regressed and would shift whenever a bench is added). It understands JMH (`-rf json`), `vitest bench --outputJson`, tinybench results, and a plain `{"name": number}` object. Values are **time per op, lower is better**; if your tool reports throughput (ops/sec), set `"benchmarkHigherIsBetter": true`.

Because CI timing is noisy, benchmark is judged by **percent change against a tolerance band** (`benchmarkTolerance`, default `10`) — not exactly like the other metrics. The band is symmetric: a change inside it is treated as noise in **both** directions, so an in-band speedup does not advance the baseline. That asymmetry matters — ratcheting to a lucky-fast run would make every ordinary run afterwards read as a regression and the gate would eat itself. A benchmark with no baseline entry is adopted on `update`, never failed. Run it in its **own CI job** (like mutation) so it isn't competing for CPU with the rest of the pipeline; a self-hosted/pinned runner can take the tolerance down to ~3%.

`mutation` reads a mutation-testing report set in `reports.mutation`: a stryker `.json` (score = killed+timeout / killed+timeout+survived+nocoverage) or a pitest `.xml` (score = detected / total). **Run it in its own slow CI job**, not on every push — mutation reruns the suite once per mutant. Add it only when the suite is strong; a high score over weak tests is noise.

### Node

```bash
# coverage → coverage/coverage-summary.json  (reports.coverage)
npx jest --coverage --coverageReporters=json-summary
# or vitest: npx vitest run --coverage  (coverage.reporter: ['json-summary'])

# lint (+ complexity) → reports/eslint.json  (reports.lint)
# enable "complexity": ["warn", 10] in eslint config so complexity violations are counted
npx eslint . -f json -o reports/eslint.json || true   # || true: don't abort collect on lint errors
# or oxlint: node oxlint-report.mjs reports/oxlint.json  (scripts/oxlint-report.mjs converts to eslint's shape)
#   set "complexityRule": "eslint(complexity)" and enable complexity in .oxlintrc.json

# security → reports/npm-audit.json  (reports.audit)
npm audit --json > reports/npm-audit.json || true

# dependencies: collected automatically via `npx madge --circular` — no report file needed

# mutation (slow — own job) → reports/mutation/mutation.json  (reports.mutation)
npx stryker run   # configure stryker's json reporter to reports/mutation/mutation.json

# benchmark (own job) → reports/bench.json  (reports.benchmark)
npx vitest bench --outputJson=reports/bench.json     # or a tinybench script writing its results
```

### Java / Maven

```bash
# coverage → jacoco CSV  (reports.coverage: "target/site/jacoco/jacoco.csv")
mvn -B test jacoco:report

# lint (+ complexity) → checkstyle XML  (reports.lint: "target/checkstyle-result.xml")
# enable the CyclomaticComplexity module in checkstyle.xml so complexity is counted
mvn -B checkstyle:checkstyle

# mutation (slow — own job) → target/pit-reports/mutations.xml  (reports.mutation)
mvn -B org.pitest:pitest-maven:mutationCoverage -Dpit.reportFormats=XML

# benchmark (own job) → reports/bench.json  (reports.benchmark)
mvn -B jmh:benchmark -Djmh.rf=json -Djmh.rff=reports/bench.json
```

Point `reports.coverage` at a `.json` (jest summary) or `.csv` (jacoco); `reports.lint` at `.json` (eslint) or `.xml` (checkstyle); `reports.mutation` at a stryker `.json` or pitest `.xml`. The script auto-detects by extension. The `security` metric is npm-audit-only; on non-Node projects drop `"security"` from `metrics` and use `osv-gate` below.

### Vulnerabilities on any stack — `osv-gate`

[osv-scanner](https://google.github.io/osv-scanner/) reads lockfiles and SBOMs for npm, Maven, Gradle, pip, Go, Cargo and more, but exits non-zero on *any* finding. [`scripts/osv-gate.mjs`](scripts/osv-gate.mjs) applies a severity cut to its JSON report: **CVSS ≥ 7 (or unscored) blocks**, lower only warns. It's a pass/fail step, not a ratcheted metric — a known-vulnerable dependency must go, not merely "not get worse".

```bash
# lockfile-based stacks (npm, pip, Go, Cargo, Gradle lockfile…)
osv-scanner scan -r . --format json > osv.json || true    # || true: osv-gate decides the cut
node osv-gate.mjs osv.json            # --min=9.0 to block only critical

# Maven (no lockfile): scan a production SBOM instead of pom.xml — scanning the pom tries to
# resolve your own SNAPSHOT modules from Maven Central and stops
mvn -B org.cyclonedx:cyclonedx-maven-plugin:2.9.1:makeAggregateBom \
  -DincludeTestScope=false -DincludeProvidedScope=false -DoutputFormat=json -DoutputName=bom
osv-scanner scan -L target/bom.json --format json > osv.json || true
node osv-gate.mjs osv.json
```

Justified exceptions go in `osv-scanner.toml` (`[[IgnoredVulns]]` with `reason` and `ignoreUntil`), passed via `--config`; osv-scanner drops them from the report. In CI, download a pinned release and verify it against `osv-scanner_SHA256SUMS` before running it.

### Other stacks (Python/Ruby/…)

The comparator is agnostic — only the recipe is missing. Produce a coverage number and a lint count however your stack does (e.g. `coverage json`, `rubocop --format json`) and point `reports.*` at the output. `duplication` and `largeFiles` already work everywhere.

---

## 3. CI workflow (GitHub Actions)

`.github/workflows/quality-gate.yml` — `check` on PRs, advance the ratchet after merge. Collection steps are the Node recipe; swap in your stack's (§2).

```yaml
name: quality-gate
on:
  # No `paths:` filter — a required check whose workflow never triggers leaves the PR waiting
  # forever. Skip work inside the job instead (`changes`): a skipped job counts as success.
  pull_request:
    branches: [main]
  push:
    branches: [main]

permissions:
  contents: read
  pull-requests: write   # PR comment

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: ${{ github.event_name == 'pull_request' }}

jobs:
  # PR touching only docs skips the gate. In a monorepo, emit one output per area (backend,
  # frontend…) and gate each job on its own — touching the gate itself (script/config/baseline/
  # workflow) must trigger all of them.
  changes:
    runs-on: ubuntu-latest
    outputs:
      code: ${{ steps.filter.outputs.code }}
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
        with: { fetch-depth: 2 }
      - id: filter
        run: |
          if [ "${{ github.event_name }}" != "pull_request" ]; then echo "code=true" >> "$GITHUB_OUTPUT"; exit 0; fi
          files=$(git diff --name-only HEAD^ HEAD | grep -vE '\.md$' || true)
          [ -n "$files" ] && echo "code=true" >> "$GITHUB_OUTPUT" || echo "code=false" >> "$GITHUB_OUTPUT"

  gate:
    needs: changes
    if: needs.changes.outputs.code == 'true'
    runs-on: ubuntu-latest
    steps:
      # Pin actions by commit SHA — a tag can be moved, a SHA can't. Keep the version comment so
      # Dependabot (package-ecosystem: github-actions) bumps both together.
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
      - uses: actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 # v7.1.0
        with: { node-version: 22, cache: npm }

      - run: npm ci
      - run: npx jest --coverage --coverageReporters=json-summary
      - run: npx eslint . -f json -o reports/eslint.json || true
      - run: npm audit --json > reports/npm-audit.json || true

      - run: node quality-gate.mjs collect
      # hand the measured metrics to advance-baseline instead of rebuilding there
      - if: github.event_name == 'push'
        uses: actions/upload-artifact@cf430e030ddbb5b0abf93d22962f4752f3646cd9 # v7.0.2
        with: { name: metrics, path: metrics.json, retention-days: 1 }
      - run: node quality-gate.mjs check              # exit 1 blocks the PR

      - if: always()
        run: cat quality-gate-summary.md >> "$GITHUB_STEP_SUMMARY"
      - if: always() && github.event_name == 'pull_request'
        env: { GH_TOKEN: "${{ github.token }}" }
        run: gh pr comment "${{ github.event.pull_request.number }}" --body-file quality-gate-summary.md

  # Protected main rejects a direct push from github-actions, so the baseline advances through
  # its own PR, merged immediately. Needs "Allow GitHub Actions to create and approve pull
  # requests" (Settings → Actions → General).
  advance-baseline:
    needs: gate
    if: github.event_name == 'push'
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
      statuses: write
    steps:
      # Current main, not this run's commit: with two quick merges the first run has already
      # merged its baseline PR, and branching from the old commit opens this one in conflict.
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
        with: { ref: main }
      - uses: actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 # v7.1.0
        with: { node-version: 22 }
      - uses: actions/download-artifact@9000827ccba6bdab643e8b6fd33ac0654aef8333 # v8.0.2
        with: { name: metrics }
      - run: node quality-gate.mjs update
      - env: { GH_TOKEN: "${{ github.token }}" }
        run: |
          git diff --quiet -- baseline.json && { echo "baseline unchanged"; exit 0; }
          # run_attempt: a re-run keeps run_id; without it the push hits the previous attempt's branch
          branch="ci/baseline-${{ github.run_id }}-${{ github.run_attempt }}"
          git config user.name github-actions
          git config user.email github-actions@github.com
          git switch -c "$branch"
          git commit -am "chore(quality-gate): advance baseline"
          git push origin "$branch"
          # A PR opened with GITHUB_TOKEN triggers no workflow, so required checks would never
          # report and the merge would hang. The commit only holds the baseline the gate just
          # measured on main, so mark the required checks green here — one per required check
          # name (in a monorepo: each area's gate, plus any other required job such as e2e).
          for check in gate; do
            gh api "repos/${{ github.repository }}/statuses/$(git rev-parse HEAD)" \
              -f state=success -f context="$check" -f description="baseline measured by the gate"
          done
          gh pr create --base main --head "$branch" --title "chore(quality-gate): advance baseline" \
            --body "Baseline advanced by run ${{ github.run_id }}."
          gh pr merge "$branch" --squash --delete-branch
```

`check` on the PR compares against the committed `baseline.json`; `update` runs only after a merge to main, so a PR can never advance the ratchet on its own. Make `gate` a **required status check** in the branch ruleset so the block is enforced — the `changes` job and the status step above exist so that requirement never deadlocks a docs-only PR or the baseline PR.

**Only mark green what the baseline commit can't break.** The baseline PR changes nothing but `baseline.json`, so a status for each required check is honest there. List each required check in the loop by name; never post a blanket success, and never reuse this trick on a PR that touches code.

**Monorepo:** one config + `baseline.json` per area (`frontend/qualitygate.config.json`…), one gate job per area, each uploading its own metrics artifact; `advance-baseline` needs all of them, runs `update` per area and commits every baseline in one PR.

---

## 3b. Pass/fail checks — e2e & regression (not ratcheted)

E2E and regression tests are **not metrics** — they're binary: the suite passes or it fails. There's no number to ratchet, and none is needed, because a failing suite already blocks the PR on its own. So they live as **separate CI jobs**, not in `baseline.json`. Add each to the branch's required status checks alongside `quality-gate`.

Why keep them out of the gate: the ratchet answers "did a metric get worse?"; a test suite answers "did behavior break?". Forcing e2e into a number (e.g. "count of passing e2e tests must not drop") is worse than a plain pass/fail — deleting a flaky test would "improve" the number while removing coverage.

```yaml
  # regression — the existing test suite; a broken behavior = a failing test
  regression:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
      - uses: actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 # v7.1.0
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm test              # Node: jest/vitest.  Java: mvn -B test

  # e2e — real user flows against a running app
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
      - uses: actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 # v7.1.0
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test     # or cypress; Java: REST-assured / testcontainers
```

Visual-regression (screenshot diffing via Playwright snapshots or Percy) is the same shape — a pass/fail job, not a gate metric. Keep e2e off the fast PR path if it's slow; run it as its own required job so a red run still blocks merge.

---

## 4. Babysitting playbook

After opening the PR, drive it to green — this is the "babysitting" half. Loop until CI is green and the gate passes:

```bash
gh pr checks <pr>                         # wait for CI; see which checks fail
gh pr view <pr> --json comments,reviews   # read reviewer + gate feedback
# ... apply the fix in code, then:
git commit -am "fix: address gate/review" && git push
```

Resolve review threads after fixing (GraphQL — REST can't resolve threads):

```bash
gh api graphql -f query='mutation($id:ID!){resolveReviewThread(input:{threadId:$id}){thread{isResolved}}}' -f id=<threadId>
```

Get unresolved thread ids with `gh api graphql` on `pullRequest.reviewThreads`.

**Stop rules — never break these:**
- Never edit `baseline.json` to make the gate pass. Fix the code, not the bar.
- Never force-merge or bypass required checks.
- If a metric genuinely must move the wrong way (rare, architectural), stop and ask the human — do not decide it yourself.
- If the fix loops without converging (~3 rounds), stop and report what's stuck.

---

## 5. Script usage

```bash
node quality-gate.mjs collect   # → metrics.json (+ .jscpd/ report)
node quality-gate.mjs check     # compare vs baseline.json → summary + exit 1 on regression
node quality-gate.mjs update    # advance baseline.json to improved values
node quality-gate.mjs --selftest
node quality-gate.mjs check --config=path/to/qualitygate.config.json
node quality-gate.mjs collect --preset=lite   # five fundamentals; --preset=full is the default
```

`check` writes the Markdown summary to `summaryFile` (default `quality-gate-summary.md`) — feed it to `$GITHUB_STEP_SUMMARY` or read it as the agent. It renders every active metric as a row with baseline, current, signed delta, and a status icon (❌ regressed / ✅ improved / ➖ unchanged / ⚠️ warning):

```md
## Quality Gate — ❌ 1 regression — blocking

| Metric | Baseline | Current | Δ | |
|---|---:|---:|---:|:-:|
| coverage | 7.16 | 10.42 | +3.26 | ✅ |
| duplication | 2.2 | 2.04 | -0.16 | ✅ |
| dependencies | 3 | 4 | +1 | ❌ |
| security (high) | 0 | 2 | +2 | ⚠️ |
| benchmark: parseInvoice | 1.2 ms | 1.24 ms | +3.33% | ➖ |
| benchmark: renderTable | 45 ms | 58.5 ms | +30% | ❌ |
```

Benchmark rows report a **percent** delta (absolute nanoseconds aren't readable at a glance) and mark in-band noise as ➖.

Config fields: `root`, `maxFileLines`, `complexityRule` (eslint rule id, default `complexity`), `benchmarkTolerance` (percent band, default `10`), `benchmarkHigherIsBetter` (set `true` for ops/sec), `benchmarkUnit` (display only, default `ms`), `metrics` (active list), `includeExt`, `exclude`, `duplicationFormats`, `duplicationIgnore`, `tolerances` (absolute-point band per % metric), `securityBlockLevel` (`"high"` makes high vulns block), `reports.{coverage,lint,audit,mutation,benchmark}` (coverage/lint accept a list), `summaryFile`. `--selftest` runs inline asserts (regression blocks, ratchet advances, critical blocks / high warns) and needs no config.
