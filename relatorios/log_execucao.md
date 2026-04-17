# Log de Execução — Fase 0

Projeto: CartórioDoc
Plano: fase0_plano_execucao.md v1.0

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
1. DESVIO DE AMBIENTE — Node.js: plano exige v20 LTS (≥ 20.11.0); encontrado v22.14.0. Node.js v22 é LTS (desde Out/2024) e operacionalmente compatível com os scripts do plano. O check na setup_ambiente.ps1 falhou neste ponto. Ação necessária: líder técnico deve confirmar se v22 é aceito ou instalar v20 LTS.
2. DESVIO DE AMBIENTE — Python: plano exige 3.11.x; encontrado 3.14.0. PaddleOCR (paddleocr==2.7.3) tipicamente suporta 3.8–3.12. Risco: pip install -r requirements.txt pode falhar para paddleocr/paddlepaddle em Python 3.14. O check na setup_ambiente.ps1 falhou neste ponto. Ação necessária: líder técnico deve instalar Python 3.11.x ou confirmar compatibilidade com 3.14.
3. DESVIO DE PACOTE — mupdf: plano especifica "mupdf": "^0.4.0" (inexistente no npm; versões saltam de 0.3.0 para 1.0.0). Ajustado para "^1.27.0" (versão estável mais recente, satisfaz o requisito "mupdf ≥ 0.4.0" da Seção 2.2). Versão instalada: 1.27.0.
4. VULNERABILIDADE — node-tesseract-ocr: CVE GHSA-8j44-735h-w4w2 (OS Command Injection via parâmetro de recognize()). Risco mitigado em Phase 0: benchmarks são offline, corpus é local controlado, sem input externo. Registrado para decisão do líder técnico.
5. LOCALIZAÇÃO DO PLANO — CLAUDE.md e start-phase0.md referenciam fase0_plano_execucao.md na raiz do repositório, mas o arquivo está em .claude/fase0_plano_execucao.md. Arquivo foi lido em .claude/. Nenhuma ação tomada (modificação de localização requer aprovação do líder técnico).
**Next activity:** Coleta do corpus (145 documentos) — depende de entrega de documentos pelo cartório-alvo

---

---

### Technical decision [2026-04-17 10:35] — DECISION-1: Node.js version deviation (v22 vs v20)

**Context:** O plano (Seção 2.2) e execution-environment.md exigem Node.js 20 LTS (≥ 20.11.0). A máquina de execução tem v22.14.0. O script setup_ambiente.ps1 falhou no check de versão por verificar literalmente a string "v20". A decisão de aceitar ou rejeitar esta versão é de autoridade do líder técnico.

**Alternatives considered:**

1. Instalar Node.js 20 LTS via nvm-windows — garantia total de conformidade com o plano; requer intervenção no ambiente.
2. Aceitar Node.js v22.14.0 — v22 é LTS oficial (ativo desde Out/2024); benchmarks Node.js são compatíveis; setup_ambiente.ps1 precisaria ter seu check atualizado para aceitar v22.
3. Bloquear a Atividade #2 até resolução — opção conservadora, zero risco.

**Decision taken:** PENDENTE — aguardando aprovação do líder técnico.

**Justification:** Node.js v22 é LTS e funcionalmente compatível com todos os scripts do plano. Porém o plano fixa "20 LTS" explicitamente. A alteração implica atualizar setup_ambiente.ps1 (check de versão) sem alterar o plano v1.3.

**Impact on the pipeline:**

- setup_ambiente.ps1 reportará ERRO no check de Node.js até resolução ou atualização do check.
- Nenhum impacto funcional esperado nos benchmarks TypeScript.
- Se aceito v22: atualizar check no setup_ambiente.ps1 de `v20` para `v20` OR `v22` (ambos LTS).

**Approved by:** PENDENTE — líder técnico (gabrielmiranda3004@gmail.com)

**Evidence artifacts:**

- relatorios/log_execucao.md (este registro)

---

### Technical decision [2026-04-17 10:35] — DECISION-2: Python version deviation (3.14 vs 3.11)

