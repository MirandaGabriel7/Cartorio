# Playbook — Final Report

Governs the writing of `relatorios/relatorio_final_fase0.md`. The final report synthesizes the three gate decisions, cites baseline metrics, lists deliverables, and recommends next steps for Phase 1.

---

## Preconditions

- All three gates approved (decision files signed, `GATE N APPROVED` log entries present).
- Baseline frozen and hashed.
- `relatorios/relatorio_variabilidade_documental.md` complete.
- Activity start logged.

## Source inputs (read, do not duplicate)

- `decisoes/decisao_rasterizacao.md`
- `decisoes/decisao_motor_ocr.md`
- `decisoes/decisao_parser_sketch.md`
- `baseline/fase0_baseline_v1.json`
- `benchmarks/**/*.json`
- `parser_sketch/catalogo_ancoras.json`
- `parser_sketch/parser_sketch_resultados.json`
- `relatorios/relatorio_variabilidade_documental.md`
- `relatorios/log_execucao.md`

## Template

Use `templates/final-report.md` exactly. Do not add sections. Do not reorder sections. Do not drop sections.

## Step 1 — Executive summary

Three paragraphs, no more:

1. Phase 0 result: which libraries, engines, profiles were selected.
2. The risk status: which parts of the pipeline are validated against real documents and which open questions remain for Phase 1.
3. Recommendation: continue to Phase 1 / hold / return to revise specific aspects.

No marketing language. No "successfully completed". State facts.

## Step 2 — Gate decisions summary

For each of the three gates, include:

- Gate name.
- Decision file path.
- Key metrics (with specific numbers from the baseline / benchmark JSONs).
- Date of approval.
- Technical lead's signature reference.

## Step 3 — Pipeline composition

A single authoritative table stating what the Phase 0 pipeline looks like at freeze:

| Component             | Selected                          | Notes |
| --------------------- | --------------------------------- | ----- |
| Rasterization library | mupdf / poppler                   |       |
| DPI                   | 300                               |       |
| Preprocessing profile | EXPERIMENT_X                      |       |
| OCR engine            | tesseract-5.x.x / paddleocr-2.7.3 |       |
| Parser sketch version | 1.0                               |       |

## Step 4 — Final metrics

Pull directly from `baseline/fase0_baseline_v1.json`:

- CER per field class (CPF/CNPJ, matrícula, nomes, texto geral).
- Parser accuracy per critical field.
- Mean OCR time per page.
- Mean rasterization time per page.
- Baseline hash.
- Freeze timestamp.

Reference the baseline file for every number.

## Step 5 — Corpus summary

- Total documents cataloged.
- Breakdown by category.
- Number of documents with 2-annotator ground truth.
- Number of documents with 1-annotator ground truth + 20% review.
- Number of documents flagged `status: "ERRO"`, with aggregated failure stages.
- Total anonymizations verified.

## Step 6 — Open pendencies

List every:

- Field below 85% accuracy that will need refinement in Phase 1.
- Document flagged `ERRO` and its failure stage.
- Known limitation of the parser sketch.
- Section 17 field not covered by the anchor catalog.
- Watermark variant that caused imperfect attenuation.

Each pendency item has: description, evidence file, proposed Phase 1 handling.

## Step 7 — Phase 1 recommendations

Tightly scoped to what Phase 0 data supports. For each recommendation:

- What to do.
- Why the Phase 0 data supports it.
- What success would look like.
- Rough effort estimate (S / M / L).

Do not include speculative recommendations. Do not propose work outside what the plan v1.3 already envisions.

## Step 8 — Risks and mitigations

List the top technical risks visible after Phase 0:

- Corpus coverage gaps (e.g., specific cartórios not yet represented).
- Performance constraints on large documents.
- OCR limits on specific document qualities.
- Parser anchors that depend on fragile patterns.

For each: mitigation carried from Phase 0 + residual risk for Phase 1.

## Step 9 — Deliverables checklist reference

Reference `checklists/mandatory-deliverables.md` with the verified state of each deliverable as of the freeze date.

## Step 10 — Signature block

Leave the technical lead's signature line blank with the formula:

```
Approved by: ____________________
Date: ____________________
Signature: ____________________
```

Do not prefill. Do not sign on behalf of anyone.

## Step 11 — Validate and hand off

- No `TODO`, `TBD`, or placeholder strings in the report.
- All referenced files exist at the paths cited.
- All metrics match the source JSONs.

Log `CONCLUDED` with path `relatorios/relatorio_final_fase0.md`. Signal to the technical lead that Phase 0 is ready for final approval per `checklists/phase0-closure.md`.

## Hard boundaries

- Do not declare Phase 0 complete in the report. Only the technical lead, by signing, does that.
- Do not editorialize beyond what the data supports.
- Do not soften failing metrics; report them as-is.
