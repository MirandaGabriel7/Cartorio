# Template — Decision: OCR Engine

Copy this template to `decisoes/decisao_motor_ocr.md`. Fill every field. Do not add sections. Do not reorder. Keep the signature line blank for the technical lead.

---

```markdown
# Decision: Primary OCR Engine

**Date drafted:** <YYYY-MM-DD>
**Drafted by:** Claude Code
**Engine chosen:** <Tesseract 5 | PaddleOCR>
**Version:** <e.g., tesseract-5.3.4 | paddleocr-2.7.3>
**Preprocessing profile associated:** <EXPERIMENT_X>

---

## 1. Context

<Why this decision was needed. Cite Section 6 of the plan.>

## 2. Evaluation protocol

- Calibration corpus: 30 documents with 2-annotator ground truth, discordances resolved.
- Engines evaluated: Tesseract 5 (`oem=1`, `psm=3`, `lang=por`, `tessdata_best/por.traineddata`) and PaddleOCR (`use_angle_cls=True`, `lang=pt`, `use_gpu=False`).
- Doctr: excluded per Section 6.1.
- Rasterization: <mupdf | poppler> at 300 DPI.
- Preprocessing: <EXPERIMENT_X>.
- CER library: `fastest-levenshtein`. Normalization: uppercase, NFD strip accents, collapse whitespace, remove punctuation, trim.
- Source artifact: `benchmarks/ocr/ocr_benchmark_relatorio.json`.

## 3. Metrics

| Metric                  | Threshold | Tesseract | PaddleOCR |
| ----------------------- | --------- | --------- | --------- |
| CER CPF/CNPJ            | ≤ 0.01    | <x>       | <y>       |
| CER Matrícula           | ≤ 0.01    | <x>       | <y>       |
| CER Nomes               | ≤ 0.03    | <x>       | <y>       |
| CER Texto geral         | ≤ 0.05    | <x>       | <y>       |
| Mean time per page (ms) | —         | <x>       | <y>       |

## 4. Gate 2 criteria verification

| #   | Condition                                             | Result | Met       |
| --- | ----------------------------------------------------- | ------ | --------- |
| 1   | At least one engine meets all four CER thresholds     | <r>    | <SIM/NÃO> |
| 2   | Measurement on 30-document calibration corpus         | <r>    | <SIM/NÃO> |
| 3   | Ground truth from 2 annotators, discordances resolved | <r>    | <SIM/NÃO> |

## 5. Selection rule applied

<State which rule from Section 6.5 applied:

- Both passed → weighted CER (3/3/2/1) selected <engine>; tie within 0.5% → Tesseract chosen for simpler packaging;
- Only one passed → that engine chosen;
- Neither passed → record of corrective action and escalation.>

Weighted CER computed:

| Engine    | Weighted CER (3·CPF + 3·Mat + 2·Nomes + 1·Texto) / 9 |
| --------- | ---------------------------------------------------- |
| Tesseract | <value>                                              |
| PaddleOCR | <value>                                              |

## 6. Justification

<Paragraph citing the specific numbers that drive the choice. No marketing language. If the chosen engine is slower but more accurate, state that trade-off explicitly.>

## 7. Exceptions documented

<"None" | precise list of exceptions the technical lead should be aware of, with justification. Example: "Document matricula_onus_007 had CER_nomes = 0.05 due to rare OCR fragmentation; excluded from aggregate with lead approval logged in log_execucao.md on YYYY-MM-DD.">

## 8. Known limitations at Gate 2

- <List document classes or field types where the chosen engine performed closer to the threshold.>
- <List observed failure patterns to revisit in Phase 1.>

## 9. Corrective actions applied (if any)

| Iteration | Change applied | Reason   | Outcome        |
| --------- | -------------- | -------- | -------------- |
| <n>       | <description>  | <reason> | <metric delta> |

<Or "None. Thresholds met on first evaluation.">

## 10. Impact on the Phase 0 pipeline

- OCR engine locked to <chosen>.
- Preprocessing profile locked to <EXPERIMENT_X>.
- Parser sketch will operate on OCR outputs from this engine.

## 11. Source artifacts

- `benchmarks/ocr/ocr_benchmark_relatorio.json`
- `benchmarks/ocr/ocr_resultados/<motor>/<documento_id>/pagina_<n>.json`
- `relatorios/log_execucao.md` (activity entries from <date range>)

---

## Technical lead approval

_This section is completed by the technical lead only. Claude Code must not prefill._

**Approved by:** **\*\*\*\***\_\_\_\_**\*\*\*\***
**Date:** **\*\*\*\***\_\_\_\_**\*\*\*\***
**Signature:** **\*\*\*\***\_\_\_\_**\*\*\*\***
**Comments:** **\*\*\*\***\_\_\_\_**\*\*\*\***
```
