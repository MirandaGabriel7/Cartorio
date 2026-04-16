# Checklist — Gate 3 (Parser Sketch)

Use before raising the Gate 3 signal. Every item must be checked with evidence (file path + specific value/section).

---

## Preconditions

- [ ] Gate 2 approved (decision file signed, `GATE 2 APPROVED` log entry present).
- [ ] OCR output available for the calibration corpus from the Gate 2 benchmark.
- [ ] Ground truth fully validated for the 30 calibration documents.

## Anchor catalog

- [ ] Semi-automatic exploration script executed on the full calibration corpus.
- [ ] `parser_sketch/catalogo_ancoras.json` exists and validates against `schemas/anchors-catalog.md`.
- [ ] Catalog covers every priority field listed in Section 7.1 for each document type (escritura, matrícula).
- [ ] Every anchor entry includes: `ancoras_primarias`, `ancoras_variantes_ocr`, `regex_valor`, `contexto_bloco`, `frequencia_no_corpus`, `total_documentos_analisados`, `observacoes`.
- [ ] Coverage: anchors cover ≥ 80% of Section 17 fields for ≥ 80% of calibration documents.

## Parser sketch implementation

- [ ] All files under `parser_sketch/src/` present: `explorar_ancoras.ts`, `parser_escritura_sketch.ts`, `parser_matricula_sketch.ts`, `normalizar_texto_ocr.ts`, `medir_acerto.ts`, `tipos.ts`.
- [ ] Extraction returns `CampoExtraidoSketch` for every priority field.
- [ ] OCR-artifact handling implemented (hyphen reconstruction, line joining, whitespace normalization).
- [ ] Common numeric substitution correction applied only within numeric candidate tokens.
- [ ] CPF validation by check digits implemented.
- [ ] Fallback (fixed-pattern) path implemented after anchor-based attempt.

## Accuracy measurement

- [ ] `parser_sketch/parser_sketch_resultados.json` exists and validates against `schemas/parser-sketch-results.md`.
- [ ] Normalization applied identically to extracted values and ground-truth values.
- [ ] Classification per field per document: `ACERTO` / `ERRO` / `NAO_LOCALIZADO`.
- [ ] Per-field accuracy computed over the 30-document calibration corpus.

## Critical fields thresholds

- [ ] `transmitente_1_cpf` accuracy ≥ 0.85.
- [ ] `matricula` (escritura) accuracy ≥ 0.85.
- [ ] `matricula_numero` (matricula) accuracy ≥ 0.85.
- [ ] `transmitente_1_nome` accuracy ≥ 0.85.

## Non-critical fields

- [ ] Fields below 85% documented in the decision file as "requires heuristic refinement in Phase 1".
- [ ] Failure patterns described (e.g., "OCR fragmented multi-token names").

## Documentation

- [ ] Activity log entries present for every step.
- [ ] `decisoes/decisao_parser_sketch.md` drafted using `templates/decision-parser-sketch.md`, all sections filled.
- [ ] Technical lead's signature line present but not prefilled.

## Prohibitions verified

- [ ] No LLM calls in the parser sketch.
- [ ] No ground-truth edits during accuracy measurement.
- [ ] No fields excluded from the accuracy denominator without logged justification.
- [ ] No code destined for the Phase 1 production parsers.

## Final action

- [ ] All items above are checked with evidence.
- [ ] `🚩 GATE 3 — READY FOR APPROVAL` entry added to `relatorios/log_execucao.md` using `templates/gate-signal.md`.
- [ ] Decision file path stated in the log entry.
- [ ] Activity halted; waiting for technical lead approval.
