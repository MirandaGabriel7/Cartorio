# Playbook — Parser Sketch

Governs the exploratory parsing prototype specified in Section 7 of the plan. Produce the anchor catalog and measure whether the critical fields can be extracted deterministically with ≥ 85% accuracy from real OCR text.

---

## Preconditions

- Gate 2 approved: OCR engine selected and applied to the calibration corpus.
- Ground truth validated for the 30 calibration documents.
- `parser_sketch/src/` folder present with the files listed in Section 7.3.
- Activity start logged.

## Step 1 — Explore anchors

Run `parser_sketch/src/explorar_ancoras.ts`. For each calibration document:

1. Load the OCR text produced by the Gate 2 engine.
2. For each ground-truth field, locate the value's occurrence in the OCR text.
3. Capture the 5–15 words that precede the value — these are the anchor candidates.
4. Record anchor variants observed across documents, including OCR-degraded forms.

The script runs semi-automatically. A human operator reviews the extracted contexts and consolidates variants into the anchor catalog.

## Step 2 — Write the anchor catalog

Output: `parser_sketch/catalogo_ancoras.json` per `schemas/anchors-catalog.md`.

For each priority field (see `agents/parser-sketch-engineer.md`), include:

- `campo`: canonical field name.
- `tipo_extracao`: `REGEX_ROTULO` / `PADRAO_FIXO` / `HEURISTICA`.
- `ancoras_primarias`: clean anchor strings (regex-friendly).
- `ancoras_variantes_ocr`: OCR-degraded variants observed in the corpus.
- `regex_valor`: regex that matches the value following the anchor.
- `contexto_bloco`: where in the document this anchor typically appears.
- `frequencia_no_corpus`: count of documents where the anchor was found.
- `total_documentos_analisados`: denominator for the frequency.
- `observacoes`: OCR artifacts, corner cases, notes for Phase 1.

Coverage target for Gate 3: ≥ 80% of Section 17 fields covered by anchors for ≥ 80% of documents.

## Step 3 — Implement the parsers

Files under `parser_sketch/src/`:

- `parser_escritura_sketch.ts` — sketches for escritura priority fields.
- `parser_matricula_sketch.ts` — sketches for matrícula priority fields.
- `normalizar_texto_ocr.ts` — OCR text cleanup (hyphen reconstruction, line joining, whitespace normalization).
- `medir_acerto.ts` — accuracy measurement script.
- `tipos.ts` — shared types (`CampoExtraidoSketch`, etc.).

Each field extractor returns a `CampoExtraidoSketch`:

```
{
  campo,
  valor_bruto,
  valor_normalizado,
  metodo: 'REGEX_ROTULO' | 'PADRAO_FIXO' | 'HEURISTICA',
  pagina,
  posicao_inicio,
  posicao_fim,
  confianca_estimada,
  alertas: string[]
}
```

### CPF extractor specifics

1. Clean the text via `tratarArtefatosOCR` (join hyphenated words, merge fragmented lines, normalize whitespace).
2. Try each CPF anchor variant. On match, search for the CPF pattern in the next ~30 characters.
3. Extract digits, apply OCR-substitution correction for numeric contexts (O→0, I/l→1, S→5, B→8, G→9).
4. Validate the CPF check digits.
5. Fallback: plain CPF regex `\b(\d{3}[\.\s]?\d{3}[\.\s]?\d{3}[-\s]?\d{2})\b` with check-digit validation.
6. On miss, return a `CampoExtraidoSketch` with `valor_bruto=null` and alert `Campo não localizado`.

### Matrícula extractor

Use the anchors `Matrícula nº`, `Matrícula n°`, `MATRÍCULA Nº`, and OCR variants. Regex for the value: `\d{1,6}[\.\s]?\d{0,3}`. Do not confuse with `Matrícula eleitoral` or other unrelated contexts — check the surrounding block context.

### Name extractor

Rely on the anchor position. Extract the sequence of uppercase/mixed-case words following the anchor up to a delimiter (comma, "inscrito", "brasileiro", "portador", etc.). Normalize by trimming, uppercasing, collapsing spaces, stripping accents before comparing to ground truth.

### Tolerance layers

- OCR-artifact-tolerant anchor matching.
- Common numeric substitutions applied only within numeric candidate tokens, never across the full text.
- Anchor-based extraction first; fixed-pattern fallback when the anchor is not found.

## Step 4 — Measure accuracy

Run `parser_sketch/src/medir_acerto.ts` over the calibration corpus. For each document × field:

1. Run the parser sketch on the OCR text.
2. Normalize the extracted value and the ground-truth value identically.
3. Classify: `ACERTO` / `ERRO` / `NAO_LOCALIZADO`.
4. Compute per-field accuracy across the corpus:
   `acertos / (acertos + erros + nao_localizados)`

Output: `parser_sketch/parser_sketch_resultados.json` per `schemas/parser-sketch-results.md`.

## Step 5 — Apply Gate 3 criteria

Gate 3 passes when all:

1. Critical fields ≥ 85%:
   - `transmitente_1_cpf`
   - `matricula` (escritura) / `matricula_numero` (matricula)
   - `transmitente_1_nome` / `proprietario_1_nome`
2. Anchor catalog covers ≥ 80% of Section 17 fields for ≥ 80% of the documents.
3. Decision file draft complete.
4. Anchor catalog published.

Non-critical fields below 85% are documented as "requires heuristic refinement in Phase 1" in the parser-sketch decision file; they do not block Gate 3.

## Step 6 — Corrective action if Gate 3 fails

- CPF < 85%: isolate the failure. If OCR produced wrong digits → escalate back to Gate 2 preprocessing refinement. If parsing failed (anchor missed) → expand anchor catalog and adjust regexes.
- Name < 85%: check whether OCR fragmented the name or the name has multi-token composition beyond the current extractor; refine the extractor.
- Coverage < 80%: revisit the anchor exploration; capture additional variants from failing documents.

## Step 7 — Hand off

1. Validate both JSON outputs against their schemas.
2. Log `CONCLUDED`.
3. Hand off to `gate-verifier` for Gate 3.

## Integrity reminders

- No LLM calls for field extraction.
- No ground truth editing.
- Parser sketch runs deterministically — same input, same output.
- Measurement uses the same OCR output that came out of the Gate 2 benchmark — do not re-run OCR with different parameters here.

## What not to do

- Do not extend the parser sketch to Section 17's non-priority fields at the cost of delaying Gate 3.
- Do not invent a confidence model beyond fixed per-method values.
- Do not couple the parser sketch to future Phase 1 production interfaces.
- Do not fabricate anchors not observed in the corpus.
