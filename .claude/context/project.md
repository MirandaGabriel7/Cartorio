# Context — Project

**Project:** CartórioDoc — Document Conference System for Real Estate Registration
**Phase:** 0 — Document and Pipeline Validation
**Source of truth:** `fase0_plano_execucao.md` (version 1.0, dated 2026-04-15)
**Reference specification:** Technical Plan v1.3

---

## What the product is

CartórioDoc is a desktop system (Electron-based, offline-first) that supports notary and registry professionals (conferentes registrais) in Brazilian cartórios during the review of real estate titles (escrituras) against property records (matrículas). It ingests PDF documents, runs OCR and parsing, and drives a structured checklist that surfaces discrepancies and legal impediments before registration.

The product is targeted at Minas Gerais (MG) cartórios as the initial market, reflected in corpus variability (MG-specific watermarks, formats, and tabelionato conventions).

## What Phase 0 is for

Phase 0 is the risk-elimination phase. Its objective is to produce three validated technical decisions that commit the project to a specific pipeline architecture before Phase 1 production development begins:

1. Which **rasterization library** (mupdf vs. poppler) is primary on Windows.
2. Which **OCR engine** (Tesseract 5 vs. PaddleOCR) and **preprocessing profile** deliver the required CER thresholds on real Brazilian cartório documents.
3. Whether **deterministic field parsing** is feasible for the critical fields (CPF, matrícula, transmitente name) at ≥ 85% accuracy, and what anchor catalog will seed Phase 1.

Phase 0 also produces a frozen **regression baseline** against which Phase 1 and beyond measure changes.

## What Phase 0 does NOT produce

Phase 0 produces **exploratory tooling only** — benchmark scripts, parser sketches, validation scripts, decision records, reports, JSON artifacts. It does **not** produce:

- Production code.
- Electron shell or UI.
- Production database schemas.
- Rules engine.
- Export module.
- Installer.
- Any internet-dependent component.
- Any LLM-dependent component.

Full scope boundaries in `rules/phase0-scope.md` and Section 1.3 of the plan.

## Key constraints

- **Offline.** Benchmarks run on air-gapped Windows machines. No network during execution.
- **Windows.** Target OS is Windows 10/11 64-bit; benchmarks must reflect this environment.
- **No generative AI.** All document processing uses deterministic tools (OpenCV, Tesseract, PaddleOCR, regex-based parsers).
- **Human-gated.** Three sequential gates require approval by the technical lead; Phase 0 closure requires a signed final report.

## Stakeholders

| Role | Responsibility |
|---|---|
| Technical lead (human engineer) | Gate approvals, Phase 0 closure sign-off, corpus exclusion approvals, plan modifications |
| Annotators (human) | Corpus anonymization, ground truth, anonymization verification |
| Senior registry reviewer (human) | Tie-breaking on ground-truth discordances |
| Cartório-alvo | Source of corpus documents |
| Claude Code | Benchmark execution, parser sketch implementation, artifact and report generation, log maintenance |

## Key numeric targets

| Metric | Target |
|---|---|
| Corpus size | ≥ 145 documents |
| Calibration corpus (2-annotator) | ≥ 30 documents |
| CER CPF/CNPJ | ≤ 1% |
| CER Matrícula | ≤ 1% |
| CER Nomes | ≤ 3% |
| CER Texto geral | ≤ 5% |
| Parser accuracy — critical fields | ≥ 85% |
| Anchor catalog coverage | ≥ 80% fields × ≥ 80% documents |
| Preprocessing CER reduction | ≥ 20% vs. raw |
| Watermark filtering | ≥ 95% on watermarked pages |
| Rasterization error rate | 0% on 20-doc sample |

Full references in `context/metrics-thresholds.md`.

## Expected duration

5 to 6 weeks of calendar time, assuming the parallelism described in Section 9 of the plan.

## What success looks like

At the end of Phase 0:

- Three signed decision files under `decisoes/`.
- One frozen baseline file with a verifiable hash.
- A corpus of ≥ 145 anonymized documents with ground truth of stated quality.
- A final report synthesizing the decisions with explicit Phase 1 recommendations.
- A chronological execution log documenting every activity, every decision, every gate signal, every error.

## What failure looks like

If Gate 2 fails after two corrective iterations, or Gate 3 reveals that critical-field extraction is not deterministically feasible at the required accuracy, Phase 0 does not close and Phase 1 is not authorized. The technical lead decides whether to revise the plan, change tooling, or pause the project.