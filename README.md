# CartórioDoc — Fase 0: Validação Documental e de Pipeline

Repositório de trabalho da **Fase 0** do projeto CartórioDoc.

Fase 0 não produz código de produção. Produz três decisões técnicas validadas com dados reais, necessárias para autorizar o início da Fase 1.

Para instruções operacionais completas, consulte `.claude/CLAUDE.md`.

---

## Setup do ambiente

### Pré-requisitos

Instale manualmente antes de rodar o script:

1. **Node.js 20 LTS** — https://nodejs.org/
2. **Python 3.11.x** — https://www.python.org/
3. **Tesseract 5** (Windows 64-bit) — https://github.com/UB-Mannheim/tesseract/wiki
   - Durante a instalação, selecionar "Additional language data" → Portuguese
   - Substituir `C:\Program Files\Tesseract-OCR\tessdata\por.traineddata` pelo modelo `tessdata_best`: https://github.com/tesseract-ocr/tessdata_best
   - Adicionar `C:\Program Files\Tesseract-OCR` ao PATH do sistema
4. **Poppler para Windows** — https://github.com/oschwartz10612/poppler-windows/releases
   - Extrair para `C:\poppler`
   - Adicionar `C:\poppler\Library\bin` ao PATH do sistema

### Executar o setup

```powershell
# Abrir PowerShell como Administrador e executar:
powershell -ExecutionPolicy Bypass -File scripts/setup_ambiente.ps1
```

O script verifica o ambiente, instala dependências Node.js e Python, e cria os diretórios necessários.

---

## Estrutura do repositório

```
corpus/          — Corpus de documentos (PDFs originais e anonimizados NÃO versionados)
benchmarks/      — Scripts e resultados dos benchmarks de rasterização, pré-processamento e OCR
parser_sketch/   — Catálogo de âncoras e resultados do parser sketch
baseline/        — Baseline de regressão congelado após Gate 3
decisoes/        — Arquivos de decisão das três gates
relatorios/      — Relatórios e log de execução
scripts/         — Scripts auxiliares (validação, anonimização)
ferramentas/     — Workers de OCR e pré-processamento
temp/            — Arquivos temporários (gitignored)
```

---

## Documentação operacional

| Arquivo | Conteúdo |
|---|---|
| `.claude/CLAUDE.md` | Configuração operacional do Claude Code para Fase 0 |
| `.claude/fase0_plano_execucao.md` | Plano executável v1.0 (fonte de verdade) |
| `.claude/rules/` | Regras operacionais invioláveis |
| `.claude/gates/` | Critérios de cada gate de decisão |
| `relatorios/log_execucao.md` | Log de execução (append-only) |
| `decisoes/` | Registros de decisão aprovados pelo líder técnico |
