# Schema — Preprocessing Results

**File:** `benchmarks/preprocessamento/preprocessamento_resultados.json`
**Purpose:** Output of the preprocessing benchmark (Section 5 of the plan). Records CER before/after per experiment per document per page, plus visual inspection and watermark metadata.

---

## Top-level structure

```json
{
  "data": "YYYY-MM-DDTHH:MM:SSZ",
  "ambiente_execucao": {
    "os": "<windows version>",
    "python_version": "3.11.x",
    "opencv_version": "4.9.x",
    "node_version": "v20.x.x"
  },
  "biblioteca_rasterizacao": "<mupdf | poppler>",
  "dpi": 300,
  "corpus_calibracao_total": 30,
  "experimentos": [ <ExperimentDefinition>, ... ],
  "resultados": [ <PreprocResult>, ... ],
  "inspecao_visual": [ <VisualInspection>, ... ],
  "deteccoes_marca_dagua": [ <WatermarkDetection>, ... ],
  "agregados_por_experimento": { <ExperimentAggregate>, ... },
  "experimento_vencedor": "<EXPERIMENT_X>",
  "gate_1_preprocessamento_sub_criterios": {
    "reducao_cer_geral_pct": <number>,
    "condicao_1_reducao_cer_20pct": <boolean>,
    "taxa_filtragem_marca_dagua_pct": <number>,
    "condicao_2_filtragem_95pct": <boolean>,
    "condicao_3_sem_perda_texto_legitimo": <boolean>
  }
}
```

## `ExperimentDefinition`

```json
{
  "id": "A | B | C | D | E | F | <custom>",
  "descricao": "<string>",
  "sequencia": ["<step1>", "<step2>", ...],
  "parametros": { <parameters used in this experiment> }
}
```

All six experiments (A–F) must be defined. Re-runs use a new ID such as `EXPERIMENT_E_v2` and are added, not replaced.

## `PreprocResult`

```json
{
  "documento_id": "<id>",
  "pagina": <integer, 1-indexed>,
  "experimento": "<A | B | C | D | E | F | ...>",
  "tempo_ms": <number>,
  "cer_texto_geral": <number>,
  "cer_cpf": <number>,
  "cer_nomes": <number>,
  "cer_matricula": <number>,
  "cer_reducao_vs_A_pct": <number or null>,
  "marca_dagua_lateral_detectada": <boolean>,
  "marca_dagua_diagonal_detectada": <boolean>,
  "marca_dagua_atenuada": <boolean>,
  "rodape_sistema_detectado": <boolean>,
  "inspecao_visual": {
    "texto_legivel": <boolean>,
    "sem_inversao": <boolean>,
    "sem_perda_caracteres": <boolean>,
    "marca_dagua_atenuada": <boolean or null>,
    "bordas_preservadas": <boolean>
  },
  "erro": "<string | null>"
}
```

| Field | Type | Required | Rule |
|---|---|---|---|
| `documento_id` | string | yes | Matches calibration corpus. |
| `pagina` | integer | yes | 1-indexed. |
| `experimento` | string | yes | Matches one of `experimentos[].id`. |
| `cer_*` | number | yes | Range [0, 1]. 3-decimal precision. Null forbidden if `erro == null`. |
| `cer_reducao_vs_A_pct` | number or null | yes | Null for Experiment A; numeric for others. |
| `marca_dagua_*` | boolean | yes | Even when no watermark expected; reflect detector output. |
| `inspecao_visual` | object | yes | Sampled entries may be `null`-valued on fields that do not apply (e.g., `marca_dagua_atenuada` when no watermark). |
| `erro` | string or null | yes | Null when the run succeeded. |

## `VisualInspection`

Aggregated inspector-level record (the per-result `inspecao_visual` is filled for the sampled pages):

```json
{
  "experimento": "<id>",
  "paginas_inspecionadas": [ {"documento_id": "<id>", "pagina": <n>}, ... ],
  "inspetor": "<n>",
  "observacoes": "<string>"
}
```

At least 5 inspections per experiment are required.

## `WatermarkDetection`

```json
{
  "documento_id": "<id>",
  "pagina": <integer>,
  "esperada_no_catalogo": <boolean>,
  "detectada": <boolean>,
  "tipo": "<LATERAL | DIAGONAL | AMBAS | NENHUMA>",
  "atenuada_com_sucesso": <boolean>,
  "texto_legitimo_preservado": <boolean>
}
```

Drives the computation of `taxa_filtragem_marca_dagua_pct`.

## `ExperimentAggregate`

```json
"EXPERIMENT_X": {
  "cer_texto_geral_medio": <number>,
  "cer_cpf_medio": <number>,
  "cer_nomes_medio": <number>,
  "cer_matricula_medio": <number>,
  "reducao_cer_geral_pct_vs_A": <number>,
  "taxa_deteccao_marca_dagua_pct": <number>,
  "taxa_atenuacao_correta_pct": <number>,
  "paginas_com_perda_texto_legitimo": <integer>
}
```

## Validation rules

1. Every calibration document appears in `resultados` under every defined experiment, or has an `erro` entry.
2. `experimento_vencedor` exists in `experimentos[].id`.
3. The winning experiment has `paginas_com_perda_texto_legitimo == 0`, largest `reducao_cer_geral_pct_vs_A`, `taxa_atenuacao_correta_pct >= 95` (when watermarked pages exist).
4. Aggregates computed from raw `resultados`, not fabricated.
5. `corpus_calibracao_total == 30`.
6. `biblioteca_rasterizacao` matches the Gate 1 rasterization decision.

## Producer

Claude Code, via `benchmarks/preprocessamento/run_benchmark_preprocessamento.ts` plus Python preprocessing helpers under `ferramentas/preprocessamento/`. Visual inspection performed by the technical lead or a delegate.