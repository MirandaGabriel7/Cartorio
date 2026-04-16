# Checklist — Mandatory Deliverables

The 15 mandatory deliverables of Phase 0 per Section 11 of the plan. Each item records: path, producer, completion criterion, verified evidence.

---

| #   | Path                                                           | Format   | Producer                      | Completion criterion                                                     | Verified |
| --- | -------------------------------------------------------------- | -------- | ----------------------------- | ------------------------------------------------------------------------ | -------- |
| 1   | `corpus/corpus_catalog.json`                                   | JSON     | Claude Code + human annotator | ≥ 145 documents, schema valid, required fields present                   | [ ]      |
| 2   | `corpus/anonimizados/**/*.pdf`                                 | PDF      | Human annotators + script     | ≥ 145 PDFs anonymized, second-annotator verified                         | [ ]      |
| 3   | `corpus/ground_truth/*_gt.json`                                | JSON     | Human annotators              | ≥ 30 docs with 2 annotators, rest 1 annotator + 20% review, schema valid | [ ]      |
| 4   | `benchmarks/rasterizacao/resultados_rasterizacao.json`         | JSON     | Claude Code                   | 20 docs × 2 libs × 2 DPIs, all fields filled                             | [ ]      |
| 5   | `benchmarks/preprocessamento/preprocessamento_resultados.json` | JSON     | Claude Code                   | 6 experiments × calibration corpus, CER before/after, visual inspection  | [ ]      |
| 6   | `benchmarks/ocr/ocr_benchmark_relatorio.json`                  | JSON     | Claude Code                   | 2 engines × 30 docs, CER per field class, gate results                   | [ ]      |
| 7   | `parser_sketch/catalogo_ancoras.json`                          | JSON     | Claude Code + human review    | ≥ 80% coverage of Section 17 fields                                      | [ ]      |
| 8   | `parser_sketch/parser_sketch_resultados.json`                  | JSON     | Claude Code                   | Accuracy per field, 30 docs                                              | [ ]      |
| 9   | `baseline/fase0_baseline_v1.json`                              | JSON     | Claude Code                   | Full pipeline over 30 docs, hash verifiable                              | [ ]      |
| 10  | `decisoes/decisao_rasterizacao.md`                             | Markdown | Claude Code + human approval  | Engine, metrics, justification                                           | [ ]      |
| 11  | `decisoes/decisao_motor_ocr.md`                                | Markdown | Claude Code + human approval  | Engine, metrics, exceptions if any                                       | [ ]      |
| 12  | `decisoes/decisao_parser_sketch.md`                            | Markdown | Claude Code + human approval  | Feasibility confirmed, open fields listed                                | [ ]      |
| 13  | `relatorios/relatorio_variabilidade_documental.md`             | Markdown | Claude Code                   | Observed format variations, cartório differences                         | [ ]      |
| 14  | `relatorios/relatorio_final_fase0.md`                          | Markdown | Claude Code + human approval  | Synthesis of decisions, final metrics, Phase 1 recommendations           | [ ]      |
| 15  | `relatorios/log_execucao.md`                                   | Markdown | Claude Code                   | Chronological record of all activities                                   | [ ]      |

---

## Verification procedure

For each item:

1. Confirm the file exists at the exact path.
2. Run the matching validator (JSON schema via `ajv`, or visual-read for Markdown).
3. Check that no `TODO` / placeholder remains.
4. Check that all numeric values cited in Markdown files come from a source JSON, and that JSON is present.
5. For items 10–14, confirm the signature line is present; only items that require it (per templates) are prefilled with the date and name after the technical lead signs.

## Rules

- No substitutions. A file at a different path does not count.
- No "equivalent" content. The schemas are exact.
- No skipping an item because it seems redundant.
- Partial completion does not count. An item is either verified or not.

## Linkage to gates

- Deliverables 4–5 tie to Gate 1.
- Deliverable 6 ties to Gate 2.
- Deliverables 7–8 tie to Gate 3.
- Deliverable 9 follows all three gates.
- Deliverables 10–12 are the gate decision records themselves.
- Deliverables 13–15 wrap Phase 0.
