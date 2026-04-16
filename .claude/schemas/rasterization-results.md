# Schema — Rasterization Results

**File:** `benchmarks/rasterizacao/resultados_rasterizacao.json`
**Purpose:** Output of the rasterization benchmark (Section 4 of the plan).

---

## Top-level structure

```json
{
  "data": "YYYY-MM-DDTHH:MM:SSZ",
  "ambiente_execucao": {
    "os": "Windows 10/11 version",
    "node_version": "v20.x.x",
    "mupdf_version": "0.x.x",
    "poppler_pdftoppm_version": "x.xx.x"
  },
  "amostra_selecionada": [ "<documento_id>", ... ],
  "dpis": [300, 400],
  "resultados": [ <RasterResult>, ... ],
  "inspecao_visual": [ <VisualInspection>, ... ],
  "agregados": { <Aggregates> }
}
```

## `RasterResult`

```json
{
  "documento_id": "<id>",
  "pagina": 0,
  "biblioteca": "<mupdf | poppler>",
  "dpi": 300,
  "tempo_ms": <number>,
  "tamanho_bytes": <integer>,
  "largura_px": <integer>,
  "altura_px": <integer>,
  "erro": "<string | null>"
}
```

| Field           | Type           | Required | Rule                                                            |
| --------------- | -------------- | -------- | --------------------------------------------------------------- |
| `documento_id`  | string         | yes      | Matches corpus catalog entry.                                   |
| `pagina`        | integer        | yes      | 0-indexed; typically 0 (first page).                            |
| `biblioteca`    | string         | yes      | `"mupdf"` or `"poppler"`.                                       |
| `dpi`           | integer        | yes      | 300 or 400.                                                     |
| `tempo_ms`      | number         | yes      | Elapsed wall-clock time for the rasterization call. 0 if error. |
| `tamanho_bytes` | integer        | yes      | Size of the output PNG. 0 if error.                             |
| `largura_px`    | integer        | yes      | Width in pixels. 0 if error.                                    |
| `altura_px`     | integer        | yes      | Height in pixels. 0 if error.                                   |
| `erro`          | string or null | yes      | Error message if the run failed; otherwise `null`.              |

## `VisualInspection`

```json
{
  "documento_id": "<id>",
  "dpi_inspecionado": 300,
  "mupdf_texto_nitido": <boolean>,
  "poppler_texto_nitido": <boolean>,
  "mupdf_bordas_definidas": <boolean>,
  "poppler_bordas_definidas": <boolean>,
  "mupdf_artefatos": <boolean>,
  "poppler_artefatos": <boolean>,
  "inspetor": "<name>",
  "observacoes": "<string>"
}
```

At least 10 documents must have a `VisualInspection` entry. The inspector is the technical lead or a delegate.

## `Aggregates`

```json
{
  "mupdf": {
    "tempo_medio_ms_300dpi": <number>,
    "tempo_medio_ms_400dpi": <number>,
    "tamanho_medio_kb_300dpi": <number>,
    "tamanho_medio_kb_400dpi": <number>,
    "erros_total": <integer>,
    "taxa_erro": <number>,
    "resolucao_conforme_100pct": <boolean>,
    "texto_tao_ou_mais_nitido_que_alternativa_em_N_de_20": <integer>
  },
  "poppler": { ... same fields ... },
  "gate_1_rasterizacao_sub_criterios": {
    "biblioteca_primaria_sugerida": "<mupdf | poppler>",
    "condicao_1_taxa_erro_zero": <boolean>,
    "condicao_2_tempo_aceitavel": <boolean>,
    "condicao_3_visual_nitidez": <boolean>,
    "condicao_4_resolucao_conforme": <boolean>
  }
}
```

## Validation rules

1. `resultados` has `len(amostra_selecionada) × 2 libs × 2 DPIs` entries (±errors).
2. Every `documento_id` in `resultados` appears in `amostra_selecionada`.
3. `inspecao_visual` has ≥ 10 entries.
4. `agregados` values are computed from `resultados`, not fabricated.
5. `gate_1_rasterizacao_sub_criterios.biblioteca_primaria_sugerida` matches the library cited in `decisoes/decisao_rasterizacao.md`.

## Producer

Claude Code, via `benchmarks/rasterizacao/run_benchmark_rasterizacao.ts` and the visual inspection subroutine supported by the technical lead.
