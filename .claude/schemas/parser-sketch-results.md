# Schema — Parser Sketch Results

**File:** `parser_sketch/parser_sketch_resultados.json`
**Purpose:** Per-field accuracy of the parser sketches against ground truth across the calibration corpus. Drives Gate 3.

---

## Top-level structure

```json
{
  "$schema": "parser_sketch_resultados_schema",
  "versao": "1.0",
  "data": "YYYY-MM-DDTHH:MM:SSZ",
  "ambiente_execucao": {
    "node_version": "v20.x.x",
    "parser_sketch_versao": "1.0"
  },
  "fonte_ocr": {
    "motor": "<tesseract | paddleocr>",
    "motor_versao": "<string>",
    "perfil_preprocessamento": "<EXPERIMENT_X>",
    "biblioteca_rasterizacao": "<mupdf | poppler>",
    "dpi": 300
  },
  "corpus_calibracao_total": 30,
  "normalizacao": {
    "descricao": "uppercase; NFD strip accents; collapse whitespace; remove punctuation; trim"
  },
  "resultados_por_campo": {
    "<field_name>": <FieldAccuracy>
  },
  "resultados_por_documento": [ <DocumentResult>, ... ],
  "gate_3_criterios": {
    "transmitente_1_cpf_acerto": <number>,
    "matricula_escritura_acerto": <number>,
    "matricula_numero_matricula_acerto": <number>,
    "transmitente_1_nome_acerto": <number>,
    "proprietario_1_nome_acerto": <number>,
    "criticos_todos_aprovados": <boolean>,
    "cobertura_ancoras_campos_pct": <number>,
    "cobertura_ancoras_documentos_pct": <number>,
    "condicao_cobertura_aprovada": <boolean>
  },
  "campos_abaixo_do_limiar": [ <FieldBelowThreshold>, ... ]
}
```

## `FieldAccuracy`

```json
{
  "campo": "<field_name>",
  "prioridade": <integer>,
  "criticidade": "CRITICO | NAO_CRITICO",
  "acertos": <integer>,
  "erros": <integer>,
  "nao_localizados": <integer>,
  "total_analisados": <integer>,
  "taxa_acerto": <number>,
  "limiar_aplicavel": <number or null>,
  "aprovado": <boolean or null>,
  "metodo_mais_usado": "REGEX_ROTULO | PADRAO_FIXO | HEURISTICA",
  "alertas_comuns": [ "<string>", ... ]
}
```

| Field | Rule |
|---|---|
| `acertos + erros + nao_localizados == total_analisados` | Required invariant. |
| `taxa_acerto` | Equals `acertos / total_analisados`. 2-decimal precision. |
| `limiar_aplicavel` | `0.85` for critical fields, `null` otherwise. |
| `aprovado` | For critical fields: `taxa_acerto >= 0.85`. For non-critical: `null` (not a gating condition). |

## `DocumentResult`

```json
{
  "documento_id": "<id>",
  "tipo": "<ESCRITURA_COMPRA_VENDA | MATRICULA>",
  "campos_extraidos": {
    "<field_name>": {
      "valor_extraido_normalizado": "<string | null>",
      "valor_ground_truth_normalizado": "<string | null>",
      "classificacao": "ACERTO | ERRO | NAO_LOCALIZADO",
      "metodo": "REGEX_ROTULO | PADRAO_FIXO | HEURISTICA",
      "confianca_estimada": <number>,
      "alertas": [ "<string>", ... ]
    }
  },
  "total_campos_prioridade": <integer>,
  "total_acertos": <integer>,
  "cobertura_percentual": <number>
}
```

- `cobertura_percentual` = `total_acertos / total_campos_prioridade × 100`. Used in `cobertura_ancoras_documentos_pct` aggregate (documents with ≥ 80%).

## `FieldBelowThreshold`

```json
{
  "campo": "<field_name>",
  "taxa_acerto": <number>,
  "limiar": <number>,
  "criticidade": "CRITICO | NAO_CRITICO",
  "padrao_de_falha": "<string>",
  "acao_proposta_fase_1": "<string>"
}
```

Non-critical fields below 0.85 are listed here and deferred to Phase 1. Critical fields below 0.85 block Gate 3 and require corrective action.

## Validation rules

1. `corpus_calibracao_total == 30`.
2. Every priority field (from `schemas/anchors-catalog.md`) appears in `resultados_por_campo`.
3. The four critical fields appear with `criticidade: "CRITICO"`.
4. Invariant `acertos + erros + nao_localizados == total_analisados` holds for every field.
5. For every document in the calibration corpus, a `DocumentResult` exists (or the document is flagged `status: "ERRO"` in the corpus catalog).
6. `fonte_ocr.motor` matches the engine from Gate 2.
7. `fonte_ocr.perfil_preprocessamento` matches the winning experiment from Gate 1.
8. Normalization identical between `valor_extraido_normalizado` and `valor_ground_truth_normalizado` (same function, same flags).

## Producer

Claude Code, via `parser_sketch/src/medir_acerto.ts` consuming OCR outputs from the Gate 2 benchmark artifacts.