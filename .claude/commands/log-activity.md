# Command — Log Activity

Procedure to append an activity entry to `relatorios/log_execucao.md`.

---

## When to use

Whenever an activity:

- Starts.
- Ends with status `CONCLUDED`, `BLOCKED`, `REJECTED`, or `RETRACTED`.
- Progresses substantially within a long activity (checkpoint entry).

Also whenever a notable event occurs: error, scope drift detected, parameter adjusted, document excluded, benchmark re-run.

## Sequence

### 1. Open the log

File: `relatorios/log_execucao.md`. Append-only. Do not rewrite past entries.

### 2. Pick the right template

- Standard activity → `templates/activity-log-entry.md`.
- Gate signal → `templates/gate-signal.md`.
- Technical decision during execution → append a record under the relevant `decisoes/decisao_*.md` using `templates/technical-decision-record.md`.

### 3. Fill the entry

Required fields:

- Timestamp `YYYY-MM-DD HH:MM` local time.
- Activity name exactly as it appears in Section 9 of the plan.
- Status (single word from the allowed set).
- Duration, if applicable.
- Summary in 1–2 sentences. Specific, no marketing.
- Parameters declared, if applicable.
- Outputs (file paths).
- Issues encountered — `None` or description.
- Next activity.

### 4. Verify discipline

- Timestamp is present and plausible.
- Activity name matches Section 9 wording.
- Status is one of: `CONCLUDED`, `IN PROGRESS`, `BLOCKED`, `REJECTED`, `RETRACTED`, `APPROVED`.
- `Outputs` lists every artifact, with relative paths.
- `Issues encountered: None` is used literally when none, never left blank.
- No placeholders or `TODO` strings remain.

### 5. Append and stop

Append the entry. Do not open a new activity in the same turn unless explicitly part of a transition.

## Examples

### Start of benchmark activity

```markdown
## [2026-05-01 09:00] Activity: Benchmark de rasterização

**Status:** IN PROGRESS
**Summary:** Starting rasterization benchmark over 20-document sample at 300 and 400 DPI for both mupdf and poppler.
**Parameters declared:** libs=[mupdf, poppler]; dpis=[300, 400]; sample_size=20; page=0
**Outputs:** pending
**Issues encountered:** None
**Next activity:** n/a (this activity in progress)
```

### End of benchmark (success)

```markdown
## [2026-05-01 12:00] Activity: Benchmark de rasterização

**Status:** CONCLUDED
**Duration:** 3 hours
**Summary:** Rasterization complete for 20 × 2 libs × 2 DPIs. Visual inspection completed on 10 documents.
**Parameters declared:** libs=[mupdf, poppler]; dpis=[300, 400]; sample_size=20; page=0
**Outputs:** benchmarks/rasterizacao/resultados_rasterizacao.json; benchmarks/rasterizacao/amostras/*.png
**Issues encountered:** None
**Next activity:** Benchmark de pré-processamento
```

### Document-level error during a run

```markdown
## [2026-05-01 10:45] ERROR: matricula_onus_007

**Stage:** rasterization
**Error message:** "mupdf: cannot open PDF (encrypted)"
**Action:** flagged status="ERRO" in corpus_catalog.json; execution continues on remaining documents.
```

### Blocked

```markdown
## [2026-05-02 09:15] Activity: Benchmark de OCR

**Status:** BLOCKED
**Duration:** <n/a>
**Summary:** Calibration corpus has 4 documents with discordancias_resolvidas=false.
**Parameters declared:** n/a
**Outputs:** n/a
**Issues encountered:** Ground truth resolution pending for: escritura_boa_003, matricula_onus_005, matricula_mono_002, escritura_multi_001.
**Next activity:** Resume once corpus_steward confirms resolution.
```

## Hard rules

- Never rewrite an old entry.
- Never combine multiple activities in one entry.
- Never leave `Issues encountered` blank.
- Never invent a duration; if unknown, write `n/a`.
- Never skip an entry because "nothing interesting happened" — the entry itself is the interesting record of the activity's occurrence.