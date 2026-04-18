# Log de Execução — Fase 0

Projeto: CartórioDoc
Plano: fase0_plano_execucao.md v1.3

---

## [2026-04-17 10:35] Activity: Setup do ambiente

**Status:** CONCLUDED (com desvios de ambiente registrados — ver Issues)
**Duration:** ~1 hour
**Summary:** Infraestrutura do repositório criada: package.json, requirements.txt, tsconfig.json, .gitignore, README.md, scripts/setup_ambiente.ps1, scripts/validar_corpus_catalog.ts (skeleton), scripts/validar_ground_truth.ts (skeleton), scripts/anonimizar_documento.py (implementação completa per Seção 3.2.2). Todos os diretórios da Seção 2.1 criados. npm install bem-sucedido, tsc --noEmit sem erros.
**Parameters declared:** n/a (atividade de setup)
**Outputs:**
- package.json
- package-lock.json (gerado por npm install)
- requirements.txt
- tsconfig.json
- .gitignore
- README.md
- scripts/setup_ambiente.ps1
- scripts/validar_corpus_catalog.ts
- scripts/validar_ground_truth.ts
- scripts/anonimizar_documento.py
- Diretórios: corpus/, benchmarks/, parser_sketch/, baseline/, decisoes/, relatorios/, scripts/, ferramentas/, temp/ (ver estrutura completa em Seção 2.1)
**Issues encountered:**
1. DESVIO DE AMBIENTE — Node.js v22 vs v20 → DECISION-1 em `decisoes/decisao_setup_ambiente.md`
2. DESVIO DE AMBIENTE — Python 3.14 vs 3.11 → DECISION-2 em `decisoes/decisao_setup_ambiente.md`
3. DESVIO DE PACOTE — mupdf ^0.4.0 inexistente no npm → DECISION-3 em `decisoes/decisao_setup_ambiente.md`
4. VULNERABILIDADE — node-tesseract-ocr CVE GHSA-8j44-735h-w4w2 → DECISION-4 em `decisoes/decisao_setup_ambiente.md`
5. LOCALIZAÇÃO DO PLANO — fase0_plano_execucao.md movido para raiz → DECISION-5 em `decisoes/decisao_setup_ambiente.md`
**Next activity:** Coleta do corpus (145 documentos) — depende de entrega de documentos pelo cartório-alvo

---

## [2026-04-17 11:45] Activity: Correção de estratégia de dependências (continuação do Setup)

**Status:** CONCLUDED
**Duration:** ~30 min
**Summary:** Corrigido paddlepaddle de 2.6.1 para 2.6.2 (única versão 2.x disponível no PyPI para Python 3.11 Windows). Atualizado setup_ambiente.ps1 para usar py -3.11 no check de Python e .venv no pip install. Adicionado .venv/ ao .gitignore. Gerado requirements-lock.txt via pip freeze com 81 pacotes. setup_ambiente.ps1 executado com sucesso completo: todos os 7 checks passaram, npm install e pip install bem-sucedidos, tsc --noEmit sem erros.
**Parameters declared:** python=3.11.9 (via py -3.11); venv=.venv; paddlepaddle=2.6.2; paddleocr=2.7.3; PyMuPDF=1.23.26; numpy=1.26.4; opencv-python-headless=4.9.0.80; Pillow=10.2.0
**Outputs:**
- requirements.txt (paddlepaddle atualizado para 2.6.2)
- requirements-lock.txt (pip freeze completo, 81 pacotes)
- scripts/setup_ambiente.ps1 (atualizado: py -3.11 check, .venv creation, .venv pip install)
- .gitignore (adicionado .venv/)
- .venv/ (Python 3.11.9, criado em sessão anterior pelo líder técnico)
**Issues encountered:**
- RISCO RESIDUAL: coexistência de três pacotes opencv no .venv → DECISION-9 em `decisoes/decisao_setup_ambiente.md`
- paddlepaddle 2.6.1 → 2.6.2 → DECISION-6 em `decisoes/decisao_setup_ambiente.md`
- py launcher no setup script → DECISION-7 em `decisoes/decisao_setup_ambiente.md`
- integração de .venv no setup script → DECISION-8 em `decisoes/decisao_setup_ambiente.md`
**Next activity:** Coleta do corpus (145 documentos)

