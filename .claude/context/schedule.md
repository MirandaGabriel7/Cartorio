# Context — Schedule

Execution sequence from Section 9 of the plan. Claude Code uses this as the authoritative order of activities. Activity names below must appear verbatim in activity log entries.

---

## Activity list

| # | Activity | Duration | Depends on | Parallelizable with |
|---|---|---|---|---|
| 1 | Setup do ambiente | 1 day | — | — |
| 2 | Coleta do corpus (145 documentos) | 5 days | #1 | — |
| 3 | Anonimização do corpus | 3 days | #2 | — |
| 4 | Catalogação e nomenclatura | 1 day | #3 | — |
| 5 | Anotação ground truth — primeiros 30 docs (2 anotadores) | 8 days | #4 | — |
| 6 | Benchmark de rasterização | 2 days | #5 partial (10 anonymized docs sufficient) | #5 continues in parallel |
| 7 | Benchmark de pré-processamento | 4 days | #6 (rasterization approved) | #5 continues in parallel |
| 8 | Benchmark de OCR | 4 days | #7 (preprocessing approved) + #5 complete (30 annotated) | — |
| 9 | Parser sketch — exploração de âncoras | 3 days | #8 (OCR approved) | — |
| 10 | Parser sketch — implementação e medição | 3 days | #9 | — |
| 11 | Anotação ground truth — restante do corpus (docs 31–145) | 5 days | #4 | #9, #10 |
| 12 | Congelamento do baseline | 1 day | #10 (all three gates approved) | — |
| 13 | Relatório final e decisões | 2 days | #12 | — |

**Total estimated: 5 to 6 weeks** (with parallelism allowed).

## Critical (non-parallelizable) dependencies

- #6 requires ≥ 10 anonymized documents, not the full ground truth.
- #7 depends on the rasterization decision (Gate 1 rasterization portion).
- #8 depends on the approved preprocessing pipeline AND the 30-document calibration corpus complete.
- #9 and #10 depend on the approved OCR engine (Gate 2).
- #12 depends on all three gates approved.

## Permitted parallelism

- Ground truth annotation (#5) may continue while rasterization and preprocessing benchmarks (#6, #7) execute on smaller subsets.
- Annotation of the remainder of the corpus (#11) may proceed in parallel with the parser sketch activities (#9, #10).

## Mapping activities to gates

| Activity | Gate |
|---|---|
| #6 | Gate 1 (rasterization sub-criteria) |
| #7 | Gate 1 (preprocessing sub-criteria) |
| #8 | Gate 2 |
| #9, #10 | Gate 3 |
| #12 | Post-Gate-3 baseline freeze |
| #13 | Final report + Phase 0 closure |

## Parallelizability rules (hard)

When in doubt, serial. Claude Code runs activities in parallel only when Section 9 explicitly allows it. The defaults:

- Do not start #7 before Gate 1 rasterization portion is approved.
- Do not start #8 before the preprocessing portion of Gate 1 is approved AND the 30 documents have full ground truth with resolved discordances.
- Do not start #9 before Gate 2 is approved.
- Do not start #12 before Gate 3 is approved.
- Do not start #13 before the baseline is frozen and hashed.

## What "approved" means

See `rules/sequential-gates.md` and `rules/human-authority.md`. A gate is approved only when:

1. Decision file is signed by the technical lead.
2. `GATE N APPROVED` entry exists in `relatorios/log_execucao.md`.

Both conditions must be present.

## Drift guardrails

- Do not start activity N+1 before activity N is logged as `CONCLUDED`.
- Do not execute two non-parallelizable activities in the same turn.
- Log every activity transition as a new entry.