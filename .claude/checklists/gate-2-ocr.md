# Checklist — Gate 2 (OCR Engine)

Use before raising the Gate 2 signal. Every item must be checked with evidence (file path + specific value/section).

---

## Preconditions

- [ ] Gate 1 approved (decision file signed, `GATE 1 APPROVED` log entry present).
- [ ] Calibration corpus of 30 documents with 2-annotator ground truth ready.
- [ ] All `discordancias_resolvidas` flags set to true on calibration corpus.

## Benchmark execution

- [ ] OCR benchmark executed per `playbooks/ocr-benchmark.md`.
- [ ] Tesseract 5 invoked with `oem=1`, `psm=3`, `lang=por`, `tessdata_dir=C:\Program Files\Tesseract-OCR\tessdata`.
- [ ] `tessdata_best/por.traineddata` confirmed present and used.
- [ ] PaddleOCR invoked with `use_angle_cls=True`, `lang=pt`, `use_gpu=False`.
- [ ] Doctr NOT included in the benchmark.
- [ ] All 30 calibration documents processed by both engines.
- [ ] Preprocessing applied: winning experiment from Gate 1.
- [ ] DPI used: 300.

## Results

- [ ] `benchmarks/ocr/ocr_benchmark_relatorio.json` exists and validates against `schemas/ocr-benchmark-report.md`.
- [ ] Per-page OCR outputs saved under `benchmarks/ocr/ocr_resultados/<motor>/<documento_id>/pagina_<n>.json`.
- [ ] CER computed with `fastest-levenshtein` using the specified normalization (uppercase, strip accents, collapse whitespace, remove punctuation, trim).
- [ ] Per-field CER computed: CPF/CNPJ, matrícula, nomes, texto geral.
- [ ] Mean processing time per page recorded per engine.

## Thresholds (at least one engine must meet all four)

- [ ] At least one engine achieves CER CPF/CNPJ ≤ 0.01.
- [ ] At least one engine achieves CER matrícula ≤ 0.01.
- [ ] At least one engine achieves CER nomes ≤ 0.03.
- [ ] At least one engine achieves CER texto geral ≤ 0.05.

## Selection

- [ ] Selection rule applied per Section 6.5:
  - Both pass → lower weighted CER wins; ties (≤ 0.5%) go to Tesseract.
  - Only one passes → that engine wins.
  - Neither passes → return to preprocessing refinement; after 2 failed iterations, escalate.
- [ ] Weighted CER computed with weights 3 / 3 / 2 / 1.
- [ ] Chosen engine and preprocessing profile documented together.

## Documentation

- [ ] Activity log entries present for every step.
- [ ] `decisoes/decisao_motor_ocr.md` drafted using `templates/decision-ocr-engine.md`, all sections filled.
- [ ] Exceptions (if any) documented with justification.
- [ ] Technical lead's signature line present but not prefilled.

## Cross-checks

- [ ] Number of documents in OCR benchmark JSON = 30.
- [ ] Preprocessing profile cited in the decision file matches the Gate 1 winning experiment.
- [ ] Engine version recorded in the decision file (e.g., `tesseract-5.3.4`, `paddleocr-2.7.3`).

## Prohibitions verified

- [ ] No internet calls during OCR benchmark.
- [ ] No generative AI used for OCR.
- [ ] No ground-truth edits since Gate 1 approval.
- [ ] No on-the-fly parameter tuning to improve specific documents.

## Final action

- [ ] All items above are checked with evidence.
- [ ] `🚩 GATE 2 — READY FOR APPROVAL` entry added to `relatorios/log_execucao.md` using `templates/gate-signal.md`.
- [ ] Decision file path stated in the log entry.
- [ ] Activity halted; waiting for technical lead approval.