---

## [2026-04-17 14:00] Activity: BLOCO 5A — JSON Schema files for corpus and benchmark artifacts

**Status:** CONCLUDED
**Duration:** ~1 hour
**Summary:** Created 5 JSON Schema files (Draft-07, AJV 8.x) under `schemas/` at the repository root, faithfully derived from the 5 contracts in `.claude/schemas/*.md`. All 5 schemas compiled successfully with AJV (`strict: false, validateFormats: false`). No validator implementations produced (BLOCO 5B deferred). Execution stopped at BLOCO 5A boundary.
**Parameters declared:** JSON Schema Draft-07; AJV ^8.12.0; strict: false; validateFormats: false
**Outputs:**
- `schemas/corpus_catalog_schema.json` — derived from `.claude/schemas/corpus-catalog.md`
- `schemas/ground_truth_schema.json` — derived from `.claude/schemas/ground-truth.md`
- `schemas/rasterization_results_schema.json` — derived from `.claude/schemas/rasterization-results.md`
- `schemas/preprocessing_results_schema.json` — derived from `.claude/schemas/preprocessing-results.md`
- `schemas/ocr_benchmark_report_schema.json` — derived from `.claude/schemas/ocr-benchmark-report.md`
**Issues encountered:**
1. AMBIGUITY: `categoria_corpus` in corpus-catalog.md references "Section 3.1 of the plan" without listing allowed values → not enumerated in JSON Schema; validator script must enforce the allowed set. $comment added.
2. AMBIGUITY: `checklist_gabarito` values in ground-truth.md are "OK", "NAO_ATENDE", "NAO_APLICA" or "field-specific" → items typed as unconstrained ({}); validator script must check per-item semantics.
3. LIMITATION: CER 3-decimal precision constraint (preprocessing-results.md) cannot be enforced in JSON Schema; enforced by validator script.
4. LIMITATION: Cross-field constraints (e.g., total_documentos == len(documentos), ground_truth_disponivel → non-null arquivo, tipo_documento cross-checks) cannot be expressed in JSON Schema; all marked with $comment.
5. LIMITATION: Cross-file constraints (Gate decision references, corpus catalog cross-references) cannot be expressed in JSON Schema; all marked with $comment.
**Next activity:** BLOCO 5B — schemas for anchors_catalog, parser_sketch_results, baseline_v1 (pending technical lead direction)

---

## [2026-04-17 16:20] Activity: BLOCO 5A (v2) — JSON Schema files completos (8/8)