**Context:** O plano (Seção 2.2) e execution-environment.md exigem Python 3.11.x. A máquina de execução tem Python 3.14.0. PaddleOCR 2.7.3 e paddlepaddle 2.6.1, conforme documentação oficial, suportam Python 3.8–3.12. Python 3.14 está fora do intervalo suportado. O `pip install -r requirements.txt` não foi executado ainda; há risco real de falha.

**Alternatives considered:**

1. Instalar Python 3.11.x (via pyenv-win ou instalador oficial) — conformidade total com o plano; sem risco de incompatibilidade.
2. Tentar pip install com Python 3.14 e documentar resultado — gera dado empírico; risco de quebrar o ambiente se pacotes pré-compilados não existirem para 3.14.
3. Usar ambiente virtual (venv) com Python 3.11 a partir de uma instalação separada — mantém Python 3.14 como padrão do sistema sem conflito.

**Decision taken:** PENDENTE — aguardando aprovação do líder técnico.

**Justification:** Python 3.14 está fora do intervalo de suporte declarado do PaddleOCR. Prosseguir sem Python 3.11 coloca o benchmark de OCR com PaddleOCR em risco de falha por incompatibilidade de dependências, não por limitação do pipeline. Benchmark integrity rule exige que falhas de ambiente sejam escaladas, não contornadas.

**Impact on the pipeline:**

- pip install -r requirements.txt pode falhar para paddleocr/paddlepaddle. Outros pacotes (opencv-python-headless, Pillow, numpy, PyMuPDF) provavelmente instalarão sem problema.
- Se Python 3.11 não for instalado antes da Atividade #7 (benchmark de pré-processamento) e Atividade #8 (benchmark de OCR), essas atividades serão BLOCKED.

**Approved by:** PENDENTE — líder técnico (gabrielmiranda3004@gmail.com)

**Evidence artifacts:**

- relatorios/log_execucao.md (este registro)

---

### Technical decision [2026-04-17 10:35] — DECISION-3: mupdf version adjustment (^0.4.0 → ^1.27.0)

**Context:** package.json do plano especifica `"mupdf": "^0.4.0"`. Esta versão não existe no npm; o registro público mostra versões de 0.0.1 a 0.3.0 seguidas de 1.0.0 a 1.27.0, sem nenhuma versão na faixa 0.4.x–0.9.x. O `npm install` falhou com `ETARGET No matching version found for mupdf@^0.4.0`.

**Alternatives considered:**

1. Manter `"mupdf": "^0.4.0"` — npm install falha; impossível prosseguir com a atividade.
2. Usar `"mupdf": "^0.3.0"` — downgrade em relação ao requisito mínimo de 0.4.0; descumprimento da regra execution-environment.md.
3. Usar `"mupdf": "^1.27.0"` — versão estável mais recente; satisfaz `mupdf ≥ 0.4.0` conforme execution-environment.md; API é superset compatível.

**Decision taken:** `"mupdf": "^1.27.0"` — aplicado no package.json.

**Justification:** execution-environment.md fixa o requisito como `mupdf ≥ 0.4.0`. A versão 1.27.0 satisfaz essa condição. O pacote npm `mupdf` 1.x é o binding oficial JavaScript/WASM do MuPDF; o salto de versão de 0.3.0 para 1.0.0 não implica quebra de API para os casos de uso do plano. A verificação de compatibilidade de API será realizada durante a Atividade #6 (Benchmark de rasterização).

**Impact on the pipeline:**

- Nenhum impacto funcional esperado. O código de benchmark da Seção 4.3 usa `mupdf.Document.openDocument`, `page.toPixmap`, `mupdf.Matrix.scale`, `mupdf.ColorSpace.DeviceRGB` e `pixmap.asPNG()` — todos presentes na API pública do mupdf 1.x.
- Durante a Atividade #6, se qualquer chamada de API divergir, a divergência será registrada como novo decision record antes de qualquer ajuste no benchmark script.

**Approved by:** Claude Code, dentro do escopo delegado de setup (versão satisfaz requisito mínimo do plano).

**Evidence artifacts:**

