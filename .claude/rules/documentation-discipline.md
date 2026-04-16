# Rule — Documentation Discipline

## Principle

Every artifact produced during Phase 0 is a document in the legal-technical sense: it will be read, audited, and used to authorize Phase 1 spending. Sloppy documentation is indistinguishable from sloppy work.

---

## What counts as an artifact

| Type                  | Format   | Location                          | Rule set                      |
| --------------------- | -------- | --------------------------------- | ----------------------------- |
| Corpus catalog        | JSON     | `corpus/corpus_catalog.json`      | `schemas/corpus-catalog.md`   |
| Ground truth          | JSON     | `corpus/ground_truth/*_gt.json`   | `schemas/ground-truth.md`     |
| Benchmark results     | JSON     | `benchmarks/**/*.json`            | Respective schema file        |
| Parser sketch outputs | JSON     | `parser_sketch/*.json`            | Respective schema file        |
| Baseline              | JSON     | `baseline/fase0_baseline_v1.json` | `schemas/baseline-v1.md`      |
| Gate decisions        | Markdown | `decisoes/decisao_*.md`           | `templates/decision-*.md`     |
| Reports               | Markdown | `relatorios/*.md`                 | `templates/*-report.md`       |
| Execution log         | Markdown | `relatorios/log_execucao.md`      | `rules/logging-discipline.md` |

## Rules for all artifacts

1. **Follow the schema or template exactly.** No extra fields, no missing required fields, no renaming. If a schema says `documento_id`, it is `documento_id`, not `document_id` or `doc_id`.
2. **Every artifact is dated.** Creation date, execution date, or freeze date, depending on artifact type.
3. **Every artifact has a clear identity.** Document ID, experiment ID, run ID — whatever the schema requires.
4. **No placeholders in final artifacts.** No `TODO`, no `TBD`, no `XXX`, no `...`, no lorem ipsum. If a value is not known, the field either is optional per schema or the artifact is not ready.
5. **No redaction of negative results.** If a benchmark failed a threshold, the artifact states the failure, not a cleaned-up version.
6. **No inline commentary in JSON.** JSON files are data. Commentary goes in the corresponding Markdown report.

## Rules for JSON artifacts

1. UTF-8, no BOM.
2. Pretty-printed with 2-space indentation.
3. Keys match the schema exactly, including casing.
4. Dates in ISO 8601 (`YYYY-MM-DD` or `YYYY-MM-DDTHH:MM:SSZ` when time is required).
5. Monetary values in integer cents.
6. CPFs as 11-digit strings, no formatting.
7. CNPJs as 14-digit strings, no formatting.
8. Arrays ordered deterministically (per document ID, per page number, etc.), not by insertion order.
9. Every artifact validates against its JSON Schema via `ajv` before being considered complete.

## Rules for Markdown artifacts

1. Use the template in `.claude/templates/` verbatim, fill in the gaps, do not reorder sections.
2. Tables use Markdown pipe syntax with aligned columns.
3. Numerical results are reported with the precision specified by the plan (CER to 3 decimals, percentages to 1 decimal, accuracy to 2 decimals, times in ms as integers).
4. Every claim of metric achievement references the source JSON artifact that contains the raw number.
5. Decision files state the decision in the first heading, before any justification.
6. Reports include a date, the name of the author (Claude Code), and a space for the technical lead's signature where applicable.

## Rules for the anchor catalog and parser sketch outputs

The anchor catalog is a deliverable that will feed Phase 1. It must be complete, precise, and machine-readable. Human-validated observations about OCR artifacts and variant forms belong in the `observacoes` field of each anchor entry, not scattered across reports.

## Review before declaring an artifact done

Before logging an activity as CONCLUDED:

1. Run the validation script corresponding to the artifact type (see `commands/validate-deliverables.md`).
2. Open the artifact and visually confirm no placeholders remain.
3. Check the schema file one more time. No renamed fields.
4. Log the artifact path in the activity log entry under `Outputs`.

## Rules for multilingual content

- Code, logs, and Claude-authored reports: **English**.
- Plan-specified deliverables that mandate Portuguese wording (e.g., decision files, variability report, final report, execution log): follow the exact wording required by `fase0_plano_execucao.md` and the corresponding template in `.claude/templates/`. When the plan does not specify, default to Portuguese, since the plan is in Portuguese and the document domain is Brazilian notary law.
- JSON field names follow the plan's Portuguese names exactly (`documento_id`, `cpf`, `matricula`, etc.).
