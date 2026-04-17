# Context — Glossary

Terms used across Phase 0. Claude Code uses these definitions consistently. When the plan uses a Portuguese term, the Portuguese term is canonical.

---

## Notary and registry domain

**Cartório** — Brazilian public notary or registry office. For Phase 0, the relevant types are the **Tabelionato de Notas** (issues escrituras) and the **Registro de Imóveis** (maintains matrículas).

**Escritura (pública de compra e venda)** — Public deed recording a real estate purchase and sale. Issued by a tabelionato. One of the two primary document types processed by the system.

**Matrícula** — Property registration record maintained by the registro de imóveis. The authoritative record of a property's ownership, characteristics, liens, and history. The second primary document type.

**Transmitente** — The party transferring the property in an escritura (seller).

**Adquirente** — The party acquiring the property in an escritura (buyer).

**Outorgante** — General term for a granting party; in purchase deeds typically synonymous with transmitente.

**Tabelião** — The notary who authored the escritura.

**Conferente registral** — The registry professional who reviews escrituras against matrículas before registration.

**Ônus** — Encumbrance on a property: hipoteca (mortgage), penhora (judicial attachment), usufruto (usufruct), servidão (easement), etc.

**Transporte de ficha** — Carry-forward of matrícula content onto a new sheet when the original is full. Marked by "TRANSPORTE DA FICHA Nº".

**Averbação** — Annotation on the matrícula recording a change (construction, marital status change, etc.).

**Prenotação** — Preliminary registration filing; may be cancelled if the title is not completed.

**Selo digital** — Digital seal identifier on notary documents.

**Assinatura a rogo** — Signature by proxy, used when a party cannot sign (illiteracy); marked by "a rogo" or "por não saber ler nem escrever".

**DOI / ITBI** — Declaração sobre Operações Imobiliárias / Imposto de Transmissão de Bens Imóveis. Legal/tax items referenced in escrituras.

**CCIR / CAR / INCRA** — Rural property markers relevant to matrículas rurais.

## Document qualities (corpus categories)

**BOA** — Good digitalization quality: ≥ 250 DPI effective, text legible without effort, no critical-area stamps.

**DEGRADADA** — Degraded: lower DPI or visible noise or irregular contrast or JPEG compression artifacts.

**BAIXA** — Low quality: stamps over critical text, poor contrast, strong skew (> 3°).

**NATIVA** — Native PDF with extractable text layer.

**MONO** — Matrícula in older monospaced (typewriter) format, pre-2010.

**MARCA** — Document with MG-state lateral watermark or diagonal "PARA SIMPLES CONSULTA" watermark.

## Pipeline and engineering terms

**Rasterization** — Conversion of a PDF page to a bitmap image. Candidate libraries: mupdf, poppler.

**Pré-processamento** — Image operations applied before OCR: deskew, denoising, binarization, contrast normalization, border cleanup, watermark attenuation.

**OCR** — Optical Character Recognition. Candidate engines for Phase 0: Tesseract 5 (with `tessdata_best/por.traineddata`) and PaddleOCR (`lang=pt`).

**CER** — Character Error Rate = edit distance / length of reference string. Lower is better. Computed with `fastest-levenshtein` using the normalization in `playbooks/ocr-benchmark.md`.

**Âncora** — A label or rubric that precedes a field value in the document text (e.g., "CPF nº", "Matrícula nº"). Used by the parser sketch to locate values.

**Parser sketch** — Exploratory, regex-based field extractor used in Phase 0 to measure parsing feasibility. Not production code.

**Ground truth** — Human-annotated reference values for each document, used to score OCR and parser outputs.

**Corpus de calibração** — The 30 documents with 2-annotator ground truth; used to measure and gate the pipeline.

**Corpus de regressão** — The full 145-document corpus used after gates to validate the baseline and detect regressions.

**Baseline** — Frozen snapshot of the pipeline state at the end of Phase 0, stored in `baseline/fase0_baseline_v1.json`.

**Gate** — A hard approval checkpoint. Phase 0 has three, each requiring human sign-off.

## Tooling and file conventions

**mupdf** — JavaScript/WASM binding to MuPDF; available via `npm install mupdf`. Primary rasterization candidate.

**poppler** — Rasterization toolchain used via the `pdftoppm` binary on Windows. Fallback/alternative candidate.

**Tesseract 5** — OCR engine invoked via `node-tesseract-ocr` with `oem=1, psm=3, lang=por`.

**PaddleOCR** — OCR engine invoked via a Python worker `ferramentas/ocr_workers/paddleocr_worker.py`.

**OpenCV** — Image processing library used in Python preprocessing scripts.

**ajv** — JSON Schema validator used to enforce artifact schemas.

**fastest-levenshtein** — Edit-distance library for CER computation.

**`documento_id`** — Unique identifier of a document in the corpus; format `{tipo}_{qualidade}_{sequencial:3}`.

**Experimento A–F** — The six preprocessing experiments defined in Section 5 of the plan.

**EXPERIMENT_X_v2** — Notation for a re-run of an experiment with declared parameter changes.

## Status terms

**OK** — Default document status; pipeline processes it normally.

**ERRO** — Document failed at one pipeline stage; documented in the log and catalog, not removed.

**EXCLUIDO** — Document removed from corpus by technical-lead approval with logged justification.

**CONCLUDED / IN PROGRESS / BLOCKED / REJECTED / RETRACTED / APPROVED** — Activity and gate statuses in the log. Used exactly as written.