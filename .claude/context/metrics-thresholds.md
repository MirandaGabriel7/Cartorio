# Context — Metrics and Thresholds

Authoritative list of numeric targets for Phase 0. Sourced from `fase0_plano_execucao.md`. These numbers must never be loosened by Claude Code.

---

## Corpus

| Metric | Target | Source |
|---|---|---|
| Total corpus size | ≥ 145 documents | Section 3.1 |
| Calibration corpus (2 annotators, resolved discordances) | ≥ 30 documents | Section 3.4, Section 10.2 |
| Remainder (docs 31–145) | 1 annotator + 20% second-annotator review | Section 3.4.3 |
| Anonymization verification | 100% of anonymized docs verified by second annotator | Section 3.2.3 |

## Category quotas

| Category | Min |
|---|---|
| MAT-ATUAL-BOA | 20 |
| MAT-ATUAL-DEG | 15 |
| MAT-MONO | 10 |
| MAT-ONUS | 10 |
| MAT-RURAL | 5 |
| MAT-TRANSP | 5 |
| ESC-NATIVA | 5 |
| ESC-BOA | 15 |
| ESC-DEG | 15 |
| ESC-BAIXA | 10 |
| ESC-MULTI | 10 |
| ESC-PJ | 5 |
| ESC-ROGO | 5 |
| ESC-MARCA | 10 |
| ESC-PRENOT | 5 |
| **Total** | **145** |

## Gate 1 — Rasterization

| Metric | Threshold |
|---|---|
| Sample size | Exactly 20 documents |
| DPIs tested | 300 and 400 |
| Chosen library error rate | 0% |
| Chosen library mean time | ≤ 1.5 × alternative mean time |
| Visual sharpness preference (sample of 10) | Chosen library ≥ 18 of 20 documents |
| Effective resolution conformance | 100% of runs |

## Gate 1 — Preprocessing

| Metric | Threshold |
|---|---|
| Experiments evaluated | A, B, C, D, E, F (all six) |
| Mean CER reduction (winning experiment vs. A) | ≥ 20% |
| Watermark filtering correctness (on watermarked pages) | ≥ 95% |
| Legitimate text removal cases | 0 |
| Visual inspection per experiment | ≥ 5 sampled pages per experiment |

## Gate 2 — OCR

| Field class | Threshold |
|---|---|
| CER CPF/CNPJ | ≤ 0.01 |
| CER Matrícula | ≤ 0.01 |
| CER Nomes | ≤ 0.03 |
| CER Texto geral | ≤ 0.05 |

Weighted CER formula for tie-breaking: `(3·CPF + 3·Matrícula + 2·Nomes + 1·Texto_geral) / 9`. Tie within 0.5% → Tesseract wins.

Evaluation base: 30 documents × 2 engines × pages.

Corrective iteration limit: 2 preprocessing refinement iterations before escalation.

## Gate 3 — Parser Sketch

| Metric | Threshold |
|---|---|
| `transmitente_1_cpf` accuracy | ≥ 0.85 |
| `matricula` accuracy (escritura) | ≥ 0.85 |
| `matricula_numero` accuracy (matricula) | ≥ 0.85 |
| `transmitente_1_nome` / `proprietario_1_nome` accuracy | ≥ 0.85 |
| Anchor coverage: fields covered | ≥ 80% of Section 17 fields |
| Anchor coverage: documents | ≥ 80% of calibration corpus |

Non-critical fields below 0.85: documented as Phase 1 pendencies, do not block Gate 3.

## Baseline

| Metric | Rule |
|---|---|
| Freeze precondition | All three gates approved |
| Documents in baseline | The 30 calibration documents |
| Hash algorithm | SHA-256, verifiable |
| Version | `fase0_v1` |
| Immutability | Read-only after freeze |

## Regression comparison (post-baseline)

| Type | Classification |
|---|---|
| Any field `acerto=true` → `acerto=false` | Regression (blocking if aggregate drop > 2 percentage points) |
| Drop in aggregate accuracy ≤ 2 pp | Non-blocking regression |
| Any improvement | Logged, not blocking |

## Error handling thresholds

| Situation | Threshold |
|---|---|
| Document-level failures per stage | Proceed if ≤ 10% of corpus; escalate if > 10% |
| Corrective iterations allowed before escalation | 2 |
| Retries on the same integrity violation | 0 (run is invalidated, not retried) |

## Precision rules

| Artifact area | Precision |
|---|---|
| CER values | 3 decimals |
| Accuracy percentages | 2 decimals (0.00–1.00) |
| Times | Integer milliseconds |
| Monetary values | Integer cents |
| Percentages in reports | 1 decimal |

## Thresholds that Claude Code NEVER adjusts

All thresholds above are fixed by the plan. Claude never rounds up to cross a threshold, never reinterprets a threshold to favor a result, never aggregates in a way the plan does not specify.