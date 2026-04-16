# Rule — Phase 0 Scope

## What Phase 0 produces

Phase 0 produces three validated technical decisions and a frozen regression baseline. Nothing else.

1. **Rasterization decision** — which library (mupdf or poppler) becomes primary on Windows.
2. **Preprocessing pipeline + OCR engine decision** — which preprocessing sequence combined with which OCR engine (Tesseract 5 or PaddleOCR) meets the CER thresholds of plan v1.3 on real scanned documents.
3. **Parsing feasibility decision** — whether critical fields (CPF, registration number, grantor name) are extractable deterministically from real OCR text with ≥ 85% accuracy, and which anchor catalog will feed the Phase 1 production parsers.

Each decision is recorded in a dedicated Markdown file under `decisoes/`:

- `decisoes/decisao_rasterizacao.md`
- `decisoes/decisao_motor_ocr.md`
- `decisoes/decisao_parser_sketch.md`

## What Phase 0 does NOT produce

Explicitly excluded from Phase 0. Writing any of the following is scope violation:

- Production code (any code intended to ship with the final product)
- Electron integration (shell, preload bridge, IPC)
- User interface (React, components, screens)
- Production SQLite database (production schema, migrations)
- Rule engine / checklist engine
- Export module (PDF/DOCX)
- Audit module
- Production confidence system
- Packaging and installer
- Any internet dependency during execution
- Any use of generative AI

## The three deliverable categories

| Category                | Examples                                                                             | Who produces                   |
| ----------------------- | ------------------------------------------------------------------------------------ | ------------------------------ |
| Corpus artifacts        | `corpus/corpus_catalog.json`, anonymized PDFs, ground truth JSONs                    | Claude Code + human annotators |
| Benchmark artifacts     | `benchmarks/**/*.json`, visual samples                                               | Claude Code                    |
| Parser sketch artifacts | `parser_sketch/catalogo_ancoras.json`, `parser_sketch/parser_sketch_resultados.json` | Claude Code                    |
| Baseline                | `baseline/fase0_baseline_v1.json`                                                    | Claude Code                    |
| Decision records        | `decisoes/decisao_*.md`                                                              | Claude Code + human approval   |
| Reports                 | `relatorios/*.md`                                                                    | Claude Code + human approval   |

The full list with completion criteria is in `checklists/mandatory-deliverables.md`.

## Scope boundary test

Before starting any activity, answer:

1. Is this activity listed in Sections 3–8 of `fase0_plano_execucao.md`?
2. Does it produce one of the mandatory deliverables in Section 11?
3. Does it contribute to one of the three gate decisions?

If all three answers are **no**, the activity is out of scope. Stop and report.

## Code written during Phase 0

Scripts written during Phase 0 (benchmarks, parser sketch, anonymization, validation) are **exploratory tooling**, not production code. They live under `benchmarks/`, `parser_sketch/`, `scripts/`, `ferramentas/`. They do not get refactored for production. They do not get integrated with Electron. They do not need production-grade error handling beyond what the benchmark protocol requires.

## Scope drift triggers

Any of the following is scope drift and must be stopped immediately:

- Writing TypeScript/JavaScript that imports from Electron, React, or any UI library
- Creating a database schema beyond what the corpus catalog requires
- Connecting to any URL during benchmark execution
- Calling any LLM or AI API during document processing
- "While I'm here, I'll refactor…" behavior
- Adding features to the parser sketch beyond the priority fields in Section 7.1 of the plan

When detected, log it in `relatorios/log_execucao.md` under a `SCOPE DRIFT DETECTED` heading and revert the change.
