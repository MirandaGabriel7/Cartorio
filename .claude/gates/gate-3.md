# Gate 3 — Parser Sketch

**Scope:** Feasibility of deterministic parsing for the critical fields, plus the anchor catalog seed for Phase 1.
**Decision file:** `decisoes/decisao_parser_sketch.md`
**Authority:** Technical lead (human).
**Prerequisites:** Gate 2 approved. OCR outputs for the calibration corpus produced by the Gate 2 engine.
**Source:** Section 10.1 of the plan.

---

## Conditions (all must be true)

| # | Condition | Evidence |
|---|---|---|
| 1 | `transmitente_1_cpf` accuracy ≥ 0.85 in calibration corpus | `parser_sketch/parser_sketch_resultados.json`, `resultados_por_campo.transmitente_1_cpf.taxa_acerto` |
| 2 | `matricula` (escritura) accuracy ≥ 0.85 | `resultados_por_campo.matricula.taxa_acerto` |
| 3 | `matricula_numero` (matricula) accuracy ≥ 0.85 | `resultados_por_campo.matricula_numero.taxa_acerto` |
| 4 | `transmitente_1_nome` / `proprietario_1_nome` accuracy ≥ 0.85 | `resultados_por_campo.<name field>.taxa_acerto` |
| 5 | Anchor catalog covers ≥ 80% of Section 17 fields for ≥ 80% of calibration documents | `parser_sketch/catalogo_ancoras.json`, `cobertura.cobertura_campos_pct` and `cobertura.cobertura_documentos_pct` |
| 6 | `decisoes/decisao_parser_sketch.md` complete per `templates/decision-parser-sketch.md` | The file itself |
| 7 | `parser_sketch/catalogo_ancoras.json` published and schema-valid | The file itself |

## Rejection conditions

- Any critical field below 0.85.
- Anchor catalog coverage insufficient.
- Decision file or anchor catalog missing / invalid.

## Corrective action

- **CPF below 0.85:** isolate the cause. If OCR produced wrong digits → return to Gate 2 and refine preprocessing. If the anchor was not found → expand the anchor catalog and adjust regexes. Log a technical decision record.
- **Name below 0.85:** investigate the failure pattern (name fragmented by OCR, multi-token composition not handled, etc.). Refine the extractor. Never manipulate ground truth.
- **Anchor coverage below 80%:** expand the catalog with variants observed in failing documents. Run exploration again over the failing subset.
- **If the bottleneck is OCR:** return to Gate 2. Gate 3 cannot proceed with an insufficient OCR foundation.

Non-critical fields below 0.85 do **not** block Gate 3; they are documented as Phase 1 pendencies.

## Approval protocol

1. Claude Code: complete `checklists/gate-3-parser-sketch.md`.
2. Claude Code: draft `decisoes/decisao_parser_sketch.md` using the template.
3. Claude Code: raise `🚩 GATE 3 — READY FOR APPROVAL` entry in the log.
4. Claude Code: stop. Wait.
5. Technical lead: review and sign the decision file.
6. `✅ GATE 3 APPROVED` entry appended to the log.

## Activities unlocked by approval

- Baseline freeze (`playbooks/baseline-freeze.md`).
- Drafting of the final report, after baseline freeze.
- Phase 0 closure checklist.

## Activities forbidden before approval

- Freezing the baseline.
- Drafting the final report.
- Starting any Phase 1 activity.

## Rules

- Claude never approves this gate.
- Claude never modifies ground truth to improve accuracy.
- Claude never excludes fields from the denominator without a logged technical decision.
- Claude never fabricates anchor entries not observed in the corpus.
- Claude never extends the parser sketch to production quality — it is a sketch, not a parser.