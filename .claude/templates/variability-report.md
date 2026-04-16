# Template — Document Variability Report

Copy this template to `relatorios/relatorio_variabilidade_documental.md`. Fill every section from observations gathered during corpus cataloging, preprocessing, OCR, and parser-sketch phases.

---

```markdown
# Report — Document Variability Across the Phase 0 Corpus

**Date drafted:** <YYYY-MM-DD>
**Drafted by:** Claude Code
**Source corpus:** `corpus/corpus_catalog.json` (<N> documents)

---

## 1. Purpose

Document the observable variability across the Phase 0 corpus so the production parsers of Phase 1 do not underestimate real-world heterogeneity. This report is descriptive, not prescriptive: it records what was seen.

## 2. Source base

| Notary / registry         | Document count | Types present     | Quality distribution            |
| ------------------------- | -------------- | ----------------- | ------------------------------- |
| <name or anonymized code> | <n>            | <tipos presentes> | <boa/degradada/baixa breakdown> |

## 3. Matrícula variability

### 3.1 Formats

- Current proportional (post-2010): <count>
- Monospaced (pre-2010): <count>
- Mixed / transitional: <count>

### 3.2 Header patterns observed

<List the anchor variants for `Matrícula nº` / `MATRÍCULA Nº` / `Matrícula n°` captured in the anchor catalog. Reference `parser_sketch/catalogo_ancoras.json`.>

### 3.3 Ônus variability

- Types seen: <hipoteca, penhora, usufruto, servidão, …>
- Markers observed: R., AV., with local variations
- Impediment tagging variation: <description>

### 3.4 Ficha transport

- Count of documents with `TRANSPORTE DA FICHA Nº`: <n>
- Variation patterns in the marker: <description>

### 3.5 Rural documents

- INCRA / CCIR / CAR references present: <n>
- Unit variations: hectares, alqueires

### 3.6 System footers

- Count of matrículas with electronic system footer (`Solicitado por … Data da Solicitação …`): <n>
- Notable variations: <description>

## 4. Escritura variability

### 4.1 Native digital vs. scanned

- Native digital (text layer extractable): <n>
- Scanned: <n>

### 4.2 Quality distribution

| Quality   | Count | Typical issues                |
| --------- | ----- | ----------------------------- |
| BOA       | <n>   | —                             |
| DEGRADADA | <n>   | contrast, mild noise          |
| BAIXA     | <n>   | stamps over text, strong skew |

### 4.3 Grantor variability

- Multi-grantor documents: <n>
- Grantor is PJ (CNPJ present): <n>
- Signed "a rogo" (illiterate party): <n>

### 4.4 Watermark variability

- Lateral MG state watermark: <n>
- Diagonal "PARA SIMPLES CONSULTA" / similar: <n>
- Cancelled prenotação stamps: <n>

### 4.5 Anchor variability

<Summarize the anchor variants observed across cartórios for CPF, matrícula, transmitente name, tabelião, selo digital, valor, data. Reference `parser_sketch/catalogo_ancoras.json`.>

## 5. OCR artifact patterns observed

- Common fragmentations: `CPF` as `C PF`, `C P F`, etc.
- Character substitutions: O/0, I/1, S/5, B/8, G/9.
- Line-break hyphenation in proper nouns: <examples>
- Footer leakage into body text: <examples>

## 6. Pre-processing impact per document class

| Document class | Mean CER before | Mean CER after winning experiment | Reduction |
| -------------- | --------------- | --------------------------------- | --------- |
| ESC-BOA        | <x>             | <y>                               | <z%>      |
| ESC-DEG        | <x>             | <y>                               | <z%>      |
| ESC-BAIXA      | <x>             | <y>                               | <z%>      |
| ESC-MARCA      | <x>             | <y>                               | <z%>      |
| MAT-ATUAL-BOA  | <x>             | <y>                               | <z%>      |
| MAT-ATUAL-DEG  | <x>             | <y>                               | <z%>      |
| MAT-MONO       | <x>             | <y>                               | <z%>      |
| MAT-ONUS       | <x>             | <y>                               | <z%>      |
| MAT-RURAL      | <x>             | <y>                               | <z%>      |
| MAT-TRANSP     | <x>             | <y>                               | <z%>      |

## 7. Parsing difficulty per document class

| Document class | Critical-field accuracy | Notes |
| -------------- | ----------------------- | ----- |
| ESC-BOA        | <x>                     | —     |
| ESC-DEG        | <x>                     | —     |
| ESC-BAIXA      | <x>                     | —     |
| ESC-MULTI      | <x>                     | —     |
| ESC-PJ         | <x>                     | —     |
| ESC-ROGO       | <x>                     | —     |
| ESC-MARCA      | <x>                     | —     |
| ESC-PRENOT     | <x>                     | —     |
| MAT-ATUAL-BOA  | <x>                     | —     |
| MAT-ATUAL-DEG  | <x>                     | —     |
| MAT-MONO       | <x>                     | —     |
| MAT-ONUS       | <x>                     | —     |
| MAT-RURAL      | <x>                     | —     |
| MAT-TRANSP     | <x>                     | —     |

## 8. Edge cases for Phase 1 attention

<Bulleted list of specific documents or patterns that deserve explicit Phase 1 handling, with document IDs.>

## 9. Source artifacts

- `corpus/corpus_catalog.json`
- `benchmarks/preprocessamento/preprocessamento_resultados.json`
- `benchmarks/ocr/ocr_benchmark_relatorio.json`
- `parser_sketch/catalogo_ancoras.json`
- `parser_sketch/parser_sketch_resultados.json`
```
