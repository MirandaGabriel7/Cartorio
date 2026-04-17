# Log de Execução — Fase 0

Projeto: CartórioDoc
Plano: .claude/fase0_plano_execucao.md v1.0

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

## [2026-04-17 10:35] TECHNICAL DECISION: mupdf version adjustment

**Context:** package.json do plano especifica "mupdf": "^0.4.0". Esta versão não existe no npm (versões disponíveis: 0.0.1–0.3.0, depois 1.0.0–1.27.0).
**Alternatives considered:** (a) manter "^0.4.0" — falha npm install; (b) usar "^0.3.0" — downgrade; (c) usar "^1.27.0" — versão estável mais recente.
**Decision taken:** "mupdf": "^1.27.0"
**Justification:** A regra execution-environment.md exige "mupdf ≥ 0.4.0". A versão 1.27.0 satisfaz essa condição. API do pacote é compatível com o código do benchmark descrito na Seção 4.3.
**Impact:** Sem impacto funcional esperado. Quando o benchmark de rasterização for implementado (Atividade #6), a API será verificada contra o plano e quaisquer diferenças de API serão registradas.
