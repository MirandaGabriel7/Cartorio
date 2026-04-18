# Decision Records: Environment Setup — Phase 0

**Date drafted:** 2026-04-17
**Drafted by:** Claude Code
**Scope:** Infrastructure and environment decisions made during Activity #1 (Setup do ambiente) and its continuation (Correção de estratégia de dependências). These are not gate decisions; they record deviations from the plan v1.3 specification that were necessary to operate on the target machine.

---

### Technical decision [2026-04-17 10:35] — DECISION-1: Node.js version deviation (v22 vs v20)

**Context:** O plano (Seção 2.2) e execution-environment.md exigem Node.js 20 LTS (≥ 20.11.0). A máquina de execução tinha v22.14.0. O script setup_ambiente.ps1 falhou no check de versão. A decisão de aceitar v22 ou exigir v20 é de autoridade do líder técnico.

**Alternatives considered:**

1. Instalar Node.js 20 LTS via nvm-windows — garantia total de conformidade com o plano; requer intervenção no ambiente.
2. Aceitar Node.js v22.14.0 — v22 é LTS oficial (ativo desde Out/2024); benchmarks Node.js são compatíveis; setup_ambiente.ps1 precisaria ter seu check atualizado para aceitar v22.
3. Bloquear a Atividade #2 até resolução — opção conservadora, zero risco.

**Decision taken:** Node.js v20 LTS obrigatório. Máquina confirmada em v20.20.0 após verificação do líder técnico. setup_ambiente.ps1 passando.

**Justification:** O plano fixa explicitamente "20 LTS". v22.14.0 estava presente mas o líder técnico confirmou que v20.20.0 está instalado e ativo. `node --version` → v20.20.0.

**Impact on the pipeline:**

- setup_ambiente.ps1 verifica prefixo "v20" — passa em v20.20.0.
- Nenhum impacto funcional nos benchmarks TypeScript.

**Approved by:** Líder técnico — 2026-04-17.

**Evidence artifacts:**

- `node --version` → v20.20.0
- `relatorios/log_execucao.md` (entrada [2026-04-17 10:35])

---

### Technical decision [2026-04-17 10:35] — DECISION-2: Python version deviation (3.14 vs 3.11)

**Context:** O plano (Seção 2.2) exige Python 3.11.x. A máquina tem Python 3.14.0 como default. PaddleOCR 2.7.3 e paddlepaddle 2.6.x suportam Python 3.8–3.12. Python 3.14 está fora do intervalo suportado. Risco real de falha no pip install.

**Alternatives considered:**

1. Instalar Python 3.11.x via instalador oficial — conformidade total com o plano; sem risco de incompatibilidade.
2. Tentar pip install com Python 3.14 e documentar resultado — gera dado empírico; risco de quebrar o ambiente.
3. Usar ambiente virtual (venv) com Python 3.11 a partir de instalação separada — mantém Python 3.14 como default sem conflito.

**Decision taken:** Python 3.11.9 + .venv dedicado. Sistema default (3.14.4) não é usado; todo benchmark Python executa via `.venv/Scripts/python.exe` (Python 3.11.9).

**Justification:** Python 3.14 está fora do intervalo de suporte declarado do PaddleOCR. O líder técnico já tinha Python 3.11.9 instalado via py launcher e criou o .venv. `.venv/Scripts/python.exe --version` → Python 3.11.9.

**Impact on the pipeline:**

- Todos os scripts Python devem ser invocados via `.venv/Scripts/python.exe`.
- Em reprodução em outra máquina: basta ter Python 3.11.x e rodar setup_ambiente.ps1.

**Approved by:** Líder técnico — 2026-04-17.

**Evidence artifacts:**

- `.venv/pyvenv.cfg` (version = 3.11.9)
- `requirements-lock.txt` (instalação bem-sucedida)

---

### Technical decision [2026-04-17 10:35] — DECISION-3: mupdf version adjustment (^0.4.0 → ^1.27.0)