**Status:** CONCLUDED
**Duration:** ~1.5 hours
**Summary:** Refeito o BLOCO 5A corretamente. Produzidos 8 schemas JSON (Draft-07, AJV 8.x) em `scripts/schemas/`, derivados fielmente dos 8 contratos em `.claude/schemas/*.md`. A tentativa anterior desta sessão (entrada [2026-04-17 14:00]) produziu apenas 5 schemas em localização incorreta (`schemas/` na raiz); esta entrada substitui aquela. Metaschema check executado via `node scripts/schemas/_validate_schemas.js`: todos os 8 PASS. Nenhum desvio em relação aos contratos .md — todas as variações registradas em $comment dentro dos próprios schemas.
**Parameters declared:** JSON Schema draft-07; AJV ^8.12.0; strict: false; additionalProperties: false no nível raiz de cada schema; additionalProperties relaxado apenas em sub-objetos de chaves dinâmicas documentados via $comment.
**Outputs:**
- `scripts/schemas/corpus-catalog.schema.json`
- `scripts/schemas/ground-truth.schema.json`
- `scripts/schemas/rasterization-results.schema.json`
- `scripts/schemas/preprocessing-results.schema.json`
- `scripts/schemas/ocr-benchmark-report.schema.json`
- `scripts/schemas/anchors-catalog.schema.json`
- `scripts/schemas/parser-sketch-results.schema.json`
- `scripts/schemas/baseline-v1.schema.json`
- `scripts/schemas/_validate_schemas.js` (helper de metaschema check)
**Metaschema check results:**
```
PASS  anchors-catalog.schema.json
PASS  baseline-v1.schema.json
PASS  corpus-catalog.schema.json
PASS  ground-truth.schema.json
PASS  ocr-benchmark-report.schema.json
PASS  parser-sketch-results.schema.json
PASS  preprocessing-results.schema.json
PASS  rasterization-results.schema.json
ALL SCHEMAS VALID
```
**Dynamic-key sub-objects with additionalProperties relaxed (documented via $comment in each schema):**
1. `corpus-catalog` — nenhum: todas as chaves são estáticas
2. `ground-truth` — `campos` (nomes dinâmicos de campo), `texto_completo_por_pagina` (chaves = números de página)
3. `rasterization-results` — nenhum: todas as chaves são estáticas
4. `preprocessing-results` — `agregados_por_experimento` (IDs de experimento dinâmicos), `ExperimentDefinition.parametros` (parâmetros livres por experimento)
5. `ocr-benchmark-report` — nenhum: todas as chaves são estáticas
6. `anchors-catalog` — `tipos_documento[*].ancoras` (nomes de campo canônicos da Seção 17 do plano)
7. `parser-sketch-results` — `resultados_por_campo` e `DocumentResult.campos_extraidos` (mesmos nomes dinâmicos)
8. `baseline-v1` — `DocumentBaseline.campos_extraidos` (mesmos nomes dinâmicos)
**Issues encountered:** Nenhum desvio em relação aos contratos .md encontrado.
**Next activity:** BLOCO 5B — validadores completos (aguardando autorização do líder técnico)

---

## [2026-04-17 12:00] DISCIPLINE FAILURE — Registro retroativo obrigatório

Três alterações ao plano foram aplicadas antes de terem os registros formais correspondentes:

1. Alteração do check de Python em setup_ambiente.ps1: `python --version` → `py -3.11 --version` (DECISION-7)
2. Integração do .venv em setup_ambiente.ps1 (criação e uso do .venv) (DECISION-8)
3. Aceitação da coexistência de três pacotes opencv no mesmo .venv (DECISION-9)

A regra é: qualquer mudança não prevista no plano v1.3 deve gerar um technical-decision-record **antes** de ser aplicada. As três mudanças acima foram aplicadas e só depois formalizadas. Isso constitui falha de disciplina de documentação. Registros retroativos criados em `decisoes/decisao_setup_ambiente.md`.

---

## [2026-04-17] Activity: Revisão 5A — Correções pós-revisão do líder técnico

**Status:** CONCLUDED
**Duration:** ~30 min
**Summary:** Aplicadas três correções solicitadas pelo líder técnico após revisão do relatório do Bloco 5A: (1) AJV format validation ativada via ajv-formats; (2) 4 decisões de interpretação de schema formalizadas em decisao_setup_ambiente.md; (3) regex de documento_id testado empiricamente.
**Parameters declared:** n/a
**Outputs:**
- `scripts/schemas/_validate_schemas.js` (ajv-formats instalado e registrado)
- `package.json` + `package-lock.json` (ajv-formats adicionado em devDependencies)
- `decisoes/decisao_setup_ambiente.md` (DECISION-5A-1 a DECISION-5A-4 adicionadas)

**CORREÇÃO 1 — AJV format validation:**
- Estado anterior: `new Ajv({ strict: false, allErrors: true })` sem ajv-formats → format:date INATIVO.
- Estado atual: `new Ajv({ strict: false, allErrors: true })` + `addFormats(ajv)` → format:date ATIVO.
- ajv-formats instalado via `npm install --save-dev ajv-formats`.
- Teste empírico: `{ data_criacao: "2026-13-45" }` → AJV rejeitou com `must match format "date"`. `{ data_criacao: "2026-04-17" }` → válido. Metaschema check: 8/8 PASS.

