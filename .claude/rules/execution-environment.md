# Rule — Execution Environment

## Principle

Benchmarks must reflect the target platform — Windows 10/11 with the exact tool versions specified in Section 2 of the plan. Running on a different environment invalidates the results.

---

## Required environment

| Component  | Version                                    | Role                                 |
| ---------- | ------------------------------------------ | ------------------------------------ |
| OS         | Windows 10/11 64-bit                       | Product target platform              |
| Node.js    | 20 LTS (≥ 20.11.0)                         | Benchmark and parser-sketch runtime  |
| Python     | 3.11.x                                     | PaddleOCR and preprocessing scripts  |
| TypeScript | 5.4.x                                      | Benchmark and parser-sketch language |
| npm        | ≥ 10.0.0                                   | Node package manager                 |
| Git        | ≥ 2.40                                     | Source control                       |
| Tesseract  | 5.x with `tessdata_best` `por.traineddata` | OCR engine candidate                 |
| Poppler    | latest Windows build                       | Rasterization fallback + benchmark   |
| mupdf      | npm package `mupdf` ≥ 0.4.0                | Rasterization primary candidate      |

The complete list including Python packages is in `context/metrics-thresholds.md` and in Section 2 of the plan.

## Setup is the responsibility of a script

The only authorized setup path is running `scripts/setup_ambiente.ps1` as Administrator in PowerShell. Claude does not install tools by any other means.

If the setup script fails, Claude:

1. Logs the failure.
2. Does not attempt alternative installation paths (no `choco install`, no manual downloads).
3. Waits for the technical lead to fix the environment.

## Environment verification before every activity

At the start of every benchmark activity, Claude runs a verification step:

```
node --version      # expect v20.x
python --version    # expect 3.11.x
tesseract --version # expect 5.x
pdftoppm -v         # expect present
```

The versions observed are recorded in the run's output JSON under a `ambiente_execucao` / `execution_environment` section.

## No internet during benchmarks

Benchmarks run offline. This means:

- Model weights are pre-installed.
- No NPM/pip install during execution.
- No dynamic downloading of tessdata.
- No remote OCR APIs.
- No telemetry.

If any network call is triggered by accident, the run is invalidated and re-started after the cause is removed.

## File system layout expectations

| Path                              | Purpose                                             |
| --------------------------------- | --------------------------------------------------- |
| `corpus/originais/`               | Original PDFs, **never committed to git**           |
| `corpus/anonimizados/`            | Anonymized PDFs, **never committed to git**         |
| `corpus/ground_truth/`            | Annotated JSON per document                         |
| `corpus/corpus_catalog.json`      | Master catalog, committed                           |
| `benchmarks/*/amostras/`          | Visual samples for inspection, **not committed**    |
| `benchmarks/*/resultados_*.json`  | Benchmark output JSON, committed                    |
| `parser_sketch/`                  | Anchor catalog and parser sketch outputs, committed |
| `baseline/fase0_baseline_v1.json` | Frozen baseline, committed                          |
| `decisoes/*.md`                   | Gate decision files, committed                      |
| `relatorios/*.md`                 | Reports and log, committed                          |
| `temp/`                           | Scratch space, gitignored                           |

Claude writes to `temp/` freely. Claude writes to `corpus/`, `benchmarks/`, `parser_sketch/`, `baseline/`, `decisoes/`, `relatorios/` only per the plan, and never overwrites without a logged reason.

## Git discipline

- No original or anonymized PDFs ever committed to git.
- No ground truth files containing real PII, only the anonymized values.
- The `.gitignore` includes: `corpus/originais/`, `corpus/anonimizados/`, `temp/`, `node_modules/`, `dist/`, `**/amostras/*.png`.
- Benchmark output JSONs are committed so that decisions are auditable.

## Working directory

All commands run from the repository root. Paths in scripts are relative to the repository root. If the setup script was run, diretories required by the plan already exist; Claude does not create alternative directory structures.
