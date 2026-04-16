# Template — Technical Decision Record

Use this block within the relevant decision file under `decisoes/` (`decisao_rasterizacao.md`, `decisao_motor_ocr.md`, `decisao_parser_sketch.md`) whenever a technical choice is made during execution. One decision per record. Append; do not rewrite.

---

```markdown
### Technical decision [YYYY-MM-DD HH:MM] — <short title>

**Context:** <Why this decision was necessary. What triggered it: a result that hit a threshold edge, a document that failed, a parameter that was ambiguous. 2–4 sentences.>

**Alternatives considered:**

1. <Alternative A> — pros / cons.
2. <Alternative B> — pros / cons.
3. <Alternative C (if any)> — pros / cons.

**Decision taken:** <The chosen alternative, stated explicitly.>

**Justification:** <The data that supports the decision. Cite artifact paths and specific numbers. No marketing language.>

**Impact on the pipeline:**

- <What changes downstream: parameters, artifacts, expected re-runs.>
- <Any ripple effect on other gates or deliverables.>

**Approved by:** <technical lead name if the decision requires approval; otherwise "Claude Code, within delegated scope of this gate.">

**Evidence artifacts:**

- <path 1>
- <path 2>
```

---

## When to use this template

- A parameter was ambiguous in the plan and had to be resolved.
- A document was excluded from the corpus — the justification goes here.
- A benchmark was re-run and the reason must be recorded.
- A threshold edge case required interpretation.
- A parser anchor set was extended with a variant not in the original plan.
- Any choice Claude made that a future auditor could question.

## When NOT to use this template

- Routine execution steps (those go in `relatorios/log_execucao.md` via `templates/activity-log-entry.md`).
- Gate signals (those use `templates/gate-signal.md`).
- Gate approval (those are signed on the decision file itself, not in a decision record).

## Rules

- One decision per record.
- Append only. Do not rewrite prior records.
- If a past decision is superseded, write a new record that references the old one and explains the supersession.
- Every decision record must name at least one evidence artifact.
- Every decision record must state pipeline impact, even if the impact is "none".

## Examples of decisions that belong here

- "Excluded `matricula_onus_007` from OCR calibration because the PDF is password-protected and cannot be opened by either library."
- "Chose `EXPERIMENT_E` over `EXPERIMENT_F` because watermark detection false-positive rate in E was 3× lower on `ESC-BOA` documents."
- "Re-ran the rasterization benchmark after discovering `tessdata_best` was not installed on the first run; invalidated prior results and kept as `_run1`."
- "Added OCR-degraded anchor variant `Matrlcula nº` to the catalog after observing it in 4 of 30 documents."
