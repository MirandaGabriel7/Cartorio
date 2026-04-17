# Schema — OCR Benchmark Report

**File:** `benchmarks/ocr/ocr_benchmark_relatorio.json`
**Purpose:** Aggregate output of the OCR benchmark (Section 6 of the plan). Per-engine CER per field class, gate evaluation, per-document detail.

---

## Top-level structure

```json
{
  "data": "YYYY-MM-DDTHH:MM:SSZ",
  "ambiente_execucao": {
    "os": "<windows version>",
    "node_version": "v20.x.x",
    "python_version": "3.11.x",
    "tesseract_version": "5.x.x",
    "paddleocr_version": "2.7.3"
  },
  "corpus_calibracao_total": 30,
  "biblioteca_rasterizacao": "<mupdf | poppler>",
  "dpi": 300,
  "perfil_preprocessamento": "<EXPERIMENT_X>",
  "motores_avaliados": ["tesseract", "paddleocr"],
  "normalizacao_cer": {
    "descricao": "uppercase; NFD strip accents; collapse whitespace; remove punctuation; trim",
    "biblioteca": "fastest-levenshtein"
  },
  "resultados_por_motor": {
    "tesseract": <MotorResults>,
    "paddleocr": <MotorResults>
  },
  "detalhamento_por_documento": [ <DocumentDetail>, ... ],
  "selecao": {
    "motor_escolhido": "<tesseract | paddleocr>",
    "cer_ponderado": {
      "tesseract": <number>,
      "paddleocr": <number>
    },
    "regra_aplicada": "<string>"
  },
  "gate_2_criterios": {
    "alguem_atinge_todos_limiares": <boolean>,
    "tesseract_atinge_todos": <boolean>,
    "paddleocr_atinge_todos": <boolean>
  },
  "iteracoes_corretivas": [ <CorrectiveIteration>, ... ]
}
```

## `MotorResults`

```json
{
  "cer_cpf_cnpj": <number>,
  "cer_matricula": <number>,
  "cer_nomes": <number>,
  "cer_texto_geral": <number>,
  "tempo_medio_por_pagina_ms": <number>,
  "gate_cpf_aprovado": <boolean>,
  "gate_matricula_aprovado": <boolean>,
  "gate_nomes_aprovado": <boolean>,
  "gate_texto_geral_aprovado": <boolean>,
  "todos_limiares_aprovados": <boolean>,
  "documentos_processados": <integer>,
  "paginas_processadas": <integer>,
  "erros": [
    { "documento_id": "<id>", "pagina": <n>, "motor": "<motor>", "erro": "<string>" }
  ]
}
```

CER thresholds:

| Field class | Threshold |
|---|---|
| CPF / CNPJ | ≤ 0.01 |
| Matrícula | ≤ 0.01 |
| Nomes | ≤ 0.03 |
| Texto geral | ≤ 0.05 |

## `DocumentDetail`

```json
{
  "documento_id": "<id>",
  "total_paginas": <integer>,
  "motores": {
    "tesseract": {
      "cer_cpf_cnpj": <number>,
      "cer_matricula": <number>,
      "cer_nomes": <number>,
      "cer_texto_geral": <number>,
      "tempo_total_ms": <number>,
      "confianca_media": <number>
    },
    "paddleocr": { ... }
  }
}
```

## `CorrectiveIteration`

Tracked when the first OCR run failed Gate 2 and corrective action per Section 6.5 (refine preprocessing, re-run) is taken. Up to 2 iterations permitted before escalation.

```json
{
  "iteracao": <integer>,
  "data": "YYYY-MM-DDTHH:MM:SSZ",
  "acao": "<string describing preprocessing adjustment>",
  "resultado_sumario": "<string>",
  "perfil_preprocessamento_usado": "<EXPERIMENT_X_vN>"
}
```

## Per-page raw artifacts

Stored separately under `benchmarks/ocr/ocr_resultados/<motor>/<documento_id>/pagina_<n>.json`:

```json
{
  "documento_id": "<id>",
  "motor": "<tesseract | paddleocr>",
  "pagina": <integer>,
  "timestamp": "YYYY-MM-DDTHH:MM:SSZ",
  "tempo_processamento_ms": <number>,
  "texto_completo": "<string>",
  "confianca_media": <number>,
  "total_blocos": <integer>,
  "blocos": [
    {
      "texto": "<string>",
      "confianca": <number>,
      "bbox": { "x0": <n>, "y0": <n>, "x1": <n>, "y1": <n> }
    }
  ],
  "perfil_preprocessamento": "<EXPERIMENT_X>",
  "erro": "<string | null>"
}
```

## Validation rules

1. `corpus_calibracao_total == 30`.
2. Every calibration document appears in `detalhamento_por_documento` for both engines (or `erros`).
3. `selecao.motor_escolhido` matches the engine named in `decisoes/decisao_motor_ocr.md`.
4. `perfil_preprocessamento` matches the Gate 1 winning experiment.
5. Weighted CER = (3·cpf + 3·matricula + 2·nomes + 1·texto_geral) / 9.
6. No engine other than Tesseract and PaddleOCR appears in results.
7. Aggregates are computed from raw per-page results, not fabricated.

## Producer

Claude Code, via `benchmarks/ocr/run_benchmark_ocr.ts` orchestrating the Tesseract invocation and the PaddleOCR Python worker.