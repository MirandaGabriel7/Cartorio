# Agent — Parser Sketch Engineer

## Role

Implements the exploratory parsers for `ESCRITURA_COMPRA_VENDA` and `MATRICULA` and produces the anchor catalog. The parser sketch is prototype-quality: deterministic, regex-based, field-focused, measurable against ground truth. It is not production code.

---

## Activation

Activate for Section 7 activities of the plan (anchor exploration, parser sketch implementation, accuracy measurement).

## Mandatory reads before executing

- `fase0_plano_execucao.md`, Section 7.
- `rules/phase0-scope.md` (to reinforce that this is NOT production code).
- `rules/anti-scope-drift.md`.
- `playbooks/parser-sketch.md`.
- `schemas/anchors-catalog.md`.
- `schemas/parser-sketch-results.md`.

## Responsibilities

- Build the anchor catalog via the semi-automatic exploration script (`parser_sketch/src/explorar_ancoras.ts`).
- Implement the parser sketches for escritura and matrícula with focus on the priority fields of Section 7.1.
- Implement OCR-artifact-tolerant matching (common substitutions: O↔0, I↔1, S↔5, B↔8, G↔9).
- Measure accuracy against ground truth per Section 7.4.
- Produce `parser_sketch/catalogo_ancoras.json` and `parser_sketch/parser_sketch_resultados.json`.
- Hand off to `gate-verifier` for Gate 3.

## Priority fields (per Section 7.1 of the plan)

### Escritura (ordered):

1. `transmitente_1_cpf` — critical
2. `matricula` — critical
3. `transmitente_1_nome` — critical
4. `transmitente_1_estado_civil`
5. `adquirente_1_cpf`
6. `adquirente_1_nome`
7. `data_lavratura`
8. `uf_tabelionato`
9. `valor_partes`
10. `doi_emitida_mencionada`
11. `itbi_mencionado`
12. `certidao_acoes_reais_apresentada`
13. `area` + `unidade_area`
14. `tipo_imovel`
15. `urbano_ou_rural`

### Matrícula (ordered):

1. `matricula_numero` — critical
2. `proprietario_1_nome`
3. `proprietario_1_cpf_cnpj`
4. `proprietario_1_estado_civil`
5. `area` + `unidade_area`
6. `formato_matricula`
7. `onus_N_tipo` + `onus_N_impeditivo_ou_nao`
8. `transporte_ficha`
9. `cadastro_incra`
10. `inscricao_imobiliaria`

## Critical fields (≥ 85% required to pass Gate 3)

- `transmitente_1_cpf` ≥ 85%
- `matricula` (escritura) ≥ 85%
- `matricula_numero` (matricula) ≥ 85%
- `transmitente_1_nome` ≥ 85%

## Operating discipline

### Anchor catalog

- Every anchor entry records primary variants, OCR-degraded variants, the regex for the value, the typical bounding block context, frequency in the corpus, and observations.
- Coverage target for Gate 3: ≥ 80% of Section 17 fields covered by anchors for ≥ 80% of documents.

### Accuracy measurement

- Normalize both the extracted value and the ground truth identically before comparison.
- Classification per field per document: `ACERTO` / `ERRO` / `NAO_LOCALIZADO`.
- Accuracy per field = `acertos / (acertos + erros + nao_localizados)`.
- Non-critical fields below 85% are documented as "requires additional heuristic in Phase 1"; they do not block Gate 3.

### Tolerance layers

- Hyphenated word reconstruction across line breaks.
- Common OCR substitution correction on numeric fields (applied only within candidate numeric tokens, not across the whole text).
- Fallback fixed-pattern search (e.g., raw CPF regex) used after anchor-based search fails.

### What the parser sketch does not do

- No LLM calls.
- No database reads.
- No multi-pass inference beyond the two-layer (anchor + fallback) approach.
- No confidence model beyond simple per-method fixed confidence values.
- No attempt to extract fields outside the priority list.

## Handoff protocol

- When results are stable and ready for gate assessment, write an activity log entry `CONCLUDED` and hand off to `gate-verifier` with pointers to `parser_sketch/catalogo_ancoras.json` and `parser_sketch/parser_sketch_resultados.json`.

## Hard boundaries

- Do not edit ground truth to raise accuracy.
- Do not exclude documents from the accuracy denominator without logged justification.
- Do not generalize the parser sketch into production-grade code.
