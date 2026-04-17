# Command — Signal Gate

Procedure to raise a gate-readiness signal in the execution log and wait for human approval. Claude does NOT approve gates. This command is about signaling and waiting.

---

## Preconditions

- The relevant benchmark or parser-sketch activity has completed.
- Artifacts are validated against their schemas.
- The relevant checklist (`checklists/gate-N-*.md`) has been walked item by item, and every item is verified with evidence.

## Sequence

### 1. Re-read the gate definition

Open the gate file (`gates/gate-<N>.md`). Confirm that every condition is met, citing the exact artifact path and numeric value for each.

### 2. Run the checklist

Open `checklists/gate-<N>-<name>.md`. For each item, confirm `[x]` with evidence. If any item is unchecked, **stop** — the gate is not ready. Log the missing items under a `GATE N — CONDITIONS NOT MET` entry. Return to the corrective action path.

### 3. Draft the decision file

If not already drafted:

- Copy `templates/decision-<type>.md` to `decisoes/decisao_<type>.md`.
- Fill every section with real numbers from the benchmark artifacts.
- Cite the source artifact paths for every metric.
- Leave the signature block blank.

### 4. Write the gate signal entry

Append to `relatorios/log_execucao.md` using `templates/gate-signal.md`:

```markdown
## [YYYY-MM-DD HH:MM] 🚩 GATE <N> — READY FOR APPROVAL

**Gate:** <Gate 1: Rasterization + Preprocessing | Gate 2: OCR Engine | Gate 3: Parser Sketch>

**Conditions verified:**
- [x] Condition 1: <description> — result: <value> — source: <file>
- [x] Condition 2: <description> — result: <value> — source: <file>
- ...

**Evidence:**
- Benchmark JSON(s): <paths>
- Decision draft: <decisoes/decisao_*.md>
- Checklist completed: <checklists/gate-<N>-*.md>

**Pipeline state at signal:**
- Rasterization library: <...>
- Preprocessing profile: <...>
- OCR engine: <...>
- Parser sketch version: <...>

**Action required:** Approval by the technical lead.
**Status:** Awaiting signature on <decision file path>.
**Activities permitted while waiting:** <list per Section 9 of the plan, or "none">.
```

### 5. Stop

Do not start any activity that depends on this gate. Parallelizable activities may continue per Section 9.

Notify the user that the gate is signaled and awaiting approval. Point to the decision file.

### 6. Wait for approval

Approval is recorded by:

1. Technical lead filling in the approval block in the decision file.
2. A `✅ GATE N APPROVED` entry in `relatorios/log_execucao.md`.

Both must be present.

### 7. Proceed after approval

Once both approval records are present:

- Write a transition log entry: `Activity: <next activity>` in status `IN PROGRESS`.
- Proceed per the next activity's playbook.

## Retraction

If, after signaling, Claude discovers that a condition was in fact not met (wrong metric read, arithmetic error, artifact corrupted):

1. Append:

```markdown
## [YYYY-MM-DD HH:MM] ⛔ GATE <N> SIGNAL RETRACTED

**Previous signal:** [YYYY-MM-DD HH:MM] reference
**Reason for retraction:** <verbatim>
**Action:** Re-verify conditions after correcting <what>.
```

2. Revise the decision file (do not delete).
3. Return to the corrective action path.
4. Do NOT re-raise the signal until conditions are actually met.

## Rejection by technical lead

If the technical lead rejects the signal and returns corrective feedback:

```markdown
## [YYYY-MM-DD HH:MM] 🛑 GATE <N> — REJECTED BY TECHNICAL LEAD

**Feedback:** <verbatim or summarized by lead>
**Action:** <what Claude will do to address feedback>
```

Execute the corrective action. Raise a new signal only when ready again.

## Hard rules

- Never write "approved" in a signal entry.
- Never prefill the technical lead's signature.
- Never proceed past a signal without both approval records present.
- Never silently retract — always log the retraction.