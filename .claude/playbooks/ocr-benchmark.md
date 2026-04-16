# Playbook — OCR Benchmark

Governs the execution of the OCR benchmark specified in Section 6 of the plan. Decide between Tesseract 5 and PaddleOCR as the primary OCR engine.

---

## Preconditions

- Gate 1 approved: rasterization library chosen, winning preprocessing experiment identified.
- Calibration corpus (30 documents, 2 annotators, discordances resolved).
- Tesseract 5 with `tessdata_best/por.traineddata` installed per Section 2.5.
- PaddleOCR installed per `requirements.txt`.
- `fastest-levenshtein` installed via npm.
- Activity start logged.

## Engines

- **Tesseract 5**: invoked via `node-tesseract-ocr` with `oem=1`, `psm=3`, `lang=por`, `tessdata_dir=C:\Program Files\Tesseract-OCR\tessdata`. Confidence extracted via TSV mode.
- **PaddleOCR**: invoked via the Python worker `ferramentas/ocr_workers/paddleocr_worker.py` with `use_angle_cls=True`, `lang=pt`, `use_gpu=False`, `show_log=False`. Stdout returns JSON with text, blocks, and mean confidence.
- **Doctr is excluded** from this benchmark per Section 6.1.

## Protocol

### Step 1 — Rasterize and preprocess

For each document in the calibration corpus:

1. Rasterize every page at 300 DPI using the library chosen in Gate 1.
2. Apply the winning preprocessing experiment (typically E or F).
3. Save preprocessed pages into `temp/preprocessadas/<documento_id>/`.

### Step 2 — Run OCR

For each preprocessed page, for each engine:

1. Run OCR.
2. Record: full text, mean confidence, per-block list (text + confidence + bbox), processing time, used preprocessing profile.
3. Save per-page JSON to `benchmarks/ocr/ocr_resultados/{motor}/{documento_id}/pagina_{n}.json`.

### Step 3 — CER measurement

Use `fastest-levenshtein`. Normalize both OCR output and ground truth identically:

```
uppercase → strip accents (NFD decomposition) → collapse whitespace → remove punctuation → trim
```

Compute CER as `editDistance(ocr, gt) / gt.length`.

### Step 4 — Per-field CER

For each document:

- **CPF/CNPJ** — extract digits only, compare.
- **Matrícula** — extract number, compare.
- **Nomes próprios** — full name normalized (no accents, uppercase).
- **Texto geral** — full page text excluding footers and watermarks (per preprocessing metadata).

### Step 5 — Aggregate per engine

Write `benchmarks/ocr/ocr_benchmark_relatorio.json` per `schemas/ocr-benchmark-report.md` with:

- CER per field class per engine.
- Mean time per page per engine.
- Gate pass/fail per field per engine.
- Full per-document detail in `detalhamento_por_documento`.

### Step 6 — Apply Gate 2 criteria

An engine passes when it meets all:

| Metric          | Threshold |
| --------------- | --------- |
| CER CPF/CNPJ    | ≤ 0.01    |
| CER Matrícula   | ≤ 0.01    |
| CER Nomes       | ≤ 0.03    |
| CER Texto geral | ≤ 0.05    |

Selection rules:

- If both engines pass: choose the one with lower weighted CER (weight 3 for CPF/CNPJ and matrícula, weight 2 for names, weight 1 for general text). Tie within 0.5% → choose Tesseract for simpler packaging.
- If only one passes: choose that one.
- If neither passes: **do not swap engine first**. Refine preprocessing. After 2 refinement iterations, escalate to the technical lead.

### Step 7 — Cross-check with ground truth resolution

Before declaring Gate 2 ready, confirm:

- All 30 calibration documents have fully resolved ground truth (no open `discordancias_resolvidas: false`).
- The number of documents used in the CER aggregate equals 30.

If any is missing, pause until corpus steward provides resolution.

### Step 8 — Hand off

- Log `CONCLUDED`.
- Hand off to `gate-verifier` for Gate 2.

## Integrity reminders

- Same calibration corpus as preprocessing benchmark, same preprocessing profile, same DPI.
- Engines evaluated with exactly the configurations above. No per-document engine tweaks.
- PaddleOCR model weights are whatever was installed at setup; record the version.
- Tesseract tessdata must be `tessdata_best`, not the installer's default. Verify the SHA of the file if possible.

## What not to do

- Do not add engines beyond Tesseract and PaddleOCR.
- Do not reduce calibration corpus size.
- Do not switch preprocessing profiles between documents during the benchmark.
- Do not re-run only the failing documents with different parameters.
