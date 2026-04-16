# Rule — Logging Discipline

## Principle

Every activity leaves a trace. Every decision leaves a record. Nothing gets silently done, silently retried, or silently skipped. The execution log is the ground truth of what actually happened during Phase 0.

---

## The execution log

**File:** `relatorios/log_execucao.md`

**Format:** Markdown, append-only during execution. Do not reorder, do not delete, do not compress past entries.

**Scope:** every activity, every gate signal, every blocked request, every scope-drift detection, every parameter adjustment, every excluded document.

## When to write a log entry

You write a log entry:

- At the start of Phase 0 (environment setup complete)
- At the start of every activity listed in Section 9 of the plan
- At the end of every activity (status CONCLUDED / BLOCKED / IN PROGRESS)
- When a gate condition is met (gate signal)
- When a gate is approved (recorded by the technical lead)
- When a technical decision is made
- When an error occurs that affects a document or the pipeline
- When a user request is blocked
- When a scope drift is detected and reverted
- When a benchmark is re-run
- When a parameter is adjusted
- When a document is excluded from the corpus
- When ground truth is corrected

## Standard activity entry

Use `templates/activity-log-entry.md`. Minimum required fields:

```
## [YYYY-MM-DD HH:MM] Activity: <activity name>

**Status:** CONCLUDED / BLOCKED / IN PROGRESS
**Duration:** X hours
**Summary:** <1-2 sentences describing what was done>
**Outputs:** <generated file(s)>
**Issues encountered:** <None / description>
**Next activity:** <name>
```

## Gate signal entry

Use `templates/gate-signal.md`. Minimum structure:

```
## [YYYY-MM-DD HH:MM] 🚩 GATE <N> — READY FOR APPROVAL

**Gate:** <gate name>
**Conditions verified:**
- [x] Condition 1: <result>
- [x] Condition 2: <result>
- [x] Condition N: <result>

**Decision file:** decisoes/decisao_<name>.md
**Action required:** Approval by the technical lead
```

## Technical decision entry

Every technical choice made during execution (threshold adjustment, parameter selection, document exclusion, anchor addition) is logged in the relevant decision file under `decisoes/` with the structure in `templates/technical-decision-record.md`:

- Date and time
- Context: why the decision was necessary
- Alternatives considered
- Decision taken
- Justification (supporting data)
- Impact on the pipeline

## Error entry

When a document fails (rasterization failure, OCR producing garbage, parser finding no fields):

```
## [YYYY-MM-DD HH:MM] ERROR: <document_id>

**Stage:** <rasterization / preprocessing / OCR / parser>
**Error message:** <verbatim>
**Action taken:** document flagged as status "ERRO" in corpus_catalog.json; execution continues
```

Do not block Phase 0 for a single document. If > 10% of documents fail at the same stage, escalate as a systemic issue per Section 12.4 of the plan.

## Rules

1. Every log entry has a timestamp (local time, ISO-ish `YYYY-MM-DD HH:MM`).
2. Entries are appended chronologically. Do not rewrite history.
3. If a past entry contained an error, do not edit it. Write a new entry that corrects and references the old one.
4. Log entries are written in the language of the entry's context; when produced by Claude Code, write in English unless the plan or a template says otherwise.
5. Every gate signal is a distinct heading, never merged with an activity entry.
6. Silence in the log is treated as proof of inaction.

## What not to do

- Do not batch-log multiple days in a single entry.
- Do not omit failed attempts; log them.
- Do not edit past entries to hide mistakes.
- Do not use vague summaries ("ran some benchmarks"). Specify which ones, on which documents, with which parameters.