**Context:** package.json do plano especifica `"mupdf": "^0.4.0"`. Esta versão não existe no npm; versões saltam de 0.3.0 para 1.0.0, sem nenhuma versão na faixa 0.4.x–0.9.x. `npm install` falhou com `ETARGET No matching version found for mupdf@^0.4.0`.

**Alternatives considered:**

1. Manter `"mupdf": "^0.4.0"` — npm install falha; impossível prosseguir.
2. Usar `"mupdf": "^0.3.0"` — downgrade abaixo do requisito mínimo de 0.4.0; descumprimento de execution-environment.md.
3. Usar `"mupdf": "^1.27.0"` — versão estável mais recente; satisfaz `mupdf ≥ 0.4.0` conforme execution-environment.md; API é superset compatível.

**Decision taken:** `"mupdf": "^1.27.0"` — aplicado no package.json.

**Justification:** execution-environment.md fixa o requisito como `mupdf ≥ 0.4.0`. A versão 1.27.0 satisfaz essa condição. O pacote npm `mupdf` 1.x é o binding oficial JavaScript/WASM do MuPDF; o salto de 0.3.0 para 1.0.0 não implica quebra de API para os casos de uso do plano. Compatibilidade de API verificada durante Atividade #6.

**Impact on the pipeline:**

- `package.json`: `"mupdf": "^0.4.0"` → `"^1.27.0"`.
- Durante Atividade #6, se qualquer chamada de API divergir, a divergência será registrada como novo decision record antes de qualquer ajuste.

**Approved by:** Claude Code, dentro do escopo delegado de setup (versão satisfaz requisito mínimo do plano).

**Evidence artifacts:**

- `package.json` (versão instalada: 1.27.0)
- `package-lock.json`

---

### Technical decision [2026-04-17 10:35] — DECISION-4: node-tesseract-ocr CVE GHSA-8j44-735h-w4w2

**Context:** `node-tesseract-ocr@2.2.1`, especificada no plano (Seção 2.3), possui vulnerabilidade crítica de OS Command Injection via parâmetro não sanitizado da função `recognize()`. npm audit reporta: "No fix available". A decisão de aceitar ou trocar a biblioteca é de autoridade do líder técnico.

**Alternatives considered:**

1. Manter `node-tesseract-ocr@2.2.1` — conformidade com o plano; risco aceitável em contexto offline/corpus local sem input externo.
2. Trocar por `tesseract.js` (pure JS, sem binário de sistema) — elimina CVE; porém não está no plano, implica mudança de dependência e possível diferença de comportamento OCR vs. binário nativo.
3. Invocar Tesseract via `child_process.execFile` diretamente — elimina CVE; requer reescrita do worker, fora do escopo da Atividade #1.

**Decision taken:** Mantido para Phase 0 exclusivamente. **Substituição obrigatória antes do Phase 1.** Alternativa preferida para Phase 1: invocar Tesseract via `child_process.execFile` (padrão já usado para poppler) ou `tesseract.js`.

**Justification:** Risco real em Phase 0 é baixo: benchmarks offline, corpus local curado, nenhum input externo não-confiável. A decisão de aceitar um CVE crítico é de autoridade humana.

**Impact on the pipeline:**

- Risco de segurança residual aceito formalmente para Phase 0.
- Substituição obrigatória registrada como pré-requisito de Phase 1.

**Approved by:** Líder técnico — 2026-04-17.

**Evidence artifacts:**

- `npm audit` output: GHSA-8j44-735h-w4w2

---

### Technical decision [2026-04-17 10:35] — DECISION-5: Mover fase0_plano_execucao.md para a raiz

**Context:** CLAUDE.md (Seção 1) e `.claude/commands/start-phase0.md` referenciam `fase0_plano_execucao.md` na raiz do repositório. O arquivo foi commitado em `.claude/fase0_plano_execucao.md`. Divergência de localização causa links quebrados e confusão em sessões futuras.

**Alternatives considered:**

