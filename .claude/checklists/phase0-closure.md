# Checklist — Phase 0 Closure

Use immediately before signaling Phase 0 complete for the technical lead's final approval. Every item must be verified with evidence.

---

## Corpus

- [ ] `corpus/corpus_catalog.json` valid against schema with ≥ 145 documents.
- [ ] All catalog entries have `anonimizacao_verificada: true` or `status: "ERRO"` with justification.
- [ ] ≥ 30 documents with 2-annotator ground truth and resolved discordances.
- [ ] Remaining documents (31–145) have 1-annotator ground truth with ≥ 20% review-by-second-annotator coverage.
- [ ] `scripts/validar_corpus_catalog.ts` passes without errors.
- [ ] `scripts/validar_ground_truth.ts` passes without errors.

## Benchmark artifacts

- [ ] `benchmarks/rasterizacao/resultados_rasterizacao.json` complete (20 docs × 2 libs × 2 DPIs).
- [ ] `benchmarks/preprocessamento/preprocessamento_resultados.json` complete (6 experiments × calibration corpus).
- [ ] `benchmarks/ocr/ocr_benchmark_relatorio.json` complete (2 engines × 30 docs with per-field CER).

## Parser sketch artifacts

- [ ] `parser_sketch/catalogo_ancoras.json` present with coverage ≥ 80% of Section 17 fields for ≥ 80% of docs.
- [ ] `parser_sketch/parser_sketch_resultados.json` present with per-field accuracy.
- [ ] All four critical fields ≥ 85% accuracy.

## Gate decisions

- [ ] `decisoes/decisao_rasterizacao.md` present, complete, signed by technical lead.
- [ ] `decisoes/decisao_motor_ocr.md` present, complete, signed by technical lead.
- [ ] `decisoes/decisao_parser_sketch.md` present, complete, signed by technical lead.
- [ ] `GATE 1 APPROVED`, `GATE 2 APPROVED`, `GATE 3 APPROVED` log entries all present.

## Baseline

- [ ] `baseline/fase0_baseline_v1.json` present.
- [ ] Hash recorded inside the file or in a sidecar `.sha256` file, verifiable.
- [ ] Freeze timestamp present (`data_congelamento`).
- [ ] Pipeline composition (rasterization lib, preprocessing profile, OCR engine, parser sketch version) matches the approved decision files.
- [ ] Self-consistency check executed (`baseline vs baseline` → 0 regressions, 0 improvements).

## Reports

- [ ] `relatorios/relatorio_variabilidade_documental.md` complete, no placeholders.
- [ ] `relatorios/relatorio_final_fase0.md` complete per `playbooks/final-report.md`, all sections filled, signature block blank.
- [ ] `relatorios/log_execucao.md` updated through the final activity.

## Quality bar

- [ ] No `TODO`, `TBD`, `XXX`, `placeholder`, or `lorem` strings anywhere in the repository.
- [ ] No open pending decisions other than those explicitly deferred to Phase 1 in the final report.
- [ ] No uncommitted JSON artifacts that would be required for auditability.
- [ ] `.gitignore` excludes original PDFs, anonymized PDFs, `temp/`, `node_modules/`, sample image folders.

## Deliverables

- [ ] All 15 deliverables in `checklists/mandatory-deliverables.md` verified present and valid.

## Approval preparation

- [ ] `relatorios/log_execucao.md` ends with an entry `PHASE 0 READY FOR FINAL APPROVAL` citing every evidence path.
- [ ] The technical lead notified.
- [ ] Claude Code does NOT declare Phase 0 complete. Waits for the technical lead's signature on the final report.

## After approval (recorded by the technical lead)

- [ ] Technical lead signs the final report (date, name, signature).
- [ ] Log entry `PHASE 0 COMPLETED AND APPROVED BY TECHNICAL LEAD` added.
- [ ] Phase 1 authorization recorded.
