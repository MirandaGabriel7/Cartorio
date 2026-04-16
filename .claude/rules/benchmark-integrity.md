# Rule — Benchmark Integrity

## Principle

The three gate decisions of Phase 0 rest on benchmark numbers. If those numbers are manipulated, tuned, cherry-picked, or fabricated, the entire project's risk assessment is worthless. Benchmark integrity is not negotiable.

---

## Core requirements

### 1. Parameters fixed before execution

Before running any benchmark:

1. Declare the parameters in writing (in the run script or in a parameters section of the activity log entry).
2. Execute with exactly those parameters.
3. Record parameters in the output JSON (`perfil_preprocessamento`, `dpi`, engine config, etc.).

Changing parameters mid-run is forbidden. If the wrong parameters were chosen, the entire run is invalidated, parameters are re-declared, and the benchmark is restarted.

### 2. Corpus is fixed before execution

The documents used in each benchmark are defined by the plan and by the corpus catalog. The sample for rasterization (20 docs) is determined by the `selecionarAmostraRepresentativa` function with the quotas specified in Section 4. The calibration corpus (30 docs) is the first 30 fully annotated documents. These selections are deterministic.

Adding or removing documents after seeing results is forbidden.

### 3. No selective reporting

Every run produces a complete JSON output per the schema. Partial results, summary-only reports, or hand-edited output files are not acceptable. If a document failed, its failure is in the output with an `erro` field; it is not omitted.

### 4. No silent re-runs

Re-running a benchmark is logged explicitly:

```
## [YYYY-MM-DD HH:MM] Benchmark re-run: <benchmark name>

**Previous run:** <file path> (timestamp)
**Reason for re-run:** <verbatim justification, e.g., "Tesseract tessdata model was incorrect in first run">
**Parameters changed from previous run:** <list or "none">
**Decision by:** <technical lead name>
```

The previous run's output file is preserved (renamed with a `_run1`, `_run2` suffix), not overwritten.

### 5. No tuning on the calibration corpus after threshold evaluation

The calibration corpus (30 docs) determines whether a gate passes. Once CER is measured on that corpus, you may not adjust preprocessing parameters using knowledge of which documents failed in which way to boost scores on that same corpus. That is test-set contamination.

If preprocessing needs refinement after Gate 2 fails:

1. The refinement is declared (new experiment with a new ID, e.g., `EXPERIMENT_E_v2`).
2. The refinement is evaluated again on the calibration corpus.
3. Both runs are kept in the benchmark output.

### 6. Timing measurements

All timing measurements use `performance.now()` (Node.js) or equivalent. Times are recorded in milliseconds as integers. Each measurement is the elapsed wall-clock time of the operation, not including script startup or I/O unrelated to the operation under test.

The benchmark machine's state at execution time (Windows version, Node version, Python version, Tesseract version) is recorded in the output JSON metadata.

### 7. Visual inspection protocol

When the benchmark requires visual inspection (e.g., rasterization quality, preprocessing output):

1. The sample images are saved under `benchmarks/<area>/amostras/`.
2. The inspection checklist from the plan is filled per image (not globally summarized).
3. The inspection results are in the JSON output, not just in a human-readable report.
4. Inspection is performed by the technical lead or a delegate, not by Claude alone.

### 8. Deterministic document selection

When a benchmark uses a subset of the corpus (e.g., 20 docs for rasterization, 30 for OCR):

- Selection is driven by the quotas and filter criteria in the plan.
- The selected IDs are recorded in the benchmark output.
- If the script must choose among equally qualifying documents, it uses a stable sort on `documento_id` (alphabetical) and picks the first N.

### 9. Ground truth is immutable during benchmarking

The calibration ground truth (30 docs, 2 annotators) is frozen before the OCR benchmark runs. Any correction discovered during benchmarking is logged but **not applied to the ground truth used in the current run**; the correction, if approved, applies to the next run.

### 10. Hash and freeze the baseline

After Gate 3 is approved, the baseline file `baseline/fase0_baseline_v1.json` is generated once, its SHA-256 is computed and written inside the file, and the file is not edited again. Any comparison against the baseline reads the exact bytes of that file.

---

## Integrity checks before signaling a gate

Before raising a gate signal:

1. Rerun the final benchmark script from a clean run — no cached intermediate state.
2. Confirm the output file hash matches what will be used in the gate decision.
3. Verify no `TODO`, `null`, or missing fields in the JSON.
4. Confirm the calibration corpus has the expected document count.
5. Confirm the parameters recorded in the JSON match the parameters declared at the start of the activity.

---

## Consequences of an integrity violation

If an integrity violation is discovered:

1. The affected benchmark is invalidated.
2. A log entry labeled `BENCHMARK INTEGRITY VIOLATION` describes what happened.
3. The benchmark is rerun from scratch with fixed parameters.
4. The prior run's files are preserved and marked `_invalidated`.
5. If the violation was caused by a user instruction, the instruction is refused going forward.