**CORREÇÃO 2 — Decisões de schema formalizadas:**
- DECISION-5A-1: regex documento_id — Opção A (cross-product simples, limitação conocida documentada).
- DECISION-5A-2: categoria_corpus — enum 15 valores derivado da Seção 3.1.
- DECISION-5A-3: checklist_gabarito — string aberta (sem enum), vocabulário por campo não enumerado no plano.
- DECISION-5A-4: hash_arquivo — sem regex de formato (dois protocolos aceitos), minLength: 64.

**CORREÇÃO 3 — Teste empírico do regex documento_id:**
Regex: `^(escritura|matricula)_(boa|degradada|baixa|nativa|mono|onus|rural|transporte|multi|pj|rogo|marca|prenot)_\d{3}$`
- PASS escritura_boa_001 ✓
- PASS matricula_mono_015 ✓
- PASS escritura_marca_123 ✓
- PASS matricula_transporte_999 ✓
- FAIL escritura_boa_01 (2 dígitos) ✓
- FAIL matricula_invalida_001 (qualidade inexistente) ✓
- FAIL Escritura_boa_001 (case errado) ✓
- FAIL contrato_boa_001 (tipo inexistente) ✓
- FAIL escritura_boa_001_extra (sufixo extra) ✓
- PASS(!!!) escritura_mono_001 — EDGE CASE DOCUMENTADO: Opção A aceita qualquer tipo×qualidade. Limitação registrada em DECISION-5A-1; semântica enforced pelo validador.

**Issues encountered:** Nenhum.
**Next activity:** Aguardando autorização do líder técnico para BLOCO 5B.

---

## [2026-04-17 22:00] Activity: BLOCO 5B — Validadores completos

**Status:** CONCLUDED
**Duration:** ~2 hours
**Summary:** Implementação completa (não skeleton) de `scripts/validar_corpus_catalog.ts` e `scripts/validar_ground_truth.ts`. Criados 4 fixtures sintéticos em `tests/fixtures/`. Todos os 4 testes executados: valid fixtures → exit 0, invalid fixtures → exit 1 com descrição correta dos erros.

**Parameters declared:** ajv ^8.12.0 + ajv-formats ^3.0.1; JSON Schema draft-07; exit code 0 = valid, 1 = invalid.

**Outputs:**
- `scripts/validar_corpus_catalog.ts` (implementação completa — substitui skeleton)
- `scripts/validar_ground_truth.ts` (implementação completa — substitui skeleton)
- `tests/fixtures/corpus_catalog_valido_sintetico.json` (3 docs sintéticos — ESC-BOA, MAT-ATUAL-BOA, ESC-DEG)
- `tests/fixtures/corpus_catalog_invalido_sintetico.json` (3 erros deliberados: doc_id duplicado, prefixo inconsistente, formato_matricula não-null em escritura)
- `tests/fixtures/sintetico_escritura_001_gt.json` (GT válido para escritura_boa_001)
- `tests/fixtures/sintetico_escritura_001_gt_invalido.json` (GT inválido — 7 erros deliberados)
- `tests/fixtures/gt_valido/escritura_boa_001_gt.json` (cópia para testes de diretório)
- `tests/fixtures/gt_invalido/escritura_boa_001_gt.json` (cópia inválida para testes de diretório)
- `relatorios/validacao_corpus.json` (relatório da última execução)
- `relatorios/validacao_ground_truth.json` (relatório da última execução)
- Stub PDFs: `corpus/anonimizados/ESC-BOA/escritura_boa_001.pdf`, `corpus/anonimizados/ESC-DEG/escritura_degradada_001.pdf`, `corpus/anonimizados/MAT-ATUAL-BOA/matricula_boa_001.pdf` (arquivos vazios para satisfazer o check arquivo_exists nas fixtures)

