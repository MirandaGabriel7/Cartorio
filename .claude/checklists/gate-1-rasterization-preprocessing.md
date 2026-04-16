# Checklist — Gate 1 (Rasterization + Preprocessing)

Use before raising the Gate 1 signal. Every item must be checked with evidence (file path + specific value/section).

---

## Rasterization sub-gate

- [ ] Rasterization benchmark executed per `playbooks/rasterization-benchmark.md`.
- [ ] `benchmarks/rasterizacao/resultados_rasterizacao.json` exists and validates against `schemas/rasterization-results.md`.
- [ ] Sample contained exactly 20 documents covering the required quotas (ESC-BOA, ESC-DEG, MAT-ATUAL-BOA, MAT-MONO, ESC-MARCA).
- [ ] Both `mupdf` and `poppler` executed on every sample × DPI combination.
- [ ] DPIs tested: 300 and 400.
- [ ] Rasterization error rate for chosen primary library = 0%.
- [ ] Mean time of primary library ≤ 1.5 × mean time of alternative.
- [ ] Effective resolution confirmed on 100% of runs (width ≈ expected_inches × DPI within 2%).
- [ ] Visual inspection completed on 10 documents, checklist per image recorded in the JSON.
- [ ] Chosen primary library produces equal or sharper text in ≥ 18 of 20 documents.

## Preprocessing sub-gate

- [ ] Preprocessing benchmark executed per `playbooks/preprocessing-benchmark.md`.
- [ ] `benchmarks/preprocessamento/preprocessamento_resultados.json` exists and validates against `schemas/preprocessing-results.md`.
- [ ] All six experiments (A–F) executed on the 30-document calibration corpus.
- [ ] Parameters for each experiment recorded in the JSON.
- [ ] Mean CER reduction (winning experiment vs. A) ≥ 20%.
- [ ] Watermark filtering rate ≥ 95% on pages with watermarks.
- [ ] No case of legitimate text removal by preprocessing (verified by visual inspection + per-field CER).
- [ ] Winning experiment ID recorded, with parameters.

## Documentation

- [ ] Activity log entries present for every step executed.
- [ ] Every re-run and parameter adjustment recorded with timestamps and justification.
- [ ] No `TODO` / placeholder in any generated JSON or report.
- [ ] `decisoes/decisao_rasterizacao.md` drafted using `templates/decision-rasterization.md`, all sections filled.
- [ ] Technical lead's signature line present but not prefilled.

## Cross-checks

- [ ] Number of documents in benchmark JSONs = expected (20 for rasterization, 30 for preprocessing).
- [ ] Rasterization library chosen in decision file matches the library used in preprocessing benchmark.
- [ ] Winning preprocessing experiment ID matches the one cited in the decision file.

## Prohibitions verified

- [ ] No internet calls during benchmark execution.
- [ ] No generative AI in the pipeline.
- [ ] No documents excluded without logged justification.
- [ ] No ground truth edited during benchmark execution.

## Final action

- [ ] All items above are checked with evidence.
- [ ] `🚩 GATE 1 — READY FOR APPROVAL` entry added to `relatorios/log_execucao.md` using `templates/gate-signal.md`.
- [ ] Decision file path stated in the log entry.
- [ ] Activity halted; waiting for technical lead approval.
