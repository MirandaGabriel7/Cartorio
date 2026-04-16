# Template — Decision: Parser Sketch Feasibility

Copy this template to `decisoes/decisao_parser_sketch.md`. Fill every field. Do not add sections. Do not reorder. Keep the signature line blank for the technical lead.

---

```markdown
# Decision: Parser Sketch Feasibility

**Date drafted:** <YYYY-MM-DD>
**Drafted by:** Claude Code
**Parser sketch version:** 1.0
**Feasibility:** <CONFIRMED | PARTIAL | BLOCKED>

---

## 1. Context

<Why this decision was needed. Cite Section 7 of the plan.>

## 2. Evaluation protocol

- Calibration corpus: 30 documents with validated ground truth.
- OCR output source: <chosen engine per Gate 2>, preprocessing <EXPERIMENT_X>.
- Anchor exploration: `parser_sketch/src/explorar_ancoras.ts` executed on calibration corpus.
- Accuracy measurement: `parser_sketch/src/medir_acerto.ts` with identical normalization on extracted and ground-truth values.
- Source artifacts:
  - `parser_sketch/catalogo_ancoras.json`
  - `parser_sketch/parser_sketch_resultados.json`

## 3. Anchor catalog summary

| Document type          | Total priority fields | Fields with anchors published | Coverage |
| ---------------------- | --------------------- | ----------------------------- | -------- |
| ESCRITURA_COMPRA_VENDA | <n>                   | <m>                           | <m/n>    |
| MATRICULA              | <n>                   | <m>                           | <m/n>    |

- Section 17 field coverage: <X%> of fields covered for <Y%> of documents.
- Target: ≥ 80% / ≥ 80%.

## 4. Critical fields accuracy

| Field                                         | Threshold | Accuracy | Met       |
| --------------------------------------------- | --------- | -------- | --------- |
| `transmitente_1_cpf`                          | ≥ 0.85    | <x>      | <SIM/NÃO> |
| `matricula` (escritura)                       | ≥ 0.85    | <x>      | <SIM/NÃO> |
| `matricula_numero` (matricula)                | ≥ 0.85    | <x>      | <SIM/NÃO> |
| `transmitente_1_nome` / `proprietario_1_nome` | ≥ 0.85    | <x>      | <SIM/NÃO> |

## 5. Non-critical fields accuracy

| Field                           | Accuracy | Status |
| ------------------------------- | -------- | ------ | ------------------------------- |
| `transmitente_1_estado_civil`   | <x>      | <OK    | Requires refinement in Phase 1> |
| `adquirente_1_cpf`              | <x>      | <OK    | Requires refinement in Phase 1> |
| `adquirente_1_nome`             | <x>      | <OK    | Requires refinement in Phase 1> |
| `data_lavratura`                | <x>      | <OK    | Requires refinement in Phase 1> |
| `uf_tabelionato`                | <x>      | <OK    | Requires refinement in Phase 1> |
| `valor_partes`                  | <x>      | <OK    | Requires refinement in Phase 1> |
| `area` + `unidade_area`         | <x>      | <OK    | Requires refinement in Phase 1> |
| `tipo_imovel`                   | <x>      | <OK    | Requires refinement in Phase 1> |
| `urbano_ou_rural`               | <x>      | <OK    | Requires refinement in Phase 1> |
| (matrícula non-critical fields) | <x>      | <OK    | Requires refinement in Phase 1> |

## 6. Gate 3 criteria verification

| #   | Condition                                                               | Result | Met       |
| --- | ----------------------------------------------------------------------- | ------ | --------- |
| 1   | All four critical fields ≥ 0.85 accuracy                                | <r>    | <SIM/NÃO> |
| 2   | Anchor catalog covers ≥ 80% of Section 17 fields for ≥ 80% of documents | <r>    | <SIM/NÃO> |
| 3   | Decision file complete                                                  | <r>    | <SIM/NÃO> |
| 4   | Anchor catalog published                                                | <r>    | <SIM/NÃO> |

## 7. Failure patterns observed and deferred to Phase 1

| Field   | Pattern   | Count in calibration corpus | Proposed Phase 1 handling |
| ------- | --------- | --------------------------- | ------------------------- |
| <field> | <pattern> | <n>                         | <handling>                |

<Or "None; all fields meet or exceed thresholds.">

## 8. OCR-artifact tolerance layers implemented

- Hyphen reconstruction across line breaks.
- Line-fragmentation merging.
- Whitespace normalization.
- Numeric substitution correction (O→0, I/l→1, S→5, B→8, G→9) applied only within numeric candidate tokens.
- Anchor variants capturing common OCR degradations.

## 9. Fallback paths

- Anchor-based extraction first.
- Fixed-pattern fallback on miss (e.g., CPF regex with check-digit validation).
- No heuristic chains beyond the two layers.

## 10. Justification

<Paragraph explaining the feasibility verdict with specific accuracy numbers. No marketing language.>

## 11. Impact on Phase 1

- Anchor catalog becomes the seed for Phase 1 production parsers.
- Fields flagged "requires refinement in Phase 1" become explicit work items.
- Parser sketch code is not reused; Phase 1 re-implements with production-grade structure, confidence model, and error recovery.

## 12. Source artifacts

- `parser_sketch/catalogo_ancoras.json`
- `parser_sketch/parser_sketch_resultados.json`
- `benchmarks/ocr/ocr_benchmark_relatorio.json` (OCR source for measurement)
- `relatorios/log_execucao.md` (activity entries from <date range>)

---

## Technical lead approval

_This section is completed by the technical lead only. Claude Code must not prefill._

**Approved by:** **\*\*\*\***\_\_\_\_**\*\*\*\***
**Date:** **\*\*\*\***\_\_\_\_**\*\*\*\***
**Signature:** **\*\*\*\***\_\_\_\_**\*\*\*\***
**Comments:** **\*\*\*\***\_\_\_\_**\*\*\*\***
```