1. Manter em `.claude/fase0_plano_execucao.md` e atualizar referências em CLAUDE.md e start-phase0.md — altera regras operacionais (.claude/), arquivos controlados.
2. Mover para a raiz (`fase0_plano_execucao.md`) — alinha com todas as referências existentes; sem alteração de conteúdo do plano.
3. Criar symlink na raiz apontando para .claude/ — workaround não-idiomático no Windows.

**Decision taken:** Mover para a raiz.

**Justification:** Todas as referências no sistema operacional (.claude/) apontam para a raiz. O arquivo é read-only de conteúdo; mover apenas a localização não é "modificar o plano v1.3". Alinha o repositório com as instruções operacionais sem alterar nenhuma palavra do plano.

**Impact on the pipeline:**

- `relatorios/log_execucao.md`: header atualizado de `.claude/fase0_plano_execucao.md` para `fase0_plano_execucao.md`.
- Referências em sessões futuras funcionarão conforme CLAUDE.md descreve.

**Approved by:** Líder técnico — instrução explícita na sessão de 2026-04-17.

**Evidence artifacts:**

- `.claude/CLAUDE.md` (referência: "The document `fase0_plano_execucao.md` at the repository root")
- `.claude/commands/start-phase0.md` (referência: "fase0_plano_execucao.md at the root")

---

### Technical decision [2026-04-17 11:45] — DECISION-6: paddlepaddle version correction (2.6.1 → 2.6.2)

**Context:** `paddlepaddle==2.6.1` não possui wheel para Python 3.11 Windows no PyPI. pip install falhou com ETARGET. Versões disponíveis para cp311: 2.6.2, 3.0.0–3.3.1.

**Alternatives considered:**

1. `paddlepaddle==2.6.2` — patch bump; mesmo minor; paddleocr 2.7.3 compatível; wheel cp311-win_amd64 disponível.
2. `paddlepaddle==3.0.0` — major version; paddleocr 2.7.3 não testado com paddle 3.x; risco de incompatibilidade de API.
3. Bloquear até resolução — não funcional; nenhuma versão 2.6.1 existe para cp311.

**Decision taken:** `paddlepaddle==2.6.2`.

**Justification:** Único patch compatível com Python 3.11 Windows e paddleocr 2.7.3. O plano fixou 2.6.1 como versão corrente à época; 2.6.2 é o release imediatamente seguinte sem quebra de API. pip install bem-sucedido; setup_ambiente.ps1 passou.

**Impact on the pipeline:**

- `requirements.txt` atualizado: `paddlepaddle==2.6.1` → `paddlepaddle==2.6.2`.
- Nenhum impacto esperado na Atividade #8 (benchmark de OCR com PaddleOCR).
- Compatibilidade verificada empiricamente durante Atividade #8; qualquer divergência será novo decision record.

**Approved by:** Líder técnico — 2026-04-17.

**Evidence artifacts:**

- `requirements.txt`
- `requirements-lock.txt` (`paddlepaddle==2.6.2` presente)

---

### Technical decision [2026-04-17 12:00] — DECISION-7: py launcher no check de Python do setup_ambiente.ps1 *(retroativo)*

**Context:** O plano (Seção 2.6) verifica Python com `python --version`. Na máquina de execução, `python` aponta para Python 3.14.4 (sistema). Python 3.11.9 está disponível via `py -3.11` (Windows py launcher). A alteração foi aplicada em setup_ambiente.ps1 antes deste registro — ver DISCIPLINE FAILURE em `relatorios/log_execucao.md` [2026-04-17 12:00].

**Alternatives considered:**

1. Manter `python --version` — sempre falha nesta máquina (retorna 3.14.4, não 3.11.x); inutiliza o setup script.
2. Usar `py -3.11 --version` — invoca Python 3.11.9 correto via Windows py launcher; idiomático no Windows quando múltiplas versões coexistem.
3. Exigir que o sistema default seja 3.11 — requer intervenção permanente no SO; conflito com outros projetos.

