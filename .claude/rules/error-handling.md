# Rule — Error Handling

## Principle

Errors during Phase 0 are data about the pipeline's limits, not failures to hide. They are logged, classified, and carried forward. Execution is never silently halted by a single bad document.

---

## Document-level errors

A document-level error means: the pipeline could not process one specific document at one specific stage (rasterization failed, OCR produced garbage, parser found no fields).

### Response

1. **Do not block the run.** Continue with the remaining documents.
2. Update `corpus/corpus_catalog.json`: set the document's `status` to `"ERRO"` with the failure stage recorded.
3. Log an error entry with this structure:

```
## [YYYY-MM-DD HH:MM] ERROR: <documento_id>

**Stage:** <rasterization | preprocessing | OCR | parser>
**Error message:** <verbatim>
**Action:** flagged status="ERRO"; execution continues
```

4. The document stays in the corpus catalog. It is not deleted.

### Threshold for escalation

If more than **10%** of the corpus fails at the same stage in the same benchmark run:

1. Halt further activities that depend on that stage's output.
2. Log under `SYSTEMIC FAILURE`.
3. Investigate root cause: tool bug, parameter choice, corpus quality, environment issue.
4. Escalate to the technical lead.
5. Do not proceed past the affected gate until the systemic issue is resolved.

If **10% or less** fail, the failures are documented as exceptions and checked against whether the documents are atypical (password-protected, corrupted, out of MVP scope). Proceed.

## Environment-level errors

Environment-level errors are failures of the machine or toolchain: Tesseract not in PATH, Python not present, mupdf binary missing, disk full.

### Response

1. Stop immediately.
2. Log under `ENVIRONMENT ERROR` with the full error output.
3. Do not attempt workarounds. Do not install tools other than those specified in Section 2.5 of the plan.
4. Ask the technical lead to restore the environment per the setup script `scripts/setup_ambiente.ps1`.

## Data-integrity errors

Data-integrity errors are mismatches between what the plan requires and what the repository contains: missing schema fields, ground truth not matching catalog, baseline hash mismatch.

### Response

1. Stop the affected activity.
2. Log under `DATA INTEGRITY ERROR`.
3. Do not edit the data to fix it unless the error is a clear Claude-authored artifact bug (e.g., a JSON file Claude produced is malformed).
4. If the error is in human-authored data (ground truth, catalog), escalate — do not fix it.
5. Record the discovery; continue with unaffected activities if possible.

## Benchmark-run errors

A benchmark run may fail mid-way (crash, OOM, infinite loop).

### Response

1. Log the partial state.
2. Do not resume from mid-point; the run is discarded.
3. Restart the full benchmark with the same documented parameters.
4. If the crash repeats on the same document, treat it as a document-level error for that specific document and continue the remaining benchmark without it.
5. Record all of the above in the log.

## Errors in gate-approval readiness

If Claude discovers, after raising a gate signal, that a condition was not actually met:

1. Retract the signal via a new log entry: `GATE SIGNAL RETRACTED`.
2. Explain which condition failed and how it was missed.
3. Return to the work needed to meet the condition.
4. Do not leave the previous signal unretracted.

## Errors during anonymization or ground truth

These involve human annotators. Claude's role is to assist, not to decide. If a script Claude wrote produces an incorrect anonymization or annotation:

1. Report the class of error.
2. Do not retry against the same document without annotator re-verification.
3. Let the second annotator re-verify the document per Section 3.2.3 of the plan.

## Never-acceptable behaviors on error

- Silent swallowing of exceptions.
- Retrying without logging.
- Using an alternative tool not in the plan.
- Fabricating values to fill a schema.
- Moving on as if the error did not happen.
- Deleting the error from the log to make the run look clean.
