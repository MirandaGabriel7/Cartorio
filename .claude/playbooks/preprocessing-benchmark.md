# Playbook — Preprocessing Benchmark

Governs the execution of the preprocessing benchmark specified in Section 5 of the plan. Evaluate six experiments (A–F) against the calibration corpus to choose the preprocessing profile that meets the Gate 1 preprocessing sub-criteria.

---

## Preconditions

- Rasterization benchmark completed and rasterization library selected.
- Calibration corpus of 30 documents fully annotated by 2 annotators.
- OpenCV, NumPy, Pillow installed per `requirements.txt`.
- Activity start logged.

## Experiments

| ID  | Description                                      | Sequence                                                                                    |
| --- | ------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| A   | Baseline (no preprocessing)                      | raw image → OCR                                                                             |
| B   | Deskew only                                      | `deskew`                                                                                    |
| C   | Deskew + light denoising                         | `deskew` → `denoise_leve`                                                                   |
| D   | Deskew + medium denoising + Sauvola binarization | `deskew` → `denoise_medio` → `binarizar_sauvola`                                            |
| E   | Full pipeline                                    | `deskew` → `normalizar_contraste` → `denoise_medio` → `binarizar_sauvola` → `limpar_bordas` |
| F   | Full + watermark detection/attenuation           | `detectar_marca_dagua` → `atenuar_marca_dagua` → Experiment E                               |

All experiment code is in `ferramentas/preprocessamento/preprocessar_pagina.py` and related helpers per Section 5 of the plan.

## Parameters

| Parameter                      | Value                                       |
| ------------------------------ | ------------------------------------------- | ----- | ----- |
| Skew safety limit              | abs(angle) in [0.5°, 15°] to apply rotation |
| `denoise_leve`                 | h=5, template window 7, search window 21    |
| `denoise_medio`                | h=10, template window 7, search window 21   |
| Sauvola `window_size`          | 25                                          |
| Sauvola `k`                    | 0.2                                         |
| Sauvola `R`                    | 128.0                                       |
| CLAHE `clipLimit`              | 2.0                                         |
| CLAHE `tileGridSize`           | (8, 8)                                      |
| Border cleanup margin          | 2%                                          |
| Lateral watermark band         | 8% of width                                 |
| Hough threshold                | 100                                         |
| Hough minLineLength            | 200                                         |
| Hough maxLineGap               | 20                                          |
| Diagonal watermark angle range | 20° <                                       | angle | < 70° |

Declare these in the activity log entry before execution.

## Protocol

### Step 1 — Run each experiment

For each document in the calibration corpus, for each experiment A–F:

1. Rasterize the document's pages at 300 DPI using the library chosen in Gate 1.
2. Apply the preprocessing sequence.
3. Record watermark detection metadata (`marca_dagua_lateral`, `marca_dagua_diagonal`, `marca_dagua_atenuada`).
4. Run OCR on the preprocessed image (Tesseract 5 with `tessdata_best/por`).
5. Compute CER per field (CPF, matrícula, nomes, texto geral) against ground truth.
6. Record per-experiment per-document per-page metrics in `benchmarks/preprocessamento/preprocessamento_resultados.json` per `schemas/preprocessing-results.md`.

### Step 2 — Visual inspection

For a rotating sample of preprocessed pages (at minimum 5 per experiment), apply the visual checklist:

| Criterion                         | Approval condition                                           |
| --------------------------------- | ------------------------------------------------------------ |
| Main text readable                | All characters of main body discernible individually         |
| No color inversion                | Text dark on light background across 100% of text area       |
| No character loss                 | No main-text character lost by preprocessing compared to raw |
| Watermark attenuated (if present) | Watermark is not the dominant visual element in its region   |
| Character edges preserved         | Thin-stroke chars (i, l, 1, t) still legible                 |

Record per-page visual inspection results in the `inspecao_visual` field.

### Step 3 — Compute CER reduction

For each document and field:

- CER_before = CER on Experiment A (raw).
- CER_after = CER on the candidate experiment.
- Reduction% = (CER_before − CER_after) / CER_before × 100.

Aggregate reductions per experiment across the calibration corpus.

### Step 4 — Watermark handling metrics

For pages with watermarks (known from catalog or detected):

- Percentage of pages where watermark was detected.
- Percentage of pages where attenuation was applied and no legitimate text was removed.

### Step 5 — Apply Gate 1 preprocessing sub-criteria

Gate 1 preprocessing is approved when all:

1. General CER reduction ≥ 20% vs. Experiment A, averaged over the calibration corpus.
2. Correct watermark filtering ≥ 95% on pages containing watermarks.
3. No case of legitimate text removal by preprocessing (verified via visual inspection + per-field CER comparison — a field whose CER worsened after preprocessing requires investigation).

The "winning" experiment is the one that:

1. Never causes legitimate text loss.
2. Has the largest mean CER reduction.
3. Detects and attenuates watermarks on ≥ 95% of cases.

Typically this will be Experiment E or F. Do not hardcode that assumption. Let the data select.

### Step 6 — Corrective action if gate fails

- Reduction < 20%: try stricter denoising / different binarization parameters; define and run `EXPERIMENT_E_v2` or `EXPERIMENT_F_v2` with declared parameter changes; do not modify existing experiment IDs.
- Watermark filtering < 95%: refine detection thresholds and Hough parameters; re-run F only.
- Legitimate text loss: reduce denoising aggressiveness for affected document types; consider document-type-specific profile.

Each retry is a new experiment ID with its own output section. Never overwrite existing experiment results.

### Step 7 — Hand off

Once the winning experiment is identified and validated:

1. Record the chosen experiment ID and full parameters in the JSON summary.
2. Log `CONCLUDED`.
3. Hand off to `gate-verifier` with the preprocessing portion of Gate 1 ready.

## Integrity reminders

- Parameters are frozen before execution.
- Never tune parameters on a per-document basis to improve a specific result.
- Preserve all experiment outputs, including failed ones.
- Watermark detection metadata is a data point, not an opinion — record what the detector returns.

## What not to do

- Do not introduce new experiments without logging and approval.
- Do not skip experiments A–C as "obviously inferior".
- Do not compute reductions against a wrong or out-of-date baseline.
- Do not manually edit the generated preprocessed images.
