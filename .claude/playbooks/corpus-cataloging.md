# Playbook — Corpus Cataloging

Governs corpus collection, anonymization, cataloging, and ground-truth preparation as specified in Section 3 of the plan.

---

## Preconditions

- Environment set up per Section 2.
- `corpus/originais/` and `corpus/anonimizados/` directories exist.
- Human annotators identified (at least 2 annotators + 1 senior registry reviewer for tie-breaking).
- Cartório-alvo has provided access to source documents.

## Step 1 — Collection plan

Track progress against the required minimums per Section 3.1:

| Category      | Minimum |
| ------------- | ------- |
| MAT-ATUAL-BOA | 20      |
| MAT-ATUAL-DEG | 15      |
| MAT-MONO      | 10      |
| MAT-ONUS      | 10      |
| MAT-RURAL     | 5       |
| MAT-TRANSP    | 5       |
| ESC-NATIVA    | 5       |
| ESC-BOA       | 15      |
| ESC-DEG       | 15      |
| ESC-BAIXA     | 10      |
| ESC-MULTI     | 10      |
| ESC-PJ        | 5       |
| ESC-ROGO      | 5       |
| ESC-MARCA     | 10      |
| ESC-PRENOT    | 5       |
| **Total**     | **145** |

Maintain a running count and flag the technical lead if any category is at risk.

## Step 2 — Anonymization

For every original PDF:

1. Human annotator A identifies every field containing PII (CPF, CNPJ, full names, addresses, monetary values) and records coordinates in a control CSV (`pagina, x0, y0, x1, y1, campo, valor_original, valor_placeholder`).
2. Run `scripts/anonimizar_documento.py <original.pdf> <controle.csv> <anonimizado.pdf>`.
3. Store the anonymized PDF under `corpus/anonimizados/<category>/<documento_id>.pdf`.

Claude never decides what is PII. That is the annotator's responsibility.

## Step 3 — Anonymization verification

1. Human annotator B (different from A) opens the anonymized PDF and inspects each page.
2. Run Tesseract OCR on the anonymized PDF and search the text for:
   - Any 11-digit sequence not matching the placeholder.
   - Any name on the original document's identified list (if available to the verifier).
3. If any real PII remains, return the document to annotator A for fix, re-run anonymization, re-verify.
4. Upon successful verification, set `anonimizacao_verificada: true` in the catalog entry.

Claude runs the OCR scan as assistance but does not declare the document verified — that is annotator B's decision.

## Step 4 — Naming and classification

Apply the naming convention `{tipo}_{qualidade}_{sequencial:3}.pdf`:

- `tipo`: `escritura` or `matricula`
- `qualidade`: one of `boa`, `degradada`, `baixa`, `nativa`, `mono`, `onus`, `rural`, `transporte`, `multi`, `pj`, `rogo`, `marca`, `prenot`
- `sequencial`: 3-digit counter per (tipo, qualidade)

Documents matching multiple categories use the most specific category per Section 3.3.1.

## Step 5 — Catalog entry

Write the entry into `corpus/corpus_catalog.json` per `schemas/corpus-catalog.md`. Required fields include:

- `documento_id`
- `arquivo` (relative path to anonymized PDF)
- `tipo_documento`
- `categoria_corpus`
- `classificacao_qualidade`
- `total_paginas`
- `tem_texto_nativo`
- `marcas_dagua_presentes`, `tipo_marca_dagua`
- `rodapes_sistema_presentes`
- `formato_matricula` (for matrículas only)
- `tem_onus`, `tipos_onus`
- `tem_transporte_ficha`
- `total_transmitentes`, `transmitente_pj`, `assinatura_rogo`
- `urbano_ou_rural`
- `municipio_origem`
- `anonimizacao_verificada`
- `data_coleta`, `coletado_por`
- `ground_truth_disponivel`, `ground_truth_arquivo`
- `observacoes`
- `status` (defaults to `"OK"`, becomes `"ERRO"` if pipeline fails on it)

Validate via `npm run validar:corpus`.

## Step 6 — Ground truth — calibration corpus (30 documents)

For the first 30 documents to be annotated:

1. Annotator A annotates independently and produces `corpus/ground_truth/<documento_id>_gt.json` per `schemas/ground-truth.md`.
2. Annotator B annotates the same document independently.
3. The discordance script identifies field-level disagreements.
4. Per Section 3.4.3:
   - Clear typo by one annotator → other value prevails.
   - Interpretation discordance → annotators A and B meet and resolve; if no consensus, senior registry reviewer decides.
5. Resolutions captured in `resolucao_discordancias` field with the explanatory text.
6. Both annotator IDs and dates recorded in the ground truth JSON.

## Step 7 — Ground truth — rest of corpus (docs 31–145)

1. One annotator per document.
2. Random 20% re-annotated by a second annotator as quality control.
3. Any mismatches trigger the discordance-resolution process.

## Step 8 — Ground truth validation

Run `npm run validar:gt`. Expected checks:

- JSON Schema validity (`ajv`).
- All required fields non-null.
- CPF length = 11, CNPJ length = 14, dates in ISO 8601, monetary values as integer cents.
- `documento_id` matches an existing catalog entry.
- Checklist gabarito: all 34 items have values.
- `texto_completo_por_pagina` present at least for pages containing required fields.

Output: `relatorios/validacao_ground_truth.json` listing errors per document.

## Step 9 — Gate prerequisites

- Gate 1 rasterization can begin with ≥ 10 documents anonymized.
- Gate 1 preprocessing + Gate 2 OCR require the 30-document calibration corpus with full 2-annotator ground truth.
- Gate 3 parser sketch requires the same 30-document calibration corpus.
- Baseline freeze requires the 30-document calibration corpus.
- Final report requires the full 145-document corpus cataloged; ground truth for docs 31–145 may complete in parallel with Gate 3 execution (per Section 9 of the plan).

## Hard boundaries

- Never commit `corpus/originais/` or `corpus/anonimizados/` to git.
- Never approve anonymization verification yourself.
- Never edit a ground truth value to match OCR or parser output.
- Never remove catalog entries to "clean up" the corpus.
