# Playbook — Rasterization Benchmark

Governs the execution of the rasterization benchmark specified in Section 4 of the plan. Choose the primary rasterization library between `mupdf` and `poppler` based on quality, performance, and reliability measurements over real documents.

---

## Preconditions

- Environment verified per `rules/execution-environment.md`.
- `mupdf` installed via `npm install mupdf`.
- Poppler binary installed with `pdftoppm` available in PATH.
- At least 10 anonymized documents in `corpus/anonimizados/` covering the required categories.
- Corpus catalog updated to include these documents.
- Activity start logged in `relatorios/log_execucao.md`.

## Protocol

### Step 1 — Select the 20-document sample

Run `selecionarAmostraRepresentativa` from `benchmarks/rasterizacao/run_benchmark_rasterizacao.ts` with quotas:

| Category        | Quota |
| --------------- | ----- |
| `ESC-BOA`       | 5     |
| `ESC-DEG`       | 5     |
| `MAT-ATUAL-BOA` | 5     |
| `MAT-MONO`      | 3     |
| `ESC-MARCA`     | 2     |

The function selects deterministically by sorting on `documento_id`. Record the selected IDs in the output JSON.

### Step 2 — Declare parameters

In the activity log entry, declare:

- DPIs to test: **300 and 400**
- Page to rasterize per document: **page 0** (first page)
- Output format: PNG
- Both libraries executed on every sample × DPI combination

### Step 3 — Execute

Run:

```
npm run benchmark:rasterizacao
```

For each document × DPI combination:

- Rasterize with mupdf; save output PNG; record time, file size, width, height.
- Rasterize with poppler (`pdftoppm`); save output PNG; record the same.
- On error, record `erro` field and proceed.

### Step 4 — Collect results

Output: `benchmarks/rasterizacao/resultados_rasterizacao.json` per `schemas/rasterization-results.md`. Each row: `documento_id`, `pagina`, `biblioteca`, `dpi`, `tempo_ms`, `tamanho_bytes`, `largura_px`, `altura_px`, `erro`.

### Step 5 — Visual inspection

Choose 10 documents from the sample. For each, open the mupdf and poppler PNGs side-by-side at 300 DPI and evaluate against the checklist:

- Sharp text (yes/no)
- Well-defined character edges (yes/no)
- Rasterization artifacts present (yes/no)

Record per-pair results in the `inspecao_visual` section of the results JSON. The technical lead or delegate performs the inspection; Claude does not judge alone.

### Step 6 — Compute aggregates

- Mean rasterization time per library per DPI.
- Mean file size per library per DPI.
- Error rate per library.
- Effective resolution check: for each run, verify that `largura_px ≈ largura_polegadas × dpi` with a 2% tolerance.

Write aggregates to the results JSON under an `agregados` section.

### Step 7 — Apply gate criteria

Gate 1 rasterization sub-criteria (per Section 4.5):

1. mupdf error rate = 0% in the 20-doc sample.
2. mupdf mean time ≤ 1.5 × poppler mean time.
3. mupdf produces text as sharp as or sharper than poppler in ≥ 18 of 20 documents via visual inspection.
4. Effective resolution matches requested DPI in 100% of cases.

If all four are satisfied: mupdf is recommended as primary.
If any fails: poppler is recommended as primary.
If both fail on reliability: investigate failing documents, exclude only with justification, rerun.

### Step 8 — Hand off

Once results are complete and visually inspected:

1. Log `CONCLUDED` with path to `resultados_rasterizacao.json`.
2. Hand off to `gate-verifier` for Gate 1 (rasterization portion; preprocessing portion still pending).

## Integrity reminders

- Do not adjust DPIs or sample after seeing results.
- Do not drop outliers.
- Do not cherry-pick visual inspection results.
- Keep all generated sample PNGs under `benchmarks/rasterizacao/amostras/` for auditability.

## What not to do

- Do not introduce a third library.
- Do not skip poppler because "mupdf obviously wins".
- Do not benchmark with fewer DPIs than specified.
- Do not run only one document per library as a "sanity check" and skip the full run.
