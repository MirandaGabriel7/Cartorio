# Gate 1 — Rasterization + Preprocessing

**Scope:** Rasterization library and preprocessing profile for the Phase 0 pipeline.
**Decision file:** `decisoes/decisao_rasterizacao.md`
**Authority:** Technical lead (human).
**Prerequisites:** None — this is the first gate.
**Source:** Section 10.1 of the plan.

---

## Conditions (all must be true)

| # | Condition | Evidence |
|---|---|---|
| 1 | Rasterization library chosen between mupdf and poppler, per criteria in Section 4.5 | `benchmarks/rasterizacao/resultados_rasterizacao.json`, `agregados.gate_1_rasterizacao_sub_criterios` |
| 2 | Rasterization error rate = 0% on the 20-document sample | `agregados.<chosen>.taxa_erro == 0` |
| 3 | Preprocessing pipeline produces general CER reduction ≥ 20% vs. raw baseline (Experiment A), averaged across the 30-document calibration corpus | `benchmarks/preprocessamento/preprocessamento_resultados.json`, `gate_1_preprocessamento_sub_criterios.reducao_cer_geral_pct` |
| 4 | Correct watermark filtering ≥ 95% on pages with watermarks | `gate_1_preprocessamento_sub_criterios.taxa_filtragem_marca_dagua_pct` |
| 5 | Zero cases of legitimate text removal by preprocessing | `gate_1_preprocessamento_sub_criterios.condicao_3_sem_perda_texto_legitimo == true` |
| 6 | `decisoes/decisao_rasterizacao.md` complete per `templates/decision-rasterization.md` | The file itself |

## Rejection conditions

Any of the above not met.

## Corrective action

- If rasterization fails: swap the primary library (mupdf ↔ poppler) and re-run the benchmark. If both fail on reliability, investigate the failing documents, exclude them only with documented justification and technical-lead approval, re-run.
- If CER reduction < 20%: adjust denoising and binarization parameters; test ENHANCED / AGGRESSIVE profiles; re-run as a new experiment ID (e.g., `EXPERIMENT_E_v2`).
- If watermark filtering < 95%: refine detection thresholds; adjust Hough parameters and angle ranges; re-run.
- If legitimate text loss: identify the responsible stage; reduce aggressiveness for the affected document class; create a document-type-specific profile if needed.

## Approval protocol

1. Claude Code: complete `checklists/gate-1-rasterization-preprocessing.md`.
2. Claude Code: draft `decisoes/decisao_rasterizacao.md` using the template.
3. Claude Code: raise `🚩 GATE 1 — READY FOR APPROVAL` entry in the log using `templates/gate-signal.md`.
4. Claude Code: stop. Wait.
5. Technical lead: review the decision file and supporting artifacts.
6. Technical lead: sign the decision file (fill the approval block).
7. Technical lead (or via Claude dictation): add `✅ GATE 1 APPROVED` entry to the log.

## Activities unlocked by approval

- Gate 2 (OCR benchmark).
- Continued ground-truth annotation (parallelizable per Section 9).

## Activities forbidden before approval

- Starting the OCR benchmark (#8).
- Starting parser-sketch activities (#9, #10).
- Freezing the baseline.

## Rules

- Claude never approves this gate.
- Claude never proceeds past this gate unapproved.
- Claude never tunes preprocessing parameters to favor a specific result after seeing metrics.
- Claude never excludes documents from the sample to improve aggregates.