- package.json (versão instalada: 1.27.0)
- package-lock.json
- relatorios/log_execucao.md (este registro)

---

### Technical decision [2026-04-17 10:35] — DECISION-4: node-tesseract-ocr CVE GHSA-8j44-735h-w4w2

**Context:** A biblioteca `node-tesseract-ocr@2.2.1`, especificada no plano (Seção 2.3), possui uma vulnerabilidade crítica de OS Command Injection através do parâmetro não sanitizado da função `recognize()`. O npm audit reporta: "No fix available". A decisão de aceitar ou trocar a biblioteca é de autoridade do líder técnico.

**Alternatives considered:**

1. Manter node-tesseract-ocr@2.2.1 — conformidade com o plano; risco aceitável em contexto offline/corpus local sem input externo controlado por atacante.
2. Trocar por `tesseract.js` (pure JS, sem binário de sistema) — elimina CVE; porém não está no plano, implica mudança de dependência e possível diferença de comportamento OCR vs. binário nativo.
3. Invocar Tesseract via `child_process.execFile` diretamente (como poppler) — elimina CVE; requer reescrita do worker, fora do escopo da Atividade #1.

**Decision taken:** PENDENTE — aguardando aprovação do líder técnico.

**Justification:** O risco real em Phase 0 é baixo: benchmarks rodam offline, corpus é local e curado, nenhum input externo não-confiável passa por `recognize()`. Porém a decisão de aceitar um CVE crítico é de autoridade humana, não de Claude Code.

**Impact on the pipeline:**

- Se mantido: risco de segurança residual aceito formalmente; sem impacto funcional nos benchmarks.
- Se trocado por alternativa: Atividade #8 (benchmark de OCR) requer atualização do worker de Tesseract; escopo limitado a `ferramentas/ocr_workers/tesseract_worker.ts`.

**Approved by:** PENDENTE — líder técnico (gabrielmiranda3004@gmail.com)

**Evidence artifacts:**

- relatorios/log_execucao.md (este registro)
- `npm audit` output: GHSA-8j44-735h-w4w2

---

### Technical decision [2026-04-17 10:35] — DECISION-5: Mover fase0_plano_execucao.md para a raiz

**Context:** CLAUDE.md (Seção 1) e .claude/commands/start-phase0.md referenciam `fase0_plano_execucao.md` na **raiz do repositório**. O arquivo foi commitado em `.claude/fase0_plano_execucao.md`. Esta divergência de localização pode causar confusão em sessões futuras — Claude Code procura na raiz e falha; links em CLAUDE.md ficam quebrados.

**Alternatives considered:**

1. Manter em `.claude/fase0_plano_execucao.md` e atualizar referências em CLAUDE.md e start-phase0.md — altera regras operacionais (.claude/), que são arquivos controlados.
2. Mover para a raiz (`fase0_plano_execucao.md`) — alinha com todas as referências existentes; sem alteração de conteúdo do plano.
3. Criar symlink na raiz apontando para .claude/ — workaround não-idiomático no Windows.

**Decision taken:** Mover para a raiz — aprovado pelo líder técnico nesta sessão.

**Justification:** Todas as referências no sistema operacional (.claude/) apontam para a raiz. O arquivo é read-only de conteúdo; mover apenas a localização não é "modificar o plano v1.3". Alinha o repositório com as instruções operacionais sem alterar nenhuma palavra do plano.

**Impact on the pipeline:**

- relatorios/log_execucao.md: atualizar header de `Plano: .claude/fase0_plano_execucao.md` para `Plano: fase0_plano_execucao.md`.
- Referências em sessões futuras funcionarão conforme CLAUDE.md descreve.
- Nenhum conteúdo do plano alterado.

**Approved by:** Líder técnico — instrução explícita na sessão de 2026-04-17.

**Evidence artifacts:**

- .claude/CLAUDE.md (referência: "The document `fase0_plano_execucao.md` at the repository root")
- .claude/commands/start-phase0.md (referência: "fase0_plano_execucao.md at the root")
- relatorios/log_execucao.md (este registro)