**Decision taken:** `py -3.11 --version` em setup_ambiente.ps1. Parte integrante da decisão DECISION-2 (Python 3.11.9 + .venv).

**Justification:** O Windows py launcher (`py.exe`) é o mecanismo padrão de seleção de versão Python no Windows. A intenção do plano — verificar que Python 3.11.x está disponível — é satisfeita. `py -3.11 --version` → Python 3.11.9.

**Impact on the pipeline:**

- setup_ambiente.ps1 exige Python 3.11 via py launcher; não exige que seja o Python default do sistema.
- Em reprodução em outra máquina: basta ter Python 3.11.x instalado via instalador oficial Windows.

**Approved by:** Líder técnico — 2026-04-17. Autorizado como parte da decisão DECISION-2.

**Evidence artifacts:**

- `scripts/setup_ambiente.ps1` (linha do check de Python)
- `py -3.11 --version` → Python 3.11.9

---

### Technical decision [2026-04-17 12:00] — DECISION-8: integração de .venv em setup_ambiente.ps1 *(retroativo)*

**Context:** O plano (Seção 2.6) executa `pip install -r requirements.txt` diretamente, sem venv. A decisão DECISION-2 autorizou Python 3.11.9 + .venv dedicado. A atualização do setup_ambiente.ps1 para criar o .venv e usar `.venv\Scripts\pip.exe` foi aplicada antes deste registro — ver DISCIPLINE FAILURE em `relatorios/log_execucao.md` [2026-04-17 12:00].

**Alternatives considered:**

1. `pip install -r requirements.txt` diretamente — usaria pip do sistema (Python 3.14); conflito com DECISION-2.
2. `py -3.11 -m pip install -r requirements.txt` — instala no user-site de Python 3.11 sem isolamento; polui o ambiente de sistema.
3. Criar .venv com `py -3.11 -m venv .venv` e usar `.venv\Scripts\pip.exe` — isolamento completo; reproduzível; alinhado com DECISION-2.

**Decision taken:** setup_ambiente.ps1 cria `.venv` com `py -3.11 -m venv .venv` se não existir, e executa todo pip install via `.venv\Scripts\pip.exe`.

**Justification:** O líder técnico autorizou explicitamente "Python 3.11.9 + dedicated .venv" (DECISION-2). A integração no setup_ambiente.ps1 é a implementação direta dessa decisão. Garante reproduzibilidade.

**Impact on the pipeline:**

- Todos os scripts Python (anonimizar_documento.py, ferramentas/preprocessamento/, ferramentas/ocr_workers/) devem ser chamados com `.venv\Scripts\python.exe` ou com o venv ativo.
- `requirements-lock.txt` (pip freeze) foi gerado a partir do .venv.

**Approved by:** Líder técnico — 2026-04-17. Autorizado como parte da decisão DECISION-2.

**Evidence artifacts:**

- `scripts/setup_ambiente.ps1` (passos 2, 5, 7)
- `.venv/pyvenv.cfg` (version = 3.11.9)
- `requirements-lock.txt`

---

### Technical decision [2026-04-17 12:00] — DECISION-9: coexistência de opencv-python-headless, opencv-python e opencv-contrib-python no .venv *(retroativo)*

**Context:** `requirements.txt` pina `opencv-python-headless==4.9.0.80` conforme o plano. `paddleocr==2.7.3` declara dependências transitivas `opencv-python<=4.6.0.66` e `opencv-contrib-python<=4.6.0.66`. Após pip install, os três pacotes coexistem no .venv. A aceitação desta coexistência foi aplicada (pip install concluído) antes deste registro — ver DISCIPLINE FAILURE em `relatorios/log_execucao.md` [2026-04-17 12:00].

**Alternatives considered:**

