# Schema — Corpus Catalog

**File:** `corpus/corpus_catalog.json`
**Purpose:** Master catalog of the Phase 0 corpus. Authoritative list of every document, its classification, its ground-truth status, and its pipeline status.

---

## Top-level structure

```json
{
  "$schema": "corpus_catalog_schema",
  "versao": "1.0",
  "data_criacao": "YYYY-MM-DD",
  "total_documentos": <integer>,
  "documentos": [ <DocumentoEntry>, ... ]
}
```

| Field              | Type    | Required | Rule                                                  |
| ------------------ | ------- | -------- | ----------------------------------------------------- |
| `$schema`          | string  | yes      | Literal `"corpus_catalog_schema"`.                    |
| `versao`           | string  | yes      | `"1.0"` for the Phase 0 catalog.                      |
| `data_criacao`     | string  | yes      | ISO 8601 date.                                        |
| `total_documentos` | integer | yes      | Length of `documentos` array. Must equal that length. |
| `documentos`       | array   | yes      | Non-empty; one entry per document.                    |

## `DocumentoEntry` fields

| Field                       | Type             | Required | Constraint                                                                                                                          |
| --------------------------- | ---------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `documento_id`              | string           | yes      | `{tipo}_{qualidade}_{sequencial:3}` format; unique in the catalog.                                                                  |
| `arquivo`                   | string           | yes      | Repository-relative path under `corpus/anonimizados/`.                                                                              |
| `tipo_documento`            | string           | yes      | One of `"ESCRITURA_COMPRA_VENDA"`, `"MATRICULA"`.                                                                                   |
| `categoria_corpus`          | string           | yes      | One of the category codes in Section 3.1 of the plan.                                                                               |
| `classificacao_qualidade`   | string           | yes      | One of `"BOA"`, `"DEGRADADA"`, `"BAIXA"`, `"NATIVA"`.                                                                               |
| `total_paginas`             | integer          | yes      | Count of pages in the anonymized PDF.                                                                                               |
| `tem_texto_nativo`          | boolean          | yes      | `true` if the PDF has an extractable text layer.                                                                                    |
| `marcas_dagua_presentes`    | boolean          | yes      | Human-annotated.                                                                                                                    |
| `tipo_marca_dagua`          | string or null   | yes      | Nullable. One of `"LATERAL"`, `"DIAGONAL"`, `"AMBAS"`, or `null`.                                                                   |
| `rodapes_sistema_presentes` | boolean          | yes      | `true` if electronic system footer observed.                                                                                        |
| `formato_matricula`         | string or null   | yes      | For matrículas only: `"ATUAL"` / `"MONO"` / `"MISTA"`. `null` for escrituras.                                                       |
| `tem_onus`                  | boolean          | yes      | `false` for escrituras; true/false for matrículas.                                                                                  |
| `tipos_onus`                | array of strings | yes      | Empty array if none.                                                                                                                |
| `tem_transporte_ficha`      | boolean          | yes      | Matrícula-only semantics; `false` for escrituras.                                                                                   |
| `total_transmitentes`       | integer          | yes      | For escrituras; `0` for matrículas.                                                                                                 |
| `transmitente_pj`           | boolean          | yes      | For escrituras.                                                                                                                     |
| `assinatura_rogo`           | boolean          | yes      | For escrituras.                                                                                                                     |
| `urbano_ou_rural`           | string           | yes      | `"URBANO"` or `"RURAL"`.                                                                                                            |
| `municipio_origem`          | string           | yes      | City name.                                                                                                                          |
| `anonimizacao_verificada`   | boolean          | yes      | Only `true` after second annotator verification.                                                                                    |
| `data_coleta`               | string           | yes      | ISO 8601 date.                                                                                                                      |
| `coletado_por`              | string           | yes      | `"cartorio_alvo"` or similar role label.                                                                                            |
| `ground_truth_disponivel`   | boolean          | yes      | `true` if a matching `*_gt.json` exists.                                                                                            |
| `ground_truth_arquivo`      | string or null   | yes      | Path to the ground truth file, or `null`.                                                                                           |
| `observacoes`               | string           | yes      | Free-form, empty string if none. Not null.                                                                                          |
| `status`                    | string           | yes      | `"OK"` by default. `"ERRO"` if the pipeline failed on this document. `"EXCLUIDO"` if removed from corpus with logged justification. |

## Validation rules

1. `documento_id` is globally unique within the catalog.
2. `arquivo` path points to a file that exists under `corpus/anonimizados/<category>/`.
3. If `ground_truth_disponivel: true`, then `ground_truth_arquivo` is non-null and points to an existing file.
4. `tipo_documento` matches the `tipo` segment of `documento_id`.
5. For `tipo_documento: "MATRICULA"`: `transmitente_pj` is `false`, `assinatura_rogo` is `false`, `total_transmitentes` is `0`.
6. For `tipo_documento: "ESCRITURA_COMPRA_VENDA"`: `formato_matricula` is `null`, `tem_onus` is `false`, `tem_transporte_ficha` is `false`.
7. `data_coleta` and `data_criacao` are valid ISO 8601 dates.
8. Category quotas of Section 3.1 are tracked (not strictly enforced per entry, but reported).

## Validator

`scripts/validar_corpus_catalog.ts`. Invoked via `npm run validar:corpus`. Uses `ajv`.

## Git rules

- The catalog JSON is committed.
- The PDFs referenced by `arquivo` are NOT committed (in `.gitignore`).

## Producer and authority

- Claude Code assembles the JSON from human annotator input.
- Anonymization verification flag (`anonimizacao_verificada`) is set only by the second annotator, not by Claude.
- `status` transitions to `"ERRO"` automatically when a pipeline stage fails; to `"EXCLUIDO"` only by technical lead decision with a logged justification.