**validar_corpus_catalog.ts — checks implemented:**
1. JSON Schema validation via AJV (draft-07 + ajv-formats)
2. total_documentos == len(documentos)
3. documento_id uniqueness
4. arquivo path exists (Rule 2)
5. ground_truth_disponivel=true → ground_truth_arquivo non-null and exists (Rule 3)
6. tipo_documento ↔ documento_id prefix consistency (Rule 4)
7. MATRICULA constraints: transmitente_pj=false, assinatura_rogo=false, total_transmitentes=0 (Rule 5)
8. ESCRITURA constraints: formato_matricula=null, tem_onus=false, tem_transporte_ficha=false (Rule 6)
9. Category quota counts reported (Rule 8 — informational)
Output: relatorios/validacao_corpus.json

**validar_ground_truth.ts — checks implemented:**
1. JSON Schema validation via AJV per file
2. All obrigatorio=true campos have non-null valor (Rule 2)
3. CPF fields: 11 digits only, no all-zeros (Rule 3)
4. CNPJ fields: 14 digits; cpf_cnpj fields: 11 or 14 digits (Rule 3)
5. Date fields (_data suffix): ISO 8601 YYYY-MM-DD (Rule 4)
6. Monetary fields (_valor suffix): integer cents (Rule 5)
7. documento_id cross-referenced against corpus_catalog.json (Rule 6)
8. tipo, total_paginas cross-checked against catalog entry
9. All 34 checklist items present and non-empty (Rule 7)
10. discordancias_resolvidas=true → resolucao_discordancias non-null (Rule 8)
11. Calibration corpus (first 30 GT-available docs by documento_id): anotador_secundario non-null, discordancias_resolvidas=true (Rule 9)
Output: relatorios/validacao_ground_truth.json

**Test run results:**

```
TEST 1: validar_corpus_catalog.ts vs corpus_catalog_valido_sintetico.json
  Total documents: 3 | Documents with errors: 0 | Total errors: 0
  Schema valid: true
  EXIT_CODE=0  ✓ EXPECTED: 0

TEST 2: validar_corpus_catalog.ts vs corpus_catalog_invalido_sintetico.json
  Total documents: 3 | Documents with errors: 2 | Total errors: 5
  Schema valid: true
  Errors detected:
    [escritura_boa_001] documento_id_unique: documento_id "escritura_boa_001" is duplicated
    [escritura_boa_001] arquivo_exists: arquivo "corpus/anonimizados/ESC-BOA/escritura_boa_001_b.pdf" does not exist
    [matricula_boa_002] arquivo_exists: arquivo "corpus/anonimizados/ESC-BOA/matricula_boa_002.pdf" does not exist
    [matricula_boa_002] tipo_documento_id_consistency: tipo "ESCRITURA_COMPRA_VENDA" expects prefix "escritura" but got "matricula"
    [matricula_boa_002] escritura_formato_matricula_null: formato_matricula=null required, got "ATUAL"
  EXIT_CODE=1  ✓ EXPECTED: 1

TEST 3: validar_ground_truth.ts vs gt_valido/ (escritura_boa_001_gt.json)
  Files found: 1 | Files with errors: 0 | Total errors: 0
  EXIT_CODE=0  ✓ EXPECTED: 0

TEST 4: validar_ground_truth.ts vs gt_invalido/ (escritura_boa_001_gt.json)
  Files found: 1 | Files with errors: 1 | Total errors: 7
  Errors detected:
    json_schema: must have required property 'item_34'
    obrigatorio_not_null: tipo_titulo is obrigatorio=true but valor is null
    cpf_11_digits: transmitente_1_cpf must be 11 digits, got "1234567890"
    date_iso8601: data_lavratura must be YYYY-MM-DD, got "01/01/2026"
    monetary_integer_cents: valor_partes must be integer, got 500000.5
    checklist_34_items: item_34 is missing
    resolucao_required_when_resolved: discordancias_resolvidas=true but resolucao_discordancias is null
  EXIT_CODE=1  ✓ EXPECTED: 1
```