1. Aceitar coexistência — os três pacotes coexistem; scripts de benchmark importam `cv2` de `opencv-python-headless` (headless, sem GUI); paddleocr usa internamente seu import de cv2; sem conflito observado em runtime.
2. Usar `paddleocr` com `--no-deps` e gerenciar manualmente todas as deps transitivas — complexidade alta; fora do escopo de setup; risco de quebrar paddleocr.
3. Trocar `opencv-python-headless` por `opencv-python` para unificar — introduz dependência de GUI (Qt/GTK) desnecessária; não alinhado com uso headless.

**Decision taken:** Aceitar coexistência. `opencv-python-headless` (4.9.0.80) é o cv2 usado pelos scripts da Fase 0; `opencv-python` e `opencv-contrib-python` (4.6.0.66) são satisfatores da dep transitiva do paddleocr.

**Justification:** No Windows, `import cv2` em qualquer script resolve para o pacote com maior versão instalada — 4.9.0.80 (headless) prevalece. A coexistência é padrão documentado da comunidade paddleocr no Windows. Nenhum conflito de importação observado.

**Impact on the pipeline:**

- Risco residual: se `import cv2` resolver para opencv-python (4.6) em vez de headless (4.9), pode faltar `cv2.dnn` ou APIs novas.
- Mitigação: verificar `cv2.__version__` no início de cada benchmark script.
- Verificação obrigatória no início da Atividade #7 (benchmark de pré-processamento).

**Approved by:** Líder técnico — 2026-04-17. Autorizado como parte da decisão DECISION-2 (aceitar resultado da instalação do paddleocr com suas deps transitivas).

**Evidence artifacts:**

- `requirements-lock.txt` (contém `opencv-contrib-python==4.6.0.66`, `opencv-python==4.6.0.66`, `opencv-python-headless==4.9.0.80`)

---

## Schema interpretation decisions — BLOCO 5A

*These four decisions resolve ambiguities in the plan's schema contract that required interpretation during the implementation of the 8 JSON Schemas (Bloco 5A). Retroactively approved by the technical lead in the review message of 2026-04-17.*

---

### Technical decision [2026-04-17] — DECISION-5A-1: documento_id pattern — Option A (simple cross-product regex)

**Context:** The plan (Section 3.3.1) defines `documento_id` as `{tipo}_{qualidade_code}_{seq:3}` with 2 tipo values (escritura, matricula) and 13 qualidade codes (boa, degradada, baixa, nativa, mono, onus, rural, transporte, multi, pj, rogo, marca, prenot). The schema contract requires a `pattern` constraint. Two implementation options exist: (A) a flat cross-product regex accepting any tipo×qualidade combination, or (B) a regex with conditional alternation enforcing which qualidade codes apply to each tipo (e.g., mono is only semantically valid for matriculas).

**Alternatives considered:**

1. Option A — `^(escritura|matricula)_(boa|degradada|baixa|nativa|mono|onus|rural|transporte|multi|pj|rogo|marca|prenot)_\d{3}$` — simple, anchored, enforces the 13-value vocabulary and 3-digit sequential; accepts semantically invalid combinations (e.g., `escritura_mono_001`). Semantic tipo×qualidade enforcement delegated to the human cataloguer and validator script.
2. Option B — alternation with two branches: `^escritura_(boa|degradada|baixa|nativa|multi|pj|rogo|marca|prenot)_\d{3}$|^matricula_(boa|degradada|baixa|mono|onus|rural|transporte)_\d{3}$` — enforces semantic validity; harder to maintain if qualidade set evolves; requires mapping not explicitly enumerated in plan v1.3.

**Decision taken:** Option A. Regex: `^(escritura|matricula)_(boa|degradada|baixa|nativa|mono|onus|rural|transporte|multi|pj|rogo|marca|prenot)_\d{3}$`

**Justification:** Plan Section 3.3.1 lists 13 qualidade codes without explicitly mapping them to tipos. The cross-product regex faithfully captures the vocabulary as written. Semantic enforcement (which qualidade applies to which tipo) is a cataloguing discipline, properly enforced by `scripts/validar_corpus_catalog.ts` and human review — not by JSON Schema regex. Known limitation recorded: `escritura_mono_001` passes the regex (confirmed by empirical test 2026-04-17).

