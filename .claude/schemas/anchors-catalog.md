# Schema — Anchors Catalog

**File:** `parser_sketch/catalogo_ancoras.json`
**Purpose:** Structured catalog of textual anchors (labels preceding values) used by the Phase 0 parser sketches and seeded into Phase 1 production parsers.

---

## Top-level structure

```json
{
  "$schema": "catalogo_ancoras_schema",
  "versao": "1.0",
  "data": "YYYY-MM-DD",
  "corpus_analisado": {
    "total_documentos": <integer>,
    "escrituras": <integer>,
    "matriculas": <integer>
  },
  "tipos_documento": {
    "ESCRITURA_COMPRA_VENDA": { "ancoras": { ... } },
    "MATRICULA": { "ancoras": { ... } }
  },
  "cobertura": {
    "total_campos_secao_17": <integer>,
    "campos_com_ancoras_publicadas": <integer>,
    "cobertura_campos_pct": <number>,
    "cobertura_documentos_pct": <number>
  }
}
```

## `AnchorEntry` (per field)

```json
"<field_name>": {
  "campo": "<field_name>",
  "tipo_extracao": "REGEX_ROTULO | PADRAO_FIXO | HEURISTICA",
  "ancoras_primarias": ["<clean anchor 1>", "<clean anchor 2>", ...],
  "ancoras_variantes_ocr": ["<OCR-degraded variant>", ...],
  "regex_valor": "<regex for the value following the anchor>",
  "contexto_bloco": "<typical surrounding context in the document>",
  "frequencia_no_corpus": <integer>,
  "total_documentos_analisados": <integer>,
  "prioridade": <integer 1..15>,
  "criticidade": "CRITICO | NAO_CRITICO",
  "observacoes": "<free-form notes on OCR artifacts, corner cases, Phase 1 flags>"
}
```

| Field | Type | Required | Rule |
|---|---|---|---|
| `campo` | string | yes | Canonical field name; matches ground truth key. |
| `tipo_extracao` | string | yes | Enum. `REGEX_ROTULO` when an anchor is present; `PADRAO_FIXO` when only a fixed pattern is viable; `HEURISTICA` when block-context reasoning is needed. |
| `ancoras_primarias` | array of strings | yes | At least one entry for fields where extraction relies on a label. Empty array allowed only when `tipo_extracao == "PADRAO_FIXO"`. |
| `ancoras_variantes_ocr` | array of strings | yes | May be empty. |
| `regex_valor` | string | yes | Escaped regex string. |
| `contexto_bloco` | string | yes | Non-empty textual description. |
| `frequencia_no_corpus` | integer | yes | Number of docs where at least one anchor matched. |
| `total_documentos_analisados` | integer | yes | Denominator; typically equal to the number of documents of that type in the calibration corpus. |
| `prioridade` | integer | yes | 1–15 per Section 7.1 of the plan. |
| `criticidade` | string | yes | `CRITICO` for the four gating fields, `NAO_CRITICO` otherwise. |
| `observacoes` | string | yes | Not null. Empty string allowed. |

## Priority fields that must appear

### Escritura (`ESCRITURA_COMPRA_VENDA`)

`transmitente_1_cpf`, `matricula`, `transmitente_1_nome`, `transmitente_1_estado_civil`, `adquirente_1_cpf`, `adquirente_1_nome`, `data_lavratura`, `uf_tabelionato`, `valor_partes`, `doi_emitida_mencionada`, `itbi_mencionado`, `certidao_acoes_reais_apresentada`, `area`, `unidade_area`, `tipo_imovel`, `urbano_ou_rural`.

### Matrícula (`MATRICULA`)

`matricula_numero`, `proprietario_1_nome`, `proprietario_1_cpf_cnpj`, `proprietario_1_estado_civil`, `area`, `unidade_area`, `formato_matricula`, `onus_N_tipo`, `onus_N_impeditivo_ou_nao`, `transporte_ficha`, `cadastro_incra`, `inscricao_imobiliaria`.

## Validation rules

1. Every priority field appears as an `AnchorEntry` under the appropriate document type.
2. `frequencia_no_corpus <= total_documentos_analisados`.
3. Critical fields have `criticidade: "CRITICO"` and match the four Gate 3 gating fields.
4. `regex_valor` is a valid regex string (parseable by JavaScript `new RegExp`).
5. Coverage computed:
   - `cobertura_campos_pct = campos_com_ancoras_publicadas / total_campos_secao_17 × 100`
   - Target ≥ 80%.
   - `cobertura_documentos_pct` ≥ 80%: fraction of documents where ≥ 80% of their priority fields were found via an anchor.
6. No entries for fields outside the Section 17 scope unless explicitly logged as an addition in a technical decision record.

## Producer

Claude Code, via `parser_sketch/src/explorar_ancoras.ts` followed by human review and consolidation. Unverified anchor variants (single-document-only observations without review) must not be elevated to `ancoras_primarias`; they belong to `ancoras_variantes_ocr` or `observacoes`.

## Git

Committed. This file is a Phase 1 seed artifact.