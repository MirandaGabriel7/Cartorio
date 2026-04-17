# Schema — Baseline v1

**File:** `baseline/fase0_baseline_v1.json`
**Purpose:** Frozen reference of the Phase 0 pipeline state at the end of Gate 3 approval. Used by Phase 1 to detect regressions.

---

## Top-level structure

```json
{
  "$schema": "baseline_schema",
  "versao_baseline": "fase0_v1",
  "data_congelamento": "YYYY-MM-DDTHH:MM:SSZ",
  "hash_arquivo": "sha256:<hex>",
  "ambiente_execucao": {
    "os": "<windows version>",
    "node_version": "v20.x.x",
    "python_version": "3.11.x"
  },
  "versao_pipeline": {
    "motor_ocr": "<tesseract-5.x.x | paddleocr-2.7.3>",
    "perfil_preprocessamento": "<EXPERIMENT_X>",
    "biblioteca_rasterizacao": "<mupdf | poppler>",
    "dpi_rasterizacao": 300,
    "parser_sketch_versao": "1.0"
  },
  "corpus_calibracao_total": 30,
  "metricas_globais": {
    "cer_cpf_cnpj": <number>,
    "cer_matricula": <number>,
    "cer_nomes": <number>,
    "cer_texto_geral": <number>,
    "parser_acerto_cpf": <number>,
    "parser_acerto_matricula": <number>,
    "parser_acerto_nome": <number>,
    "tempo_medio_ocr_por_pagina_ms": <number>,
    "tempo_medio_rasterizacao_por_pagina_ms": <number>
  },
  "documentos": [ <DocumentBaseline>, ... ],
  "fontes": {
    "decisao_rasterizacao": "decisoes/decisao_rasterizacao.md",
    "decisao_motor_ocr": "decisoes/decisao_motor_ocr.md",
    "decisao_parser_sketch": "decisoes/decisao_parser_sketch.md",
    "resultados_rasterizacao": "benchmarks/rasterizacao/resultados_rasterizacao.json",
    "resultados_preprocessamento": "benchmarks/preprocessamento/preprocessamento_resultados.json",
    "ocr_benchmark_relatorio": "benchmarks/ocr/ocr_benchmark_relatorio.json",
    "catalogo_ancoras": "parser_sketch/catalogo_ancoras.json",
    "parser_sketch_resultados": "parser_sketch/parser_sketch_resultados.json"
  }
}
```

## `DocumentBaseline`

```json
{
  "documento_id": "<id>",
  "tipo": "<ESCRITURA_COMPRA_VENDA | MATRICULA>",
  "versao_pipeline": "fase0_v1",
  "motor_ocr": "<string>",
  "perfil_preprocessamento": "<EXPERIMENT_X>",
  "campos_extraidos": {
    "<field_name>": {
      "valor_extraido": "<string | null>",
      "valor_ground_truth": "<string | null>",
      "acerto": <boolean>,
      "confianca_ocr": <number>,
      "metodo_extracao": "REGEX_ROTULO | PADRAO_FIXO | HEURISTICA"
    }
  },
  "metricas_pagina": [
    {
      "pagina": <integer>,
      "cer_texto_geral": <number>,
      "confianca_media_ocr": <number>,
      "marca_dagua_detectada": <boolean>,
      "rodape_filtrado": <boolean>
    }
  ]
}
```

## Validation rules

1. `versao_baseline == "fase0_v1"`.
2. `data_congelamento` after the latest Gate 3 approval timestamp.
3. `hash_arquivo` is the SHA-256 of the file computed per the protocol documented in the freeze decision record.
4. Every document in the 30-document calibration corpus appears in `documentos`.
5. `versao_pipeline` matches the three decision files.
6. `metricas_globais` are computed from the per-document data, not fabricated.
7. For every field listed in `campos_extraidos`, the invariant `acerto ⇔ (valor_extraido == valor_ground_truth after normalization)` holds.
8. No document may appear with a different `versao_pipeline` than `fase0_v1`.

## Hash protocol

Document the exact procedure in `decisoes/` as a technical decision record. Two acceptable protocols:

- **In-file hash:** compute SHA-256 over the file with `hash_arquivo` replaced by a canonical placeholder string. Store result in `hash_arquivo`.
- **Sidecar hash:** write `baseline/fase0_baseline_v1.sha256` containing the hash of the full file. Reference it from `hash_arquivo` optionally.

The protocol chosen is the one used for any future verification.

## Freeze rules

- Only produced after Gate 3 is approved.
- No pipeline changes between Gate 3 approval and freeze.
- Once frozen, the file is read-only.
- Any correction requires an explicit v2 freeze (`fase0_baseline_v2.json`) with a new decision record. v1 remains on disk as historical artifact.

## Comparison script

`benchmarks/scripts/comparar_baseline.ts`:

- Loads the baseline and a new pipeline output.
- Reports per-field regressions (acerto=true → acerto=false) as blocking.
- Flags aggregate drops > 2 percentage points as blocking.
- Output JSON: `{ regressoes_bloqueantes, regressoes_nao_bloqueantes, melhorias, sumario }`.

## Producer

Claude Code, via `benchmarks/scripts/gerar_relatorio.ts` running the full pipeline over the calibration corpus, plus the hash computation step per the freeze decision record.