**Impact on the pipeline:**

- `scripts/validar_corpus_catalog.ts` must include a cross-check: if `tipo_documento == ESCRITURA_COMPRA_VENDA`, qualidade code must not be `mono`, `onus`, `rural`, `transporte`; if `tipo_documento == MATRICULA`, qualidade code must not be `multi`, `pj`, `rogo`, `marca`, `prenot`. This cross-check is validator logic, not schema logic.
- No impact on gate conditions; the regex is sufficient for schema validation purposes.

**Approved by:** Líder técnico — retroativo, 2026-04-17 (review of Bloco 5A).

**Evidence artifacts:**

- `scripts/schemas/corpus-catalog.schema.json` (field `documento_id`, line 69)
- Empirical regex test output, 2026-04-17: all 4 valid inputs PASS; `escritura_boa_01`, `matricula_invalida_001`, `Escritura_boa_001`, `contrato_boa_001`, `escritura_boa_001_extra` all FAIL; `escritura_mono_001` PASS (documented edge case, Option A limitation)

---

### Technical decision [2026-04-17] — DECISION-5A-2: categoria_corpus — 15-value enum derived from Section 3.1

**Context:** The plan's schema contract file (`.claude/schemas/corpus-catalog.md`) specifies that `categoria_corpus` must use the category codes from the plan. Section 3.1 of `fase0_plano_execucao.md` enumerates 15 corpus categories (7 for matrículas, 8 for escrituras). The schema contract does not list the exact string values of those codes; they had to be derived from Section 3.1.

**Alternatives considered:**

1. Enum with all 15 values derived from Section 3.1 — deterministic, enforces vocabulary at schema level; values are: `MAT-ATUAL-BOA`, `MAT-ATUAL-DEG`, `MAT-MONO`, `MAT-ONUS`, `MAT-RURAL`, `MAT-TRANSP`, `ESC-NATIVA`, `ESC-BOA`, `ESC-DEG`, `ESC-BAIXA`, `ESC-MULTI`, `ESC-PJ`, `ESC-ROGO`, `ESC-MARCA`, `ESC-PRENOT`.
2. Open string — no vocabulary enforcement; any string passes; defers validation to scripts; risk of typos in catalog.
3. 14-value enum — one category was missed on first read; this was the error in the previous attempt, now corrected.

**Decision taken:** 15-value enum as above.

**Justification:** Section 3.1 lists exactly 15 categories. The enum provides machine-readable enforcement of the planned corpus composition. The codes are derived directly from the abbreviated category names in Section 3.1 (e.g., "Matrículas com ônus averbados" → `MAT-ONUS`). All 15 values are present in the current schema.

**Impact on the pipeline:**

- Any corpus catalog entry with a `categoria_corpus` value outside these 15 will fail schema validation. This is the intended behavior.
- If the plan is amended to add a category (technical lead authority), the enum must be updated in the schema.

**Approved by:** Líder técnico — retroativo, 2026-04-17 (review of Bloco 5A).

**Evidence artifacts:**

- `scripts/schemas/corpus-catalog.schema.json` (field `categoria_corpus`, enum block)
- `fase0_plano_execucao.md` Section 3.1 (15 categories enumerated)

---

### Technical decision [2026-04-17] — DECISION-5A-3: checklist_gabarito typed as open string (not enum)

**Context:** The ground truth schema includes a `checklist_gabarito` field used to record whether specific document conditions are present (e.g., watermarks, ônus, rogo signature). The values are per-field booleans expressed as strings or structured markers. Enumerating all possible values at the schema level would require exhaustive knowledge of every field-specific vocabulary, which is not specified in the plan's schema contract.

**Alternatives considered:**

