# Command — Validate Deliverables

Procedure to validate every deliverable at any point in Phase 0. Invoke before signaling a gate, before freezing the baseline, and before declaring Phase 0 ready for final approval.

---

## Sequence

### 1. Open the checklist

`checklists/mandatory-deliverables.md`. The checklist enumerates all 15 deliverables with their paths and completion criteria.

### 2. Verify each JSON deliverable

For every JSON artifact, run schema validation. Expected scripts:

| Artifact | Command |
|---|---|
| `corpus/corpus_catalog.json` | `npm run validar:corpus` |
| `corpus/ground_truth/*_gt.json` | `npm run validar:gt` |
| `benchmarks/rasterizacao/resultados_rasterizacao.json` | Schema validation via `ajv` against `schemas/rasterization-results.md` |
| `benchmarks/preprocessamento/preprocessamento_resultados.json` | Schema validation via `ajv` against `schemas/preprocessing-results.md` |
| `benchmarks/ocr/ocr_benchmark_relatorio.json` | Schema validation via `ajv` against `schemas/ocr-benchmark-report.md` |
| `parser_sketch/catalogo_ancoras.json` | Schema validation via `ajv` against `schemas/anchors-catalog.md` |
| `parser_sketch/parser_sketch_resultados.json` | Schema validation via `ajv` against `schemas/parser-sketch-results.md` |
| `baseline/fase0_baseline_v1.json` | Schema validation + hash re-verification per the freeze decision record |

Record any schema validation errors. Schema validation must return 0 errors for the deliverable to be considered complete.

### 3. Verify each Markdown deliverable

For every Markdown artifact:

- Confirm the file exists at the expected path.
- Open and scan for placeholders: `TODO`, `TBD`, `XXX`, `...`, `lorem`, `<...>`.
- Confirm that every section of the corresponding template is present and filled.
- Confirm signature blocks are present.
- For decision files, confirm the technical lead's approval section is either signed (post-approval) or present-but-blank (pre-approval), never prefilled by Claude.

### 4. Cross-checks

- `tipo_documento` in ground truth matches catalog entry.
- `documento_id` consistent across catalog, ground truth, benchmark outputs, and baseline.
- Engine version in the OCR benchmark matches `decisoes/decisao_motor_ocr.md`.
- Preprocessing profile in the baseline matches `decisoes/decisao_rasterizacao.md` and `benchmarks/preprocessamento/preprocessamento_resultados.json`.
- All 30 calibration documents appear in every relevant benchmark artifact.

### 5. Numeric consistency

For every metric cited in a Markdown deliverable (decisions, reports), verify the number is also present in a JSON artifact and matches exactly (with the precision rules of `context/metrics-thresholds.md`).

### 6. Produce the validation report

Append to `relatorios/log_execucao.md`:

```markdown
## [YYYY-MM-DD HH:MM] Activity: Validate deliverables

**Status:** CONCLUDED
**Duration:** <X hours>
**Summary:** Ran schema validation and cross-checks on all 15 mandatory deliverables.
**Parameters declared:** n/a
**Outputs:** relatorios/validacao_entregaveis.json (if generated); entries updated in checklists/mandatory-deliverables.md.
**Issues encountered:**
- <none | list of findings with artifact path and severity>
**Next activity:** <proceed with signal / block until findings fixed>
```

### 7. If findings exist

- If critical (schema invalid, required artifact missing, numbers inconsistent): stop. Do not signal the gate or freeze the baseline. Fix and re-validate.
- If minor (e.g., `observacoes` field empty where an empty string is acceptable): record and continue.

## Hard rules

- Never mark a deliverable as verified based on appearance alone. Run the validator.
- Never fabricate validation results. If validation failed, record the failure.
- Never fix a numeric inconsistency by editing the Markdown to match the JSON without logging a technical decision explaining the discrepancy.
- Never consider a deliverable "close enough" — binary: verified or not.