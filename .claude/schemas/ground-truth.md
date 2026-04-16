# Schema — Ground Truth

**File:** `corpus/ground_truth/<documento_id>_gt.json`
**Purpose:** Human-annotated reference data for a single document, used to score OCR and parser outputs.

---

## Top-level structure

```json
{
  "$schema": "ground_truth_schema",
  "documento_id": "<id>",
  "tipo": "<ESCRITURA_COMPRA_VENDA | MATRICULA>",
  "classificacao_qualidade": "<BOA | DEGRADADA | BAIXA | NATIVA>",
  "total_paginas": <integer>,
  "anotador_primario": "<id>",
  "anotador_secundario": "<id | null>",
  "data_anotacao_primaria": "YYYY-MM-DD",
  "data_anotacao_secundaria": "YYYY-MM-DD | null",
  "discordancias_resolvidas": <boolean>,
  "resolucao_discordancias": "<text | null>",
  "campos": { ... },
  "texto_completo_por_pagina": { "1": "...", "2": "...", ... },
  "checklist_gabarito": { "item_01": <value>, ..., "item_34": <value> }
}
```

## Metadata fields

| Field                      | Type           | Required | Rule                                                                                                               |
| -------------------------- | -------------- | -------- | ------------------------------------------------------------------------------------------------------------------ |
| `$schema`                  | string         | yes      | Literal `"ground_truth_schema"`.                                                                                   |
| `documento_id`             | string         | yes      | Must match an entry in `corpus/corpus_catalog.json`.                                                               |
| `tipo`                     | string         | yes      | Must match catalog entry's `tipo_documento`.                                                                       |
| `classificacao_qualidade`  | string         | yes      | Must match catalog entry.                                                                                          |
| `total_paginas`            | integer        | yes      | Must match catalog entry.                                                                                          |
| `anotador_primario`        | string         | yes      | Non-empty identifier.                                                                                              |
| `anotador_secundario`      | string or null | yes      | Non-null for the 30-document calibration corpus; may be null for documents 31–145 (with 20% random re-annotation). |
| `data_anotacao_primaria`   | string         | yes      | ISO 8601.                                                                                                          |
| `data_anotacao_secundaria` | string or null | yes      | ISO 8601 or null.                                                                                                  |
| `discordancias_resolvidas` | boolean        | yes      | `true` only after the discordance resolution process (Section 3.4.3 of the plan) is complete.                      |
| `resolucao_discordancias`  | string or null | yes      | Explanatory text of how discordances were resolved, or null if none.                                               |

## `campos` structure

Each field is an object:

```json
{
  "valor": "<string | number | boolean | null>",
  "pagina": <integer>,
  "obrigatorio": <boolean>
}
```

- `valor`: the annotated ground-truth value. Typed as required by the field (strings for most, integers for monetary cents, booleans for flags, ISO dates for dates). `null` is allowed only when the field is absent from the document AND `obrigatorio: false`.
- `pagina`: 1-indexed page where the value appears.
- `obrigatorio`: `true` if the field is required by the plan for this document type.

## Escritura required fields (non-exhaustive, see plan)

- `tipo_titulo`, `numero_livro`, `numero_folhas`, `data_lavratura`, `tabeliao_nome`, `municipio_tabelionato`, `uf_tabelionato`
- Per transmitente (1..N): `_nome`, `_cpf`, `_tipo_pessoa`, `_estado_civil`, `_regime_bens`, `_profissao`, `_nacionalidade`
- Per adquirente (1..N): same suffixes
- `matricula` (target registration number), `valor_partes`, `doi_emitida_mencionada`, `itbi_mencionado`, `certidao_acoes_reais_apresentada`
- Property fields: `area`, `unidade_area`, `tipo_imovel`, `urbano_ou_rural`

## Matrícula required fields (non-exhaustive)

- `matricula_numero`, `formato_matricula`
- Per proprietário (1..N): `_nome`, `_cpf_cnpj`, `_estado_civil`
- `area`, `unidade_area`, `inscricao_imobiliaria`, `cadastro_incra`
- Per ônus N (when present): `onus_N_tipo`, `onus_N_impeditivo_ou_nao`, `onus_N_beneficiario`, `onus_N_registro_referencia`, `onus_N_data_constituicao`
- `transporte_ficha`, `averbacoes`, `construcoes_averbadas`, `patrimonio_afetacao`

## Value-format constraints

| Field family                 | Format                                                                |
| ---------------------------- | --------------------------------------------------------------------- |
| CPF                          | 11-digit string, no punctuation                                       |
| CNPJ                         | 14-digit string, no punctuation                                       |
| Dates                        | ISO 8601 date (`YYYY-MM-DD`)                                          |
| Monetary values              | integer cents                                                         |
| Area                         | decimal number + `unidade_area` field (`"m2"`, `"ha"`, `"alqueires"`) |
| Booleans                     | `true` / `false`, not strings                                         |
| Flags like `urbano_ou_rural` | exactly `"URBANO"` or `"RURAL"`                                       |

## `texto_completo_por_pagina`

Object keyed by page number as a string. Each value is the full verbatim (anonymized) text of that page. At minimum, pages that contain required fields must have a transcription.

## `checklist_gabarito`

Object with keys `item_01` through `item_34`, each keyed to the gabarito value for the 34-item checklist per plan v1.3. Values may be `"OK"`, `"NAO_ATENDE"`, `"NAO_APLICA"` or field-specific.

## Validation rules

Enforced by `scripts/validar_ground_truth.ts`:

1. JSON Schema valid.
2. All `obrigatorio: true` fields have non-null values.
3. CPFs have length 11, CNPJs length 14 (digits only).
4. Dates in ISO 8601.
5. Monetary values are integers.
6. `documento_id` matches an entry in `corpus/corpus_catalog.json`.
7. All 34 checklist items have a value.
8. `texto_completo_por_pagina` includes at least the pages listed in required `campos`.
9. For calibration corpus documents, `anotador_secundario` is non-null and `discordancias_resolvidas: true`.

Validator output: `relatorios/validacao_ground_truth.json`.

## Producer and authority

- Human annotators produce this file. Claude Code does not fabricate values.
- Claude Code runs the validator and the discordance-detection script.
- Resolutions of discordances are decided by annotators + senior reviewer, not by Claude.