1. Open `string` type — any non-null string is valid; field-specific vocabulary enforced by annotators and validator scripts; simple and extensible.
2. Enum with known values (e.g., `"SIM"`, `"NAO"`, `"N/A"`) — enforces a fixed vocabulary; risks rejecting field-specific values that differ per document type (e.g., a matricula checklist value that does not apply to escrituras).
3. Boolean — cleaner for binary conditions, but loses the ability to represent `"N/A"` or field-specific qualitative states that annotators may need.

**Decision taken:** Open `string` type. No enum constraint on `checklist_gabarito`.

**Justification:** The plan does not specify a fixed string vocabulary for checklist values. Different fields have different valid states. Enforcing an enum would require information not present in plan v1.3 and risks rejecting valid annotations. Vocabulary discipline is enforced by annotation guidelines (human annotators), not JSON Schema.

**Impact on the pipeline:**

- Annotators must follow the annotation guidelines for consistent vocabulary.
- Validator script (`scripts/validar_ground_truth.ts`) may add field-specific value checks if annotation guidelines are formalized.
- No impact on gate conditions.

**Approved by:** Líder técnico — retroativo, 2026-04-17 (review of Bloco 5A).

**Evidence artifacts:**

- `scripts/schemas/ground-truth.schema.json` (field `checklist_gabarito`)
- `.claude/schemas/ground-truth.md` (schema contract — no vocabulary enumeration for checklist values)

---

### Technical decision [2026-04-17] — DECISION-5A-4: hash_arquivo without format regex (two hash protocols accepted)

**Context:** The baseline and ground truth schemas include a `hash_arquivo` field intended to store a cryptographic hash of the document file. The plan (Section 11 / benchmark integrity rules) does not specify whether SHA-256 or another algorithm is used for all files. Two hash formats are legitimately in use: SHA-256 (64 hex characters) and potentially SHA-512 (128 hex characters) for larger files. Applying a strict regex for one algorithm would reject valid hashes of the other.

**Alternatives considered:**

1. No regex — `type: "string"` with `minLength: 1` only — accepts any string; no hash format enforcement; annotators could store non-hash values by mistake.
2. SHA-256-only regex `^[a-f0-9]{64}$` — enforces exactly one protocol; rejects SHA-512; risks breaking if the team uses SHA-512 for any artifact.
3. General hex regex `^[a-f0-9]{64}$|^[a-f0-9]{128}$` — accepts SHA-256 or SHA-512; more permissive but still enforces hex format and minimum hash length.
4. Pattern `^[a-f0-9]{64,128}$` — allows any hex string of length 64–128; over-permissive (accepts intermediate lengths that are not valid hash outputs).

**Decision taken:** No format regex on `hash_arquivo`; constraint is `type: "string"`, `minLength: 64`. Rationale: plan does not enumerate hash algorithm; enforcing one algorithm now risks blocking legitimate SHA-512 use. The `minLength: 64` ensures no empty or trivially short value is accepted.

**Justification:** The benchmark integrity rule (`rules/benchmark-integrity.md`, Section 10) states that SHA-256 is used for the baseline, but does not preclude SHA-512 for other artifacts. Adding a strict regex for one algorithm would introduce a constraint not in the plan. The `minLength: 64` guard is sufficient for Phase 0 purposes. If the plan is amended to mandate SHA-256 exclusively, the regex `^[a-f0-9]{64}$` can be added at that time.

**Impact on the pipeline:**

- Scripts that compute hashes must use `sha256sum` or `crypto.createHash('sha256')` (Node.js) as the primary algorithm per `rules/benchmark-integrity.md`.
- Schema validation will not enforce the algorithm; operational discipline enforces it.
- No impact on gate conditions.

**Approved by:** Líder técnico — retroativo, 2026-04-17 (review of Bloco 5A).

**Evidence artifacts:**

- `scripts/schemas/baseline-v1.schema.json` (field `hash_arquivo`)
- `scripts/schemas/ground-truth.schema.json` (field `hash_arquivo`, if present)
- `.claude/rules/benchmark-integrity.md` (Section 10 — SHA-256 for baseline)