**Issues encountered:**
1. Initial fixture used `escritura_deg_001` as documento_id — `deg` is not in the schema regex (full word `degradada` required). Fixed to `escritura_degradada_001`.
2. Corpus catalog validator's `arquivo_exists` check requires the referenced PDFs to exist on disk. Created 3 stub (empty) PDF files under `corpus/anonimizados/` so the valid fixture passes. These stubs must NOT be committed (corpus/anonimizados/ is gitignored per .claude/rules/execution-environment.md).
3. Invalid fixture originally had extra `_ERRO_DELIBERADO_*` annotation keys — removed because additionalProperties: false would reject them via JSON Schema before reaching semantic checks.

**Next activity:** BLOCO 5C (awaiting technical lead authorization)


---

## [2026-04-17 23:00] Activity: Revisão 5B — Check 10 tipo×qualidade + hygiene

**Status:** CONCLUDED
**Duration:** ~30 min
**Summary:** (1) Empirical test confirmed escritura_mono_001 was incorrectly accepted by previous Check 6 (prefix-only). (2) Added Check 10 (tipo×qualidade semantic validation) to validar_corpus_catalog.ts. (3) Added 4th deliberate error (escritura_mono_001 / ESCRITURA_COMPRA_VENDA) to invalid fixture. (4) Removed duplicate root-level GT fixture files.

**Check 10 — tipo×qualidade mapping (derived from Section 3.1):**
- ESCRITURA_COMPRA_VENDA: boa, degradada, baixa, nativa, multi, pj, rogo, marca, prenot
- MATRICULA: boa, degradada, mono, onus, rural, transporte
- Mapping verified against Section 3.1 — no discrepancies found. No technical-decision-record required.

**Empirical test result (before fix):**
  escritura_mono_001 + ESCRITURA_COMPRA_VENDA → EXIT_CODE=0 (WRONG — was accepted)
**After fix:**
  escritura_mono_001 + ESCRITURA_COMPRA_VENDA → EXIT_CODE=1, regra="tipo_qualidade_combination"
  Error message: documento_id "escritura_mono_001" has qualidade "mono" that is not valid for tipo_documento "ESCRITURA_COMPRA_VENDA". Valid qualidades: boa, degradada, baixa, nativa, multi, pj, rogo, marca, prenot

**Final test results (all 4 tests):**
  TEST 1: corpus_catalog_valido_sintetico.json → EXIT_CODE=0 ✓
  TEST 2: corpus_catalog_invalido_sintetico.json → EXIT_CODE=1, 6 errors ✓
    - documento_id_unique (escritura_boa_001 duplicado)
    - arquivo_exists (escritura_boa_001_b.pdf)
    - arquivo_exists (matricula_boa_002.pdf)
    - tipo_documento_id_consistency (matricula_boa_002 / ESCRITURA)
    - escritura_formato_matricula_null (matricula_boa_002)
    - tipo_qualidade_combination (escritura_mono_001 / ESCRITURA) ← NEW
  TEST 3: gt_valido/ → EXIT_CODE=0 ✓
  TEST 4: gt_invalido/ → EXIT_CODE=1, 7 errors ✓

**Hygiene applied:** Removed tests/fixtures/sintetico_escritura_001_gt.json and tests/fixtures/sintetico_escritura_001_gt_invalido.json (root-level duplicates). Canonical GT fixtures are now exclusively in tests/fixtures/gt_valido/ and tests/fixtures/gt_invalido/.

**Outputs modified:**
- scripts/validar_corpus_catalog.ts (added VALID_QUALITIES_PER_TIPO constant + Check 10)
- tests/fixtures/corpus_catalog_invalido_sintetico.json (total_documentos 3→4, added escritura_mono_001 entry)
- Deleted: tests/fixtures/sintetico_escritura_001_gt.json
- Deleted: tests/fixtures/sintetico_escritura_001_gt_invalido.json

**Next activity:** BLOCO 5C (awaiting technical lead authorization)

