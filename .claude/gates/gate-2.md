# Gate 2 — OCR Engine

**Scope:** Primary OCR engine selection between Tesseract 5 and PaddleOCR.
**Decision file:** `decisoes/decisao_motor_ocr.md`
**Authority:** Technical lead (human).
**Prerequisites:** Gate 1 approved. Calibration corpus of 30 documents with 2-annotator ground truth and resolved discordances.
**Source:** Section 10.1 of the plan.

---

## Conditions (all must be true)

| # | Condition | Evidence |
|---|---|---|
| 1 | At least one engine meets ALL four CER thresholds (≤ 0.01 CPF/CNPJ, ≤ 0.01 matrícula, ≤ 0.03 nomes, ≤ 0.05 texto geral) | `benchmarks/ocr/ocr_benchmark_relatorio.json`, `resultados_por_motor.<motor>.todos_limiares_aprovados == true` |
| 2 | Measurement performed on the 30-document calibration corpus | `corpus_calibracao_total == 30`; cross-check with catalog |
| 3 | Ground truth for the 30 documents has 2 annotators and all discordances resolved | Every `*_gt.json` for the calibration corpus has `discordancias_resolvidas: true` and `anotador_secundario != null` |
| 4 | `decisoes/decisao_motor_ocr.md` complete per `templates/decision-ocr-engine.md` | The file itself |

## Rejection conditions

- No engine meets all four thresholds.
- Calibration corpus incomplete.
- Discordances unresolved.
- Decision file incomplete.

## Corrective action

Per Section 6.5 of the plan: **never swap engines first.** Refine preprocessing. Possible adjustments:

- Test more aggressive denoising parameters.
- Test Sauvola with different `k` / `window_size`.
- Enable or tune contrast normalization.
- Test `ENHANCED` or `AGGRESSIVE` preprocessing profiles.

After **2 refinement iterations** without success: escalate to the technical lead with the full record of metrics obtained. Do not continue silently.

Each refinement iteration:

- Has a new experiment ID (e.g., `EXPERIMENT_E_v2`, `EXPERIMENT_E_v3`).
- Is logged as a new activity entry.
- Is recorded as `CorrectiveIteration` in the OCR benchmark report.
- Retains the prior run's artifacts with `_runN` suffix.

## Selection rules (when Gate conditions are met)

Per Section 6.5:

- **Both engines pass:** choose the engine with lower weighted CER (weights 3 / 3 / 2 / 1). Tie within 0.5% → Tesseract (simpler packaging).
- **Only one passes:** choose that engine.
- **Neither passes:** corrective action above.

## Approval protocol

1. Claude Code: complete `checklists/gate-2-ocr.md`.
2. Claude Code: draft `decisoes/decisao_motor_ocr.md` using the template.
3. Claude Code: raise `🚩 GATE 2 — READY FOR APPROVAL` entry in the log.
4. Claude Code: stop. Wait.
5. Technical lead: review and sign the decision file.
6. `✅ GATE 2 APPROVED` entry appended to the log.

## Activities unlocked by approval

- Gate 3 (parser sketch).
- Continued annotation of documents 31–145 (parallelizable).

## Activities forbidden before approval

- Starting parser-sketch activities (#9, #10).
- Freezing the baseline.
- Drafting the final report.

## Rules

- Claude never approves this gate.
- Claude never swaps engines without exhausting preprocessing refinement first.
- Claude never adjusts the calibration corpus after measuring (no adding, removing, or re-annotating documents to change the result).
- Claude never alters ground truth to match OCR output.