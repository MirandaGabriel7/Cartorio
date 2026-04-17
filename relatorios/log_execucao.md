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

## [2026-04-17 12:00] DISCIPLINE FAILURE — Registro retroativo obrigatório

Três alterações ao plano foram aplicadas antes de terem os registros formais correspondentes:

1. Alteração do check de Python em setup_ambiente.ps1: `python --version` → `py -3.11 --version` (DECISION-7)
2. Integração do .venv em setup_ambiente.ps1 (criação e uso do .venv) (DECISION-8)
3. Aceitação da coexistência de três pacotes opencv no mesmo .venv (DECISION-9)

A regra é: qualquer mudança não prevista no plano v1.3 deve gerar um technical-decision-record **antes** de ser aplicada. As três mudanças acima foram aplicadas e só depois formalizadas. Isso constitui falha de disciplina de documentação. Registros retroativos criados em `decisoes/decisao_setup_ambiente.md`.
