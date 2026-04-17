# Command — Freeze Baseline

Procedure to freeze the regression baseline after Gate 3 is approved. Implements `playbooks/baseline-freeze.md` as an executable sequence.

---

## Preconditions (all mandatory)

- [ ] `GATE 1 APPROVED` entry present with signed `decisoes/decisao_rasterizacao.md`.
- [ ] `GATE 2 APPROVED` entry present with signed `decisoes/decisao_motor_ocr.md`.
- [ ] `GATE 3 APPROVED` entry present with signed `decisoes/decisao_parser_sketch.md`.
- [ ] No pipeline modifications since Gate 3 approval (parameters, anchor catalog, OCR config, preprocessing profile).
- [ ] Calibration corpus of 30 documents intact with `discordancias_resolvidas: true` on every ground truth.

If any is missing, abort and log `BASELINE FREEZE BLOCKED` citing the missing prerequisite.

## Sequence

### 1. Log activity start

```markdown
## [YYYY-MM-DD HH:MM] Activity: Congelamento do baseline

**Status:** IN PROGRESS
**Summary:** All three gates approved. Starting baseline generation over the 30-document calibration corpus.
**Parameters declared:** biblioteca_rasterizacao=<...>; dpi=300; perfil_preprocessamento=<EXPERIMENT_X>; motor_ocr=<...>; parser_sketch_versao=1.0
**Outputs:** pending
**Issues encountered:** None
**Next activity:** n/a (in progress)
```

### 2. Run the full pipeline

Execute:

```
npm run baseline:gerar
```

This invokes `benchmarks/scripts/gerar_relatorio.ts` which:

1. Rasterizes all pages of all 30 documents with the Gate 1 library at 300 DPI.
2. Applies the winning preprocessing experiment.
3. OCRs each page with the Gate 2 engine.
4. Runs parser sketches on each document.
5. Compares extracted fields to ground truth.
6. Writes `baseline/fase0_baseline_v1.json` per `schemas/baseline-v1.md`.

### 3. Fill version metadata

The baseline JSON's `versao_pipeline` section must exactly match the three signed decision files. Pull values from the decision files, not from code inspection.

### 4. Compute the hash

Per the protocol documented as a technical decision record in `decisoes/`:

**Option A — In-file hash:**
1. Replace `hash_arquivo` value with the canonical placeholder string documented in the decision record.
2. Compute `sha256` of the file.
3. Replace `hash_arquivo` with `sha256:<hex>`.
4. Save.

**Option B — Sidecar hash:**
1. Save the file with `hash_arquivo` set to its final intended value (or the placeholder).
2. Compute `sha256` of the full file.
3. Write the hash to `baseline/fase0_baseline_v1.sha256`.

Record the chosen protocol once in a technical decision record. Use it consistently.

### 5. Set the freeze timestamp

`data_congelamento` = ISO 8601 with timezone, equal to the moment of formal freeze.

### 6. Validate the baseline

- Verify all 30 documents appear in `documentos[]`.
- Verify every `campos_extraidos` aligns with per-document ground truth.
- Verify `metricas_globais` match aggregates of per-document data.
- Run `npm run baseline:comparar -- --baseline baseline/fase0_baseline_v1.json --novo baseline/fase0_baseline_v1.json`. Expected output: 0 regressions, 0 improvements.

### 7. Commit to git

Commit `baseline/fase0_baseline_v1.json` (and sidecar `.sha256` if used) in a dedicated commit:

```
baseline: freeze fase0_baseline_v1 (hash sha256:<hex>)
```

No other files in the same commit.

### 8. Log activity conclusion

```markdown
## [YYYY-MM-DD HH:MM] Activity: Congelamento do baseline

**Status:** CONCLUDED
**Duration:** <X hours>
**Summary:** Baseline frozen. Hash computed. Self-consistency comparison returned 0 regressions, 0 improvements.
**Parameters declared:** biblioteca_rasterizacao=<...>; dpi=300; perfil_preprocessamento=<...>; motor_ocr=<...>; parser_sketch_versao=1.0
**Outputs:** baseline/fase0_baseline_v1.json; baseline/fase0_baseline_v1.sha256 (if used)
**Issues encountered:** None
**Next activity:** Relatório final e decisões
```

### 9. Hand off to final report

The next activity per Section 9 is the final report drafting. Use `playbooks/final-report.md`.

## Post-freeze immutability

From this moment:

- `baseline/fase0_baseline_v1.json` is read-only.
- No parameter tweak, no decision-file edit, no reinterpretation.
- Any correction requires an explicit v2 freeze with a new decision record. The v1 file remains in place as a historical artifact.

## Hard rules

- Never freeze without all three gates approved.
- Never freeze with pipeline changes pending since Gate 3.
- Never edit v1 after freeze.
- Never mix the baseline commit with other files.
- Never fabricate metrics in the baseline; every number is computed from the actual pipeline run.