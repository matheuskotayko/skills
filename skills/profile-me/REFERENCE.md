# Profile Me — Reference

The method for writing branding content that is specific, honest, and right-sized for its channel. The rule under everything: **a claim you can't defend in an interview is worse than no claim.**

---

## 1. The X-Y-Z method (Google / Laszlo Bock)

**"Accomplished X, measured by Y, by doing Z."**

- **X = the result** — what changed, not the task you performed. ("Cut checkout latency", not "worked on checkout".)
- **Y = the proof** — a number, percent, time, or volume. When no number exists, use **scope** as honest proof instead (below).
- **Z = the method** — the tool, technique, or decision that got you there.

Order is flexible; result and proof must always appear together. "Implementei APIs" is a task. "Automatizei orçamentos integrando 3 APIs, eliminando entrada manual" is X-Y-Z.

---

## 2. Honesty with metrics

**Never invent a number.** No data → ask the user before writing the final version. When there's no numeric metric, use proof in this order of preference:

1. **Real scope/scale** — "1,109 topics mapped", "11 units monitored", "69 integration tests".
2. **Version/tech migration** as proof of modernization — "PHP 5.6 → Laravel" proves it without a percentage.
3. **A specific, true qualitative outcome** — real user feedback, a guaranteed system behavior ("compatible with Meta Quest" proves robustness without a usage metric).
4. **Never** a vague claim ("improved quality") with none of the above.

If while drafting you realize you inferred a number the source doesn't contain (e.g. "90% accuracy" that isn't in the material), **self-correct and flag it** before finalizing. Same discipline as [brag-me](../brag-me/SKILL.md) — measured facts come from git/PRs/reports; anything else is labeled or asked.

---

## 3. Format per channel

Same facts, different shape. Match the channel:

| Channel | Format | Detail |
|---|---|---|
| LinkedIn — Experience | Bullets, one per line | Medium-high; several lines OK |
| Résumé / CV | Bullets | High signal, tighter than LinkedIn |
| LinkedIn — About | Flowing paragraphs | X-Y-Z embedded in the sentence, not as a list |
| Portfolio — hero / mini-bio | One short line | A 3-second hook; do not repeat the "About me" |
| Portfolio — About me | 2 short paragraphs | Context/trajectory that complements (not repeats) the hero |
| Portfolio — project | 1-line description + 2–7 highlight bullets | Much tighter than LinkedIn — one sentence each |

---

## 4. Don't repeat yourself across sections

Every field has one job; it must not echo another visible field on the same page:

- **Hero = quick hook; About = context/trajectory.** They cannot say the same thing in different words.
- If a fact already shows in a side card (e.g. an "Education" card), don't repeat it in the prose next to it.
- In LinkedIn **About**, summarize past roles **by theme** ("backend, API integration, and performance across X, Y, Z"), not by re-listing each job at Experience-level detail.

---

## 5. Job-title and positioning nuances

- **Profile headline** (under the name): load it with keywords — role + stack + specialization + goal — even if it's not a formal title. Discoverability wins here.
- **Job title inside an Experience**: use the real, formal title of the role; don't inflate it with stack. Stack goes in the description, not the title. (Keep "Full-Stack Developer" even with technical-lead duties — the leadership goes in the body.)
- **Non-traditional bindings** (grant/fellowship funds you but you work at company X): put the **company where you actually work** in the "Company" field (recruiters search it); mention the formal funding source briefly in the description, without letting it steal the spotlight from what you technically do.
- **Technical leadership without a management title**: "technical reference" / "I lead technically" states real responsibility without claiming people/budget management that doesn't exist. On LinkedIn, where searchability matters more than precision, "technical leadership" is more findable and still honest. Never imply people/budget management if it isn't real.

---

## 6. Positioning strategy

- **Declare a focus** and keep it consistent across every material (LinkedIn About + Experience + portfolio). A past area that's no longer your focus should be **mentioned, not omitted** (it's real and has good content) — but never carry the same weight as the current focus.
- **Select portfolio projects for stack diversity**, not just recency — showing a different stack beats a third redundant project in the same one.
- Every material must tell the **same story with consistent numbers** — a metric that appears in two places must match in both.

---

## 7. LinkedIn field guide (distilled)

Generic mechanics for the platform — what each field is for. (Common LinkedIn practice, distilled.)

- **Photo** — professional, neutral background, recent, light natural smile, head/torso framing.
- **Headline** — the highest-value keyword field; it shows in search next to your name. Ask: *what words would a recruiter type to find someone with my skills?* Mine real job posts for those words.
- **About** — brief intro → key skills (keywords) → experience summarized by theme with results → what you're looking for → a call to contact.
- **Keywords** — pull them from real job descriptions in your target role; watch your "search appearances" metric to see if they land.
- **Skills** — you can list up to 50 and each is a keyword, so use the limit; add ones a job's "Qualifications" panel surfaces that you actually have.
- **Featured / cover** — reinforce top projects and results; a cover that represents you as a professional.
- **Custom URL** — replace the numeric slug with your name (3–100 chars, no spaces/symbols).
- **Boolean search** (finding people/jobs): quotes = exact phrase (straight quotes only), uppercase `AND`/`OR`/`NOT`, parentheses to group, e.g. `recruiter AND ("fintech" OR "payments") NOT agency`.
- **Networking** — after a connection is accepted, send a short, contextual, non-transactional message; connect with recruiters and peers at target companies.

---

## 8. Source-of-truth input

The skill needs the user's **validated facts** — it does not invent them. Accept any of:

- A `brag.md` produced by [brag-me](../brag-me/SKILL.md) (git-harvested, evidence-linked).
- A hand-written validated-facts doc (projects, roles, real metrics, stacks).
- A short interview, when neither exists.

Keep this file **private** — it holds real metrics, client names, salary research, and bindings. It is the user's, never part of the published skill.

### Anonymized worked example

Facts (fictional): *"Backend dev at a fintech. Migrated a legacy monolith from PHP 5.6 to Laravel. Raised test coverage from 30% to 62%. Built a CSV importer that auto-categorizes transactions."*

- **LinkedIn headline:** `Backend Developer | PHP · Laravel · PostgreSQL | Test Automation & Legacy Modernization`
- **Résumé bullet:** "Raised test coverage 30%→62% by adding integration tests across the payments core."
- **LinkedIn About (prose):** "…I modernized a legacy billing system, migrating it from PHP 5.6 to Laravel and lifting test coverage from 30% to 62% along the way…"
- **Portfolio hero (1 line):** "Backend developer who turns legacy systems into tested, maintainable ones."
- **Portfolio project bullet:** "CSV statement importer with auto-categorization learned from the user's own history."

Same facts, five shapes, one honest number (30→62) used consistently — never inflated to a round "doubled coverage" it can't defend.
