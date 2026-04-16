# Template — Final Report Phase 0

Copy this template to `relatorios/relatorio_final_fase0.md`. Fill every section. Do not add sections. Do not reorder. Do not prefill the signature block.

---

```markdown
# Final Report — CartórioDoc Phase 0

**Date drafted:** <YYYY-MM-DD>
**Drafted by:** Claude Code
**Baseline frozen on:** <YYYY-MM-DD HH:MM>
**Baseline file:** `baseline/fase0_baseline_v1.json`
**Baseline hash:** `sha256:<hex>`

---

## 1. Executive summary

<Paragraph 1: Phase 0 outcome in factual terms. Which library, which engine, which preprocessing profile, which accuracy on critical fields.>

<Paragraph 2: Risk status. What is validated against real documents, what remains as an open question for Phase 1.>

<Paragraph 3: Recommendation. Continue to Phase 1 / hold / revise. State the recommendation once, clearly.>

## 2. Gate decisions summary

### Gate 1 — Rasterization + Preprocessing

- Decision file: `decisoes/decisao_rasterizacao.md`
- Library: <mupdf | poppler>
- Preprocessing profile: <EXPERIMENT_X>
- Approved on: <YYYY-MM-DD>
- Approved by: <technical lead name>

### Gate 2 — OCR Engine

- Decision file: `decisoes/decisao_motor_ocr.md`
- Engine: <Tesseract 5 <version> | PaddleOCR <version>>
- Approved on: <YYYY-MM-DD>
- Approved by: <technical lead name>

### Gate 3 — Parser Sketch

- Decision file: `decisoes/decisao_parser_sketch.md`
- Feasibility: <CONFIRMED | PARTIAL | BLOCKED>
- Approved on: <YYYY-MM-DD>
- Approved by: <technical lead name>

## 3. Pipeline composition (at baseline freeze)

| Component             | Selected         | Notes            |
| --------------------- | ---------------- | ---------------- | --- |
| Rasterization library | <mupdf           | poppler>         |     |
| DPI                   | 300              |                  |
| Preprocessing profile | <EXPERIMENT_X>   |                  |
| OCR engine            | <tesseract-5.x.x | paddleocr-2.7.3> |     |
| Parser sketch version | 1.0              |                  |

## 4. Final metrics

All values read from `baseline/fase0_baseline_v1.json`.

| Metric                                          | Value |
| ----------------------------------------------- | ----- |
| CER CPF/CNPJ                                    | <x>   |
| CER Matrícula                                   | <x>   |
| CER Nomes                                       | <x>   |
| CER Texto geral                                 | <x>   |
| Parser accuracy: `transmitente_1_cpf`           | <x>   |
| Parser accuracy: `matricula` (escritura)        | <x>   |
| Parser accuracy: `matricula_numero` (matricula) | <x>   |
| Parser accuracy: `transmitente_1_nome`          | <x>   |
| Mean OCR time per page (ms)                     | <x>   |
| Mean rasterization time per page (ms)           | <x>   |

## 5. Corpus summary

- Total documents cataloged: <n> (target ≥ 145)
- 2-annotator ground truth: <n> (target ≥ 30)
- 1-annotator ground truth + 20% review: <n>
- Documents with `status: "ERRO"`: <n>
- Documents excluded with justification: <n>

Breakdown by category:

| Category      | Collected | Minimum target |
| ------------- | --------- | -------------- |
| MAT-ATUAL-BOA | <n>       | 20             |
| MAT-ATUAL-DEG | <n>       | 15             |
| MAT-MONO      | <n>       | 10             |
| MAT-ONUS      | <n>       | 10             |
| MAT-RURAL     | <n>       | 5              |
| MAT-TRANSP    | <n>       | 5              |
| ESC-NATIVA    | <n>       | 5              |
| ESC-BOA       | <n>       | 15             |
| ESC-DEG       | <n>       | 15             |
| ESC-BAIXA     | <n>       | 10             |
| ESC-MULTI     | <n>       | 10             |
| ESC-PJ        | <n>       | 5              |
| ESC-ROGO      | <n>       | 5              |
| ESC-MARCA     | <n>       | 10             |
| ESC-PRENOT    | <n>       | 5              |

## 6. Open pendencies

### 6.1 Non-critical fields below 85% accuracy

| Field   | Accuracy | Failure pattern | Proposed Phase 1 handling |
| ------- | -------- | --------------- | ------------------------- |
| <field> | <x>      | <pattern>       | <handling>                |

### 6.2 Documents flagged `ERRO`

| documento_id | Failure stage | Notes   |
| ------------ | ------------- | ------- |
| <id>         | <stage>       | <notes> |

### 6.3 Section 17 fields not yet covered by anchors

| Field   | Reason   | Phase 1 plan |
| ------- | -------- | ------------ |
| <field> | <reason> | <plan>       |

### 6.4 Watermark variants with imperfect attenuation

| Variant   | Affected documents | Residual CER impact |
| --------- | ------------------ | ------------------- |
| <variant> | <ids>              | <value>             |

## 7. Phase 1 recommendations

| #   | Recommendation | Phase 0 evidence                  | Effort (S/M/L) |
| --- | -------------- | --------------------------------- | -------------- |
| 1   | <what to do>   | <artifact path + specific metric> | <estimate>     |
| 2   | <what to do>   | <artifact path + specific metric> | <estimate>     |
| N   | <what to do>   | <artifact path + specific metric> | <estimate>     |

## 8. Risks and mitigations

| Risk   | Evidence   | Phase 0 mitigation | Residual risk for Phase 1 |
| ------ | ---------- | ------------------ | ------------------------- |
| <risk> | <evidence> | <mitigation>       | <residual>                |

## 9. Deliverables checklist

See `.claude/checklists/mandatory-deliverables.md` — verified present as of this report's date:

| #   | Artifact                                                       | Status        |
| --- | -------------------------------------------------------------- | ------------- |
| 1   | `corpus/corpus_catalog.json`                                   | PRESENT/VALID |
| 2   | `corpus/anonimizados/**/*.pdf`                                 | PRESENT       |
| 3   | `corpus/ground_truth/*_gt.json`                                | PRESENT/VALID |
| 4   | `benchmarks/rasterizacao/resultados_rasterizacao.json`         | PRESENT/VALID |
| 5   | `benchmarks/preprocessamento/preprocessamento_resultados.json` | PRESENT/VALID |
| 6   | `benchmarks/ocr/ocr_benchmark_relatorio.json`                  | PRESENT/VALID |
| 7   | `parser_sketch/catalogo_ancoras.json`                          | PRESENT/VALID |
| 8   | `parser_sketch/parser_sketch_resultados.json`                  | PRESENT/VALID |
| 9   | `baseline/fase0_baseline_v1.json`                              | FROZEN/HASHED |
| 10  | `decisoes/decisao_rasterizacao.md`                             | SIGNED        |
| 11  | `decisoes/decisao_motor_ocr.md`                                | SIGNED        |
| 12  | `decisoes/decisao_parser_sketch.md`                            | SIGNED        |
| 13  | `relatorios/relatorio_variabilidade_documental.md`             | COMPLETE      |
| 14  | `relatorios/relatorio_final_fase0.md`                          | THIS FILE     |
| 15  | `relatorios/log_execucao.md`                                   | COMPLETE      |

## 10. Source artifacts index

- Decisions: `decisoes/*.md`
- Benchmarks: `benchmarks/**/*.json`
- Parser sketch: `parser_sketch/*.json`
- Baseline: `baseline/fase0_baseline_v1.json`
- Variability: `relatorios/relatorio_variabilidade_documental.md`
- Log: `relatorios/log_execucao.md`

---

## Technical lead approval — Phase 0 closure

_This section is completed by the technical lead only. Claude Code must not prefill._

By signing below, the technical lead declares Phase 0 complete and authorizes the start of Phase 1.

**Approved by:** **\*\*\*\***\_\_\_\_**\*\*\*\***
**Date:** **\*\*\*\***\_\_\_\_**\*\*\*\***
**Signature:** **\*\*\*\***\_\_\_\_**\*\*\*\***
**Phase 1 authorization:** **\*\*\*\***\_\_\_\_**\*\*\*\***
**Comments:** **\*\*\*\***\_\_\_\_**\*\*\*\***
```
