# Command — Record Decision

Procedure to record a technical decision made during Phase 0 execution. Any choice that a future auditor could question belongs here.

---

## When to use

A new technical decision record is required when:

- A parameter was ambiguous in the plan and had to be resolved in practice.
- A document was excluded from the corpus.
- A benchmark was re-run with changed parameters.
- A threshold edge case required interpretation (e.g., metric exactly at the threshold).
- A new anchor variant was added to the catalog beyond what the plan prescribed.
- A preprocessing experiment was added (e.g., `EXPERIMENT_E_v2`).
- A workaround was applied for an environment issue.
- A parallelism decision was made that is not explicitly in Section 9.

## Where to record

Inside the relevant decision file under `decisoes/`:

- Rasterization and preprocessing decisions → `decisoes/decisao_rasterizacao.md`
- OCR engine decisions → `decisoes/decisao_motor_ocr.md`
- Parser sketch decisions → `decisoes/decisao_parser_sketch.md`
- Baseline-freeze protocol decisions → append to the most relevant gate decision file, or create a stand-alone `decisoes/decisao_baseline_protocolo.md` if none fits.

## Sequence

### 1. Pick the template

Use `templates/technical-decision-record.md`. Do not deviate from the template's sections.

### 2. Fill the record

```markdown
### Technical decision [YYYY-MM-DD HH:MM] — <short title>

**Context:** <Why this decision was needed. 2–4 sentences.>

**Alternatives considered:**
1. <Alternative A> — pros / cons.
2. <Alternative B> — pros / cons.
3. <Alternative C (if any)> — pros / cons.

**Decision taken:** <Explicitly chosen alternative.>

**Justification:** <Data that supports the decision. Cite artifact paths and specific numbers.>

**Impact on the pipeline:**
- <Parameters changed, artifacts affected, downstream activities impacted.>
- <Any ripple effect on other gates or deliverables.>

**Approved by:** <Technical lead name (if required) or "Claude Code, within delegated scope of this gate.">

**Evidence artifacts:**
- <path 1>
- <path 2>
```

### 3. Cross-reference in the execution log

Append to `relatorios/log_execucao.md`:

```markdown
## [YYYY-MM-DD HH:MM] Technical decision recorded

**Title:** <same title as in the decision record>
**Recorded in:** decisoes/decisao_<x>.md (section "Technical decision YYYY-MM-DD HH:MM")
**Summary:** <1-sentence summary>
**Approved by:** <name or "delegated scope">
```

### 4. Apply the decision

If the decision changes parameters or pipeline elements, update the affected scripts or configuration with a comment referencing the decision record.

### 5. Continue

Return to the activity that triggered the decision.

## Decisions that Claude Code can make alone

- Minor parameter resolutions explicitly within the latitude of the plan (e.g., choosing a stable sort key for deterministic document selection).
- Logging conventions.
- Timestamp formatting.
- Decisions entirely within the "delegated scope of this gate" as defined by the relevant gate file.

## Decisions that REQUIRE technical lead approval

- Excluding a document from the corpus.
- Changing a threshold interpretation.
- Adding a new preprocessing experiment.
- Re-running a benchmark with changed parameters.
- Altering anything in `fase0_plano_execucao.md`.
- Accepting a Gate condition that is strictly below the plan's threshold.

When approval is required, Claude drafts the decision record and waits for the technical lead to append their name in the `Approved by:` field. Claude does not sign for the lead.

## Supersession

If a past decision is superseded by a new one:

- The new record references the old: `Supersedes: <date + title of old record>`.
- The old record is not deleted.
- The log entry notes the supersession.

## Hard rules

- Never omit the evidence artifacts section.
- Never combine multiple unrelated decisions into one record.
- Never backdate a decision record.
- Never edit a past decision record to hide a mistake. Write a new record that references and corrects the old one.