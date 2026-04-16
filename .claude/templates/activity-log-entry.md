# Template — Activity Log Entry

Copy this block into `relatorios/log_execucao.md` whenever an activity starts, ends, or changes state. Replace placeholders with real values. Do not omit any field.

---

```markdown
## [YYYY-MM-DD HH:MM] Activity: <activity name exactly as in Section 9 of the plan>

**Status:** <CONCLUDED | IN PROGRESS | BLOCKED | REJECTED | RETRACTED>
**Duration:** <X hours> (omit if status = IN PROGRESS)
**Summary:** <1–2 sentences describing what was done. Specific. No marketing language.>
**Parameters declared:** <key = value list; or "n/a" if not a benchmark activity>
**Outputs:** <file path(s) generated; or "n/a">
**Issues encountered:** <None | detailed description>
**Next activity:** <activity name per Section 9, or "pending technical lead approval">
```

---

## Variants

### Start of activity

Use `Status: IN PROGRESS`, omit `Duration`, fill `Parameters declared` if applicable, `Outputs: pending`, `Issues encountered: None so far`.

### End of activity (success)

Use `Status: CONCLUDED`, fill `Duration`, `Outputs` with real file paths, `Issues encountered` with either `None` or a precise description.

### End of activity (blocked)

Use `Status: BLOCKED`, fill `Issues encountered` with the blocking cause, `Next activity` with what is needed to unblock.

### End of activity (rejected after gate review)

Use `Status: REJECTED`, reference the gate and the rejection reason provided by the technical lead.

---

## Example

```markdown
## [2026-05-01 14:22] Activity: Benchmark de rasterização

**Status:** CONCLUDED
**Duration:** 3 hours
**Summary:** Rasterized 20 sample documents across mupdf and poppler at 300 and 400 DPI. Collected times, file sizes, resolutions. No rasterization errors.
**Parameters declared:** libs=[mupdf, poppler]; dpis=[300, 400]; page=0
**Outputs:** benchmarks/rasterizacao/resultados_rasterizacao.json; benchmarks/rasterizacao/amostras/\*.png
**Issues encountered:** None
**Next activity:** Benchmark de pré-processamento
```

---

## Rules of use

- Timestamp in local time as recorded on the machine at entry time.
- Activity name must match Section 9 of the plan — not a paraphrase.
- `Parameters declared` is required for any benchmark or parser-sketch activity.
- `Outputs` must list every artifact produced, with relative paths.
- `Issues encountered` uses `None` literally when there are none; never leave blank.
- Do not rewrite old entries to change status. Write a new entry that references the old one.
