# Playbook — Baseline Freeze

Governs the freezing of the regression baseline specified in Section 8 of the plan. The baseline captures the pipeline state at the end of Phase 0 so Phase 1 can detect regressions.

---

## Preconditions (all mandatory)

- Gate 1 approved (decision file signed, `GATE 1 APPROVED` log entry present).
- Gate 2 approved (same).
- Gate 3 approved (same).
- Calibration corpus of 30 documents intact, ground truth frozen.
- Activity start logged.

If any gate is not approved, do not freeze. Stop and log `BASELINE FREEZE BLOCKED` with the missing prerequisites.

## No pipeline changes between Gate 3 approval and freeze

From the moment Gate 3 is approved until the baseline is frozen, no element of the pipeline may be modified — no parameter tweak, no anchor catalog edit, no OCR config change. If a change is discovered to be necessary after Gate 3 approval, the freeze is aborted, the change goes through a new gate signal cycle, and the baseline is re-planned.

## Step 1 — Run the full pipeline on the calibration corpus

Execute:

```
npm run baseline:gerar
```

This runs the script `benchmarks/scripts/gerar_relatorio.ts`, which:

1. For each of the 30 calibration documents:
   - Rasterize with the chosen library at 300 DPI.
   - Preprocess with the winning experiment.
   - OCR with the chosen engine.
   - Parse with the parser sketch.
   - Compare extracted fields to ground truth.
2. Aggregate metrics globally (CER per field class, parser accuracy per critical field).
3. Write `baseline/fase0_baseline_v1.json` per `schemas/baseline-v1.md`.

## Step 2 — Fill the version metadata

Inside the baseline JSON, the `versao_pipeline` section must include:

| Field                     | Expected content          |
| ------------------------- | ------------------------- |
| `motor_ocr`               | e.g., `tesseract-5.3.4`   |
| `perfil_preprocessamento` | the winning experiment ID |
| `biblioteca_rasterizacao` | `mupdf` or `poppler`      |
| `dpi_rasterizacao`        | 300                       |
| `parser_sketch_versao`    | `1.0`                     |

Pull these values from the signed decision files, not from running code inspection. The decisions are canonical.

## Step 3 — Hash the file

After the JSON is fully written:

1. Compute the SHA-256 of the file, excluding the `hash_arquivo` field.
2. Set `hash_arquivo` to the value `sha256:<hex>`.
3. Save the file again.

The intent is that a reader can re-verify the hash: compute SHA-256 of the file with `hash_arquivo` field temporarily replaced by a canonical placeholder. Document the exact verification procedure in the baseline decision entry in the log.

Alternative protocol, if simpler: compute SHA-256 of the complete final file (including its own hash field placeholder), then store the hash alongside the baseline in a separate `baseline/fase0_baseline_v1.sha256` file. The plan requires the hash to be verifiable; either protocol satisfies that as long as it is documented.

Record the chosen protocol in `decisoes/` as a technical decision entry.

## Step 4 — Record the freeze date

Set `data_congelamento` in ISO 8601 with timezone. This timestamp is the formal moment of baseline freeze.

## Step 5 — Validate the baseline

- Verify all 30 documents are present in `documentos[]`.
- Verify each document has the expected `campos_extraidos` for its type.
- Verify global metrics match per-document aggregates.
- Run `npm run baseline:comparar -- --baseline baseline/fase0_baseline_v1.json --novo baseline/fase0_baseline_v1.json` as a self-consistency check — expected result: 0 regressions, 0 improvements.

## Step 6 — Commit to git

Commit only `baseline/fase0_baseline_v1.json` (and the `.sha256` file if used) with the commit message:

```
baseline: freeze fase0_baseline_v1 (hash sha256:<hex>)
```

No other files in the same commit.

## Step 7 — Log and hand off

Write an activity log entry `CONCLUDED` with:

- Path to the baseline file.
- Hash value.
- Freeze date.
- Summary of global metrics.

Hand off to `log-keeper` to begin drafting the final report.

## Read-only from this point

After freeze, `baseline/fase0_baseline_v1.json` is read-only. No corrections, no edits, no re-freezes under the same filename. If an error is discovered:

1. Log `BASELINE ERROR DISCOVERED` with the evidence.
2. Do not edit v1.
3. Seek technical-lead approval for a v2 freeze under `baseline/fase0_baseline_v2.json` with a revised decision record.

## Hard boundaries

- No baseline freeze without all three gates signed.
- No baseline freeze with pipeline changes pending.
- No post-freeze edits to v1.
- No manual editing of metrics to match decision files; metrics come from actual execution.
