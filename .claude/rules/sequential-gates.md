# Rule — Sequential Gates

## Principle

Phase 0 is governed by three sequential gates. They are not milestones, not checkpoints, not suggestions. They are hard controls. No gate is skipped, parallelized with its successor, or retroactively approved.

---

## The three gates

| Gate   | Scope                                          | Decision file                       | Detail            |
| ------ | ---------------------------------------------- | ----------------------------------- | ----------------- |
| Gate 1 | Rasterization library + preprocessing pipeline | `decisoes/decisao_rasterizacao.md`  | `gates/gate-1.md` |
| Gate 2 | OCR engine                                     | `decisoes/decisao_motor_ocr.md`     | `gates/gate-2.md` |
| Gate 3 | Parser sketch feasibility                      | `decisoes/decisao_parser_sketch.md` | `gates/gate-3.md` |

## Hard dependencies

- **Gate 2** cannot start until **Gate 1** is approved.
- **Gate 3** cannot start until **Gate 2** is approved.
- The **baseline** is frozen only after **Gate 3** is approved.
- The **final report** is written only after the baseline is frozen.

## What "approved" means

A gate is approved when all the following are true:

1. The decision file (`decisoes/decisao_*.md`) is complete per the corresponding template.
2. All gate conditions (listed in `gates/gate-N.md`) are satisfied and verified.
3. The technical lead has signed the decision file.
4. An entry `GATE N APPROVED` exists in `relatorios/log_execucao.md`.

Lacking any of the four means the gate is not approved.

## What Claude does between gates

Before signaling: complete the activity, run validations, assemble the decision draft, log the conditions.

After signaling and before approval:

- Do not start the next gate's activities.
- Activities that Section 9 of the plan explicitly marks as parallelizable (e.g., continued ground-truth annotation) may proceed.
- Draft relevant reports (`relatorio_variabilidade_documental.md`) if preconditions are met.
- Do not tune parameters on the just-signaled gate; the signal is a commit.

After approval: proceed to the next gate's first activity.

## Gate failure protocol

A gate fails when one or more conditions are not met. When this happens:

1. Log `GATE N — CONDITIONS NOT MET` with the specific failing conditions and their measured values.
2. Do **not** produce a decision file for an unmet gate.
3. Execute the corrective action specified in the plan for the failed gate:
   - Gate 1: tune preprocessing (try denoising/binarization variants), or swap rasterization library.
   - Gate 2: refine preprocessing first (never swap engines without exhausting refinement). After 2 failed refinement iterations, escalate.
   - Gate 3: expand anchor catalog, adjust regexes. If OCR is the bottleneck, return to Gate 2.
4. Re-measure.
5. Raise a new gate signal when conditions are met.

## No retroactive approval

Once a gate has been passed and the next activity started, you cannot rewrite a prior gate's conditions to match new data. If the baseline reveals issues that imply a prior gate's conditions were borderline, log the discovery, but do not retroactively edit the prior decision file. A new decision, if needed, goes into a separate record.

## Multiple failing gate iterations

If a gate is signaled, reviewed, and rejected by the technical lead with corrective instructions:

1. Log `GATE N — REJECTED BY TECHNICAL LEAD` with the feedback.
2. Execute corrective action.
3. Raise a new signal. Each signal is a distinct log entry with its own timestamp.

## Relationship to the baseline

The baseline locks in the state of the pipeline at the end of Gate 3. After the baseline is frozen, the pipeline version used for the baseline becomes the reference for any Phase 1 regression testing. Changing any element of the pipeline after baseline freeze is a post-Phase-0 change.
