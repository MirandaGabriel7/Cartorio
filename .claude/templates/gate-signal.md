# Template — Gate Signal

Copy this block into `relatorios/log_execucao.md` when the conditions of a gate have been verified. This entry signals readiness; it does NOT declare approval. Approval is the sole authority of the technical lead.

---

```markdown
## [YYYY-MM-DD HH:MM] 🚩 GATE <N> — READY FOR APPROVAL

**Gate:** <Gate 1: Rasterization + Preprocessing | Gate 2: OCR Engine | Gate 3: Parser Sketch>

**Conditions verified:**

- [x] Condition 1: <description> — result: <numeric value + source file path>
- [x] Condition 2: <description> — result: <numeric value + source file path>
- [x] Condition N: <description> — result: <numeric value + source file path>

**Evidence:**

- Benchmark JSON(s): <path(s)>
- Decision draft: <decisoes/decisao\_\*.md>
- Checklist completed: <checklists/gate-N-\*.md>

**Pipeline state at signal:**

- Rasterization library: <mupdf | poppler | pending>
- Preprocessing profile: <EXPERIMENT_X | pending>
- OCR engine: <tesseract-5.x.x | paddleocr-2.7.3 | pending>
- Parser sketch version: <1.0 | pending>

**Action required:** Approval by the technical lead.
**Status:** Awaiting signature on <path to decision file>.
**Activities permitted while waiting:** <list the parallelizable activities per Section 9 of the plan, or "none">.
```

---

## Rules

- Every condition must be listed, not summarized.
- Each condition result must cite the source artifact path.
- "Approved" must not appear in this entry.
- The technical lead's approval is a separate subsequent entry (`GATE N APPROVED`) made after the decision file is signed.

## Retraction

If a signal is retracted:

```markdown
## [YYYY-MM-DD HH:MM] ⛔ GATE <N> SIGNAL RETRACTED

**Previous signal:** [YYYY-MM-DD HH:MM] reference
**Reason for retraction:** <verbatim>
**Action:** Resume the work needed to re-meet the conditions. The decision file is revised, not deleted.
```

## Approval (written by the technical lead or dictated to Claude)

```markdown
## [YYYY-MM-DD HH:MM] ✅ GATE <N> APPROVED

**Approved by:** <technical lead name>
**Decision file signed:** <path>
**Next activity authorized:** <activity name>
```
