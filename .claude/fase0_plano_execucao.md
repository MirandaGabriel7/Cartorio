# Plano Executável — Fase 0: Validação Documental e de Pipeline

**Versão:** 1.0  
**Data:** 2026-04-15  
**Status:** Pronto para execução  
**Projeto:** CartórioDoc — Sistema de Conferência Documental Imobiliária  
**Referência:** Plano Técnico v1.3 (documento oficial de projeto)

---

## Sumário

1. [Objetivo e escopo da Fase 0](#seção-1--objetivo-e-escopo-da-fase-0)
2. [Ambiente de trabalho e estrutura de repositório](#seção-2--ambiente-de-trabalho-e-estrutura-de-repositório)
3. [Corpus: coleta, catalogação e anonimização](#seção-3--corpus-coleta-catalogação-e-anonimização)
4. [Benchmark de rasterização](#seção-4--benchmark-de-rasterização)
5. [Benchmark de pré-processamento](#seção-5--benchmark-de-pré-processamento)
6. [Benchmark de OCR](#seção-6--benchmark-de-ocr)
7. [Prototipagem do parser (parser sketch)](#seção-7--prototipagem-do-parser-parser-sketch)
8. [Baseline de regressão](#seção-8--baseline-de-regressão)
9. [Cronograma de execução](#seção-9--cronograma-de-execução)
10. [Gates de decisão e critérios de saída](#seção-10--gates-de-decisão-e-critérios-de-saída)
11. [Entregáveis obrigatórios](#seção-11--entregáveis-obrigatórios)
12. [Instruções específicas para o Claude Code](#seção-12--instruções-específicas-para-o-claude-code)

---

## SEÇÃO 1 — Objetivo e escopo da Fase 0

### 1.1. O que a Fase 0 decide

A Fase 0 não produz código de produção. Ela produz **decisões técnicas validadas com dados reais** que eliminam risco antes de qualquer investimento em implementação. As três decisões que a Fase 0 toma são:

1. **Decisão de rasterização:** qual biblioteca (mupdf ou poppler) será a primária para converter páginas PDF em imagens bitmap no Windows, com base em qualidade, performance e confiabilidade medidas sobre documentos reais de cartórios de MG.

2. **Decisão de pipeline de pré-processamento + motor OCR:** qual sequência de pré-processamento (deskew, denoising, binarização, filtragem de marcas d'água) combinada com qual motor OCR (Tesseract 5 ou PaddleOCR) atinge os limiares de CER exigidos pelo plano v1.3 sobre documentos digitalizados reais.

3. **Decisão de viabilidade de parsing:** se os campos críticos (CPF, número de matrícula, nome do transmitente) são extraíveis de forma determinística a partir do texto OCR real com taxa de acerto ≥ 85%, e qual é o catálogo de âncoras que alimentará os parsers de produção da Fase 1.

### 1.2. Decisões técnicas bloqueantes

Ao final da Fase 0, as seguintes decisões devem estar **tomadas, documentadas e aprovadas** para autorizar o início da Fase 1:

| # | Decisão | Documento de registro |
|---|---------|----------------------|
| 1 | Biblioteca de rasterização primária (mupdf ou poppler) | `decisao_rasterizacao.md` |
| 2 | Motor OCR primário + perfil de pré-processamento padrão | `decisao_motor_ocr.md` |
| 3 | Viabilidade de parsing determinístico sobre texto OCR real | `decisao_parser_sketch.md` |

### 1.3. Fora de escopo da Fase 0

Os seguintes itens estão **explicitamente excluídos** da Fase 0:

- Código de produção (qualquer código destinado a integrar o produto final)
- Integração com Electron (shell, preload bridge, IPC)
- Interface de usuário (React, componentes, telas)
- Banco de dados SQLite (schema de produção, migrações)
- Motor de regras / checklist engine
- Módulo de exportação (PDF/DOCX)
- Módulo de auditoria
- Sistema de confiança de produção
- Empacotamento e instalador
- Qualquer dependência de internet durante execução
- Qualquer uso de IA generativa

### 1.4. Autoridade de conclusão

A Fase 0 é declarada concluída pelo **líder técnico do projeto (engenheiro humano)** após verificação de que:

- Os três gates sequenciais (Seção 10) foram aprovados
- O baseline de regressão foi congelado
- Todos os entregáveis obrigatórios (Seção 11) estão presentes e válidos
- O relatório final foi revisado e assinado

O Claude Code **não tem autoridade** para declarar a Fase 0 concluída. Ele sinaliza que as condições foram atingidas e aguarda aprovação humana.

---

## SEÇÃO 2 — Ambiente de trabalho e estrutura de repositório

### 2.1. Estrutura de diretórios

```
cartoriodoc-fase0/
├── README.md                          # Instruções de setup e visão geral
├── fase0_plano_execucao.md            # Este documento
├── package.json                       # Dependências Node.js
├── package-lock.json                  # Lock de versões Node.js
├── requirements.txt                   # Dependências Python
├── tsconfig.json                      # Configuração TypeScript
├── .gitignore
│
├── corpus/
│   ├── originais/                     # PDFs originais (NÃO versionados no git)
│   │   ├── escrituras/
│   │   └── matriculas/
│   ├── anonimizados/                  # PDFs anonimizados (NÃO versionados no git)
│   │   ├── escrituras/
│   │   └── matriculas/
│   ├── corpus_catalog.json            # Catálogo master do corpus
│   └── ground_truth/                  # Arquivos de ground truth por documento
│       ├── escritura_boa_001_gt.json
│       ├── matricula_atual_001_gt.json
│       └── ...
│
├── benchmarks/
│   ├── rasterizacao/
│   │   ├── run_benchmark_rasterizacao.ts
│   │   ├── resultados_rasterizacao.json
│   │   └── amostras/                  # Imagens geradas para inspeção visual
│   ├── preprocessamento/
│   │   ├── run_benchmark_preprocessamento.ts
│   │   ├── preprocessamento_resultados.json
│   │   └── amostras/
│   ├── ocr/
│   │   ├── run_benchmark_ocr.ts
│   │   ├── ocr_resultados/
│   │   │   ├── tesseract/
│   │   │   └── paddleocr/
│   │   ├── ocr_benchmark_relatorio.json
│   │   └── cer_por_campo.json
│   └── scripts/
│       ├── calcular_cer.ts
│       ├── comparar_baseline.ts
│       └── gerar_relatorio.ts
│
├── parser_sketch/
│   ├── src/
│   │   ├── explorar_ancoras.ts
│   │   ├── parser_escritura_sketch.ts
│   │   ├── parser_matricula_sketch.ts
│   │   ├── normalizar_texto_ocr.ts
│   │   └── medir_acerto.ts
│   ├── catalogo_ancoras.json
│   └── parser_sketch_resultados.json
│
├── baseline/
│   └── fase0_baseline_v1.json
│
├── decisoes/
│   ├── decisao_rasterizacao.md
│   ├── decisao_motor_ocr.md
│   └── decisao_parser_sketch.md
│
├── relatorios/
│   ├── relatorio_variabilidade_documental.md
│   ├── relatorio_final_fase0.md
│   └── log_execucao.md
│
├── scripts/
│   ├── setup_ambiente.ps1              # Script de setup Windows
│   ├── anonimizar_documento.py
│   ├── validar_ground_truth.ts
│   └── validar_corpus_catalog.ts
│
├── ferramentas/
│   ├── ocr_workers/
│   │   ├── tesseract_worker.ts
│   │   └── paddleocr_worker.py
│   └── preprocessamento/
│       ├── preprocessar_pagina.py
│       └── detectar_marca_dagua.py
│
└── temp/                              # Arquivos temporários (gitignored)
    ├── rasterizadas/
    └── preprocessadas/
```

### 2.2. Ambiente de execução

| Componente | Versão | Justificativa |
|---|---|---|
| Sistema operacional | Windows 10/11 64-bit | Plataforma alvo do produto; benchmarks devem refletir o ambiente real |
| Node.js | 20 LTS (≥ 20.11.0) | LTS atual; compatível com Electron 29+; suporte a worker_threads estável |
| Python | 3.11.x | Necessário para PaddleOCR e scripts de pré-processamento com OpenCV |
| TypeScript | 5.4.x | Linguagem primária dos scripts de benchmark e parser sketch |
| npm | ≥ 10.0.0 | Vem com Node.js 20 LTS |
| Git | ≥ 2.40 | Controle de versão |

### 2.3. Dependências Node.js

```json
{
  "name": "cartoriodoc-fase0",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "build": "tsc",
    "benchmark:rasterizacao": "ts-node benchmarks/rasterizacao/run_benchmark_rasterizacao.ts",
    "benchmark:preprocessamento": "ts-node benchmarks/preprocessamento/run_benchmark_preprocessamento.ts",
    "benchmark:ocr": "ts-node benchmarks/ocr/run_benchmark_ocr.ts",
    "parser:sketch": "ts-node parser_sketch/src/medir_acerto.ts",
    "validar:corpus": "ts-node scripts/validar_corpus_catalog.ts",
    "validar:gt": "ts-node scripts/validar_ground_truth.ts",
    "baseline:gerar": "ts-node benchmarks/scripts/gerar_relatorio.ts",
    "baseline:comparar": "ts-node benchmarks/scripts/comparar_baseline.ts"
  },
  "dependencies": {
    "mupdf": "^0.4.0",
    "node-tesseract-ocr": "^2.2.1",
    "sharp": "^0.33.2",
    "fastest-levenshtein": "^1.0.16",
    "ajv": "^8.12.0",
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "ts-node": "^10.9.2",
    "@types/node": "^20.11.0",
    "@types/uuid": "^9.0.7"
  }
}
```

Comando de instalação:

```bash
npm install
```

### 2.4. Dependências Python

Arquivo `requirements.txt`:

```
opencv-python-headless==4.9.0.80
numpy==1.26.4
Pillow==10.2.0
paddlepaddle==2.6.1
paddleocr==2.7.3
```

Comando de instalação:

```bash
pip install -r requirements.txt
```

### 2.5. Dependências de sistema (Windows)

**Tesseract 5:**

1. Baixar o instalador oficial do Tesseract 5 para Windows 64-bit em: `https://github.com/UB-Mannheim/tesseract/wiki`
2. Instalar em `C:\Program Files\Tesseract-OCR`
3. Durante a instalação, selecionar o componente "Additional language data (download)" e marcar "Portuguese"
4. Após instalar, baixar manualmente o modelo `tessdata_best` para português:
   - Arquivo: `por.traineddata` do repositório `tessdata_best`
   - URL: `https://github.com/tesseract-ocr/tessdata_best/raw/main/por.traineddata`
   - Copiar para `C:\Program Files\Tesseract-OCR\tessdata\` (substituindo o `por.traineddata` padrão)
5. Adicionar `C:\Program Files\Tesseract-OCR` ao PATH do sistema

Verificação:

```bash
tesseract --version
# Deve retornar: tesseract 5.x.x
```

**Poppler (fallback de rasterização):**

1. Baixar binários pré-compilados para Windows: `https://github.com/oschwartz10612/poppler-windows/releases`
2. Extrair para `C:\poppler`
3. Adicionar `C:\poppler\Library\bin` ao PATH do sistema

Verificação:

```bash
pdftoppm -v
# Deve retornar: pdftoppm version X.XX.X
```

### 2.6. Setup do zero em máquina limpa Windows

Script `scripts/setup_ambiente.ps1`:

```powershell
# setup_ambiente.ps1 — Setup completo do ambiente da Fase 0
# Executar como Administrador no PowerShell

Write-Host "=== CartórioDoc Fase 0 — Setup do Ambiente ===" -ForegroundColor Cyan

# 1. Verificar Node.js
$nodeVersion = node --version 2>$null
if (-not $nodeVersion -or -not $nodeVersion.StartsWith("v20")) {
    Write-Host "ERRO: Node.js 20 LTS não encontrado. Instale de https://nodejs.org/" -ForegroundColor Red
    exit 1
}
Write-Host "Node.js: $nodeVersion" -ForegroundColor Green

# 2. Verificar Python
$pythonVersion = python --version 2>$null
if (-not $pythonVersion -or -not $pythonVersion.Contains("3.11")) {
    Write-Host "ERRO: Python 3.11.x não encontrado. Instale de https://www.python.org/" -ForegroundColor Red
    exit 1
}
Write-Host "Python: $pythonVersion" -ForegroundColor Green

# 3. Verificar Tesseract
$tessVersion = tesseract --version 2>$null
if (-not $tessVersion) {
    Write-Host "ERRO: Tesseract 5 não encontrado no PATH." -ForegroundColor Red
    exit 1
}
Write-Host "Tesseract: instalado" -ForegroundColor Green

# 4. Verificar modelo tessdata_best para português
$tessdata = "C:\Program Files\Tesseract-OCR\tessdata\por.traineddata"
if (-not (Test-Path $tessdata)) {
    Write-Host "ERRO: Modelo por.traineddata não encontrado em tessdata." -ForegroundColor Red
    exit 1
}
Write-Host "Modelo português tessdata_best: presente" -ForegroundColor Green

# 5. Instalar dependências Node.js
Write-Host "Instalando dependências Node.js..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: npm install falhou." -ForegroundColor Red
    exit 1
}
Write-Host "Dependências Node.js instaladas." -ForegroundColor Green

# 6. Instalar dependências Python
Write-Host "Instalando dependências Python..." -ForegroundColor Yellow
pip install -r requirements.txt
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: pip install falhou." -ForegroundColor Red
    exit 1
}
Write-Host "Dependências Python instaladas." -ForegroundColor Green

# 7. Compilar TypeScript
Write-Host "Compilando TypeScript..." -ForegroundColor Yellow
npx tsc --noEmit
if ($LASTEXITCODE -ne 0) {
    Write-Host "AVISO: Erros de compilação TypeScript. Verifique tsconfig.json." -ForegroundColor Yellow
}

# 8. Criar diretórios de trabalho
$dirs = @(
    "corpus/originais/escrituras",
    "corpus/originais/matriculas",
    "corpus/anonimizados/escrituras",
    "corpus/anonimizados/matriculas",
    "corpus/ground_truth",
    "benchmarks/rasterizacao/amostras",
    "benchmarks/preprocessamento/amostras",
    "benchmarks/ocr/ocr_resultados/tesseract",
    "benchmarks/ocr/ocr_resultados/paddleocr",
    "baseline",
    "decisoes",
    "relatorios",
    "temp/rasterizadas",
    "temp/preprocessadas"
)
foreach ($dir in $dirs) {
    New-Item -ItemType Directory -Path $dir -Force | Out-Null
}
Write-Host "Diretórios criados." -ForegroundColor Green

Write-Host ""
Write-Host "=== Setup concluído com sucesso ===" -ForegroundColor Cyan
Write-Host "Próximo passo: coletar documentos do corpus e colocar em corpus/originais/" -ForegroundColor White
```

### 2.7. Configuração TypeScript

Arquivo `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": ".",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "declaration": false,
    "sourceMap": true
  },
  "include": [
    "benchmarks/**/*.ts",
    "parser_sketch/**/*.ts",
    "scripts/**/*.ts"
  ],
  "exclude": ["node_modules", "dist", "temp"]
}
```

---

## SEÇÃO 3 — Corpus: coleta, catalogação e anonimização

### 3.1. Lista de documentos a coletar

| ID | Categoria | Qtd mín. | Critério de classificação | Responsável |
|---|---|---|---|---|
| MAT-ATUAL-BOA | Matrículas formato atual (proporcional), digitalização boa qualidade | 20 | Resolução efetiva ≥ 250 DPI; texto legível sem esforço a olho nu; sem carimbos sobre texto crítico; contraste uniforme | Cartório-alvo (oficial ou preposto) |
| MAT-ATUAL-DEG | Matrículas formato atual, digitalização degradada ou com carimbos | 15 | Resolução efetiva < 250 DPI, OU presença de carimbo sobreposto a texto, OU contraste irregular, OU ruído visível de compressão JPEG | Cartório-alvo |
| MAT-MONO | Matrículas formato antigo monoespaçado (pré-2010) | 10 | Texto em fonte fixa (typewriter); espaçamento entre caracteres uniforme e largo; layout tabulado | Cartório-alvo |
| MAT-ONUS | Matrículas com ônus (hipoteca, penhora, usufruto, servidão) | 10 | Presença de pelo menos um registro de ônus (R. ou AV. com tipo classificável como ônus) | Cartório-alvo |
| MAT-RURAL | Matrículas rurais | 5 | Presença de referência a INCRA, CCIR, CAR ou área em hectares/alqueires | Cartório-alvo |
| MAT-TRANSP | Matrículas com transporte de ficha | 5 | Presença do marcador "TRANSPORTE DA FICHA Nº" | Cartório-alvo |
| ESC-NATIVA | Escrituras de compra e venda — nativamente digitais | 5 | PDF com camada de texto extraível via pdf-parse; texto selecionável no leitor de PDF | Cartório-alvo ou tabelionatos parceiros |
| ESC-BOA | Escrituras digitalizadas — boa qualidade | 15 | Resolução efetiva ≥ 250 DPI; texto legível sem esforço; sem carimbos sobre campos críticos | Cartório-alvo |
| ESC-DEG | Escrituras digitalizadas — qualidade degradada | 15 | Resolução < 250 DPI, OU ruído moderado, OU contraste irregular, OU compressão visível | Cartório-alvo |
| ESC-BAIXA | Escrituras digitalizadas — baixa qualidade | 10 | Carimbos sobrepostos a texto de campos críticos, OU contraste ruim (texto claro em fundo claro), OU digitalização torta (skew > 3°) | Cartório-alvo |
| ESC-MULTI | Escrituras com múltiplos transmitentes | 10 | ≥ 2 transmitentes identificáveis no documento | Cartório-alvo |
| ESC-PJ | Escrituras com transmitente PJ | 5 | Presença de CNPJ e razão social no bloco de transmitente | Cartório-alvo |
| ESC-ROGO | Escrituras com partes analfabetas (assinatura a rogo) | 5 | Presença de expressão "a rogo" ou "por não saber ler nem escrever" | Cartório-alvo |
| ESC-MARCA | Escrituras com marcas d'água laterais do Estado de MG | 10 | Presença visível de faixa lateral com brasão/texto "ESTADO DE MINAS GERAIS" ou marca diagonal ("PARA SIMPLES CONSULTA") | Cartório-alvo |
| ESC-PRENOT | Escrituras com carimbo de prenotação cancelada | 5 | Presença de carimbo de prenotação com indicação de cancelamento | Cartório-alvo |

**Total mínimo: 145 documentos.**

**Critério objetivo para classificar "degradada" vs "boa qualidade":**

- **Boa qualidade:** o documento, quando aberto em leitor de PDF a 100% de zoom, permite leitura de CPFs e nomes sem necessidade de zoom adicional. Não há carimbos sobrepostos a campos de qualificação das partes. O fundo é uniforme (branco ou off-white sem manchas).
- **Degradada:** ao menos uma das seguintes condições: (a) necessidade de zoom > 150% para leitura de texto, (b) presença de carimbo sobre campo de qualificação, (c) fundo irregular com manchas ou sombras, (d) artefatos de compressão JPEG visíveis como blocagem em texto.
- **Baixa qualidade:** ao menos duas das condições de "degradada" simultaneamente, OU texto parcialmente ilegível a olho nu mesmo com zoom máximo.

### 3.2. Processo de anonimização

#### 3.2.1. Campos a substituir

| Campo | Método de substituição | Formato do placeholder |
|---|---|---|
| CPF | Gerar CPF sintético válido (dígitos verificadores corretos) com mesma quantidade de dígitos | `XXX.XXX.XXX-XX` onde X são dígitos do CPF sintético |
| CNPJ | Gerar CNPJ sintético válido | `XX.XXX.XXX/XXXX-XX` sintético |
| Nome de pessoa física | Substituir por nome fictício do mesmo gênero e tamanho similar | Nome gerado de lista de nomes comuns brasileiros |
| Nome de pessoa jurídica | Substituir por razão social fictícia | "EMPRESA [LETRA][NÚMERO] LTDA" (ex: "EMPRESA A1 LTDA") |
| Endereço completo | Substituir por endereço fictício na mesma cidade | Logradouro fictício + número aleatório + bairro fictício |
| Número de matrícula | Substituir por número sequencial fictício | `[PREFIXO]-[NÚMERO_SEQ]` (ex: "ANON-00001") |
| Valor monetário | Manter a ordem de grandeza, alterar os dígitos | Multiplicar por fator aleatório entre 0.8 e 1.2 |
| Número de protocolo | Substituir por sequencial fictício | `PROT-ANON-[NÚMERO_SEQ]` |
| Data de nascimento | Manter o ano, alterar dia e mês aleatoriamente | Mesmo formato, data fictícia |
| RG / Carteira de identidade | Substituir por número aleatório com mesmo formato | Dígitos aleatórios, mesma quantidade |

#### 3.2.2. Método de anonimização

A anonimização é feita **sobre o PDF digitalizado**, não sobre texto extraído. O método:

1. Para cada documento, um anotador humano abre o PDF original e identifica visualmente os campos sensíveis listados acima.
2. O anotador registra as coordenadas (página, posição aproximada) e o valor original de cada campo sensível em uma planilha de controle (`anonimizacao_controle.csv`).
3. O script `scripts/anonimizar_documento.py` recebe o PDF e a planilha de controle, e aplica retângulos opacos (pretos) sobre as regiões dos campos sensíveis no PDF, sobrepondo texto com o placeholder correspondente usando fonte monoespaçada.
4. O PDF anonimizado é salvo em `corpus/anonimizados/`.

**Implementação do script de anonimização (`scripts/anonimizar_documento.py`):**

```python
"""
anonimizar_documento.py
Aplica retângulos opacos sobre campos sensíveis e sobrepõe placeholders.
Usa PyMuPDF (fitz) para manipulação de PDF.

Entrada: PDF original + CSV de controle com colunas:
  pagina, x0, y0, x1, y1, campo, valor_original, valor_placeholder

Saída: PDF anonimizado em corpus/anonimizados/
"""
import fitz  # PyMuPDF
import csv
import sys
from pathlib import Path

def anonimizar(pdf_path: str, controle_csv: str, output_path: str):
    doc = fitz.open(pdf_path)
    with open(controle_csv, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            pagina = int(row['pagina']) - 1  # 0-indexed
            rect = fitz.Rect(
                float(row['x0']), float(row['y0']),
                float(row['x1']), float(row['y1'])
            )
            page = doc[pagina]
            # Cobrir com retângulo branco
            page.draw_rect(rect, color=(1, 1, 1), fill=(1, 1, 1))
            # Inserir placeholder
            page.insert_text(
                fitz.Point(float(row['x0']) + 2, float(row['y1']) - 2),
                row['valor_placeholder'],
                fontsize=8,
                fontname="Courier"
            )
    doc.save(output_path)
    doc.close()

if __name__ == '__main__':
    anonimizar(sys.argv[1], sys.argv[2], sys.argv[3])
```

**Dependência adicional para anonimização (adicionar ao `requirements.txt`):**

```
PyMuPDF==1.23.26
```

#### 3.2.3. Verificação da anonimização

Após anonimização de cada documento:

1. Um segundo anotador (diferente do que identificou os campos) abre o PDF anonimizado e verifica que nenhum dado pessoal real é legível.
2. O verificador executa OCR completo (Tesseract) sobre o documento anonimizado e busca no texto extraído por:
   - Padrões de CPF (11 dígitos consecutivos que não correspondam ao placeholder)
   - Nomes que constem na lista original (se houver acesso)
3. O resultado da verificação é registrado no catálogo do corpus (`corpus_catalog.json`) no campo `anonimizacao_verificada`.

**Quem executa:** anotador humano designado pelo cartório.  
**Quem valida:** segundo anotador humano + verificação automatizada por OCR.

### 3.3. Catalogação e nomenclatura

#### 3.3.1. Convenção de nomenclatura

Formato: `{tipo}_{qualidade}_{sequencial:3}.pdf`

Onde:

- `tipo`: `escritura` ou `matricula`
- `qualidade`: conforme tabela:

| Código de qualidade | Significado |
|---|---|
| `boa` | Boa qualidade de digitalização |
| `degradada` | Qualidade degradada |
| `baixa` | Baixa qualidade |
| `nativa` | PDF com texto nativo |
| `mono` | Matrícula em formato monoespaçado |
| `onus` | Matrícula com ônus registrados |
| `rural` | Matrícula rural |
| `transporte` | Matrícula com transporte de ficha |
| `multi` | Escritura com múltiplos transmitentes |
| `pj` | Escritura com transmitente PJ |
| `rogo` | Escritura com assinatura a rogo |
| `marca` | Escritura com marcas d'água |
| `prenot` | Escritura com prenotação cancelada |

Exemplos:

```
escritura_boa_001.pdf
escritura_degradada_012.pdf
matricula_mono_003.pdf
matricula_onus_007.pdf
escritura_marca_005.pdf
```

Documentos que se enquadram em mais de uma categoria usam a categoria **mais específica** (ex: uma matrícula rural com ônus é classificada como `matricula_rural` se a ruralidade é o traço mais relevante para o benchmark).

#### 3.3.2. Schema do catálogo master (`corpus_catalog.json`)

```json
{
  "$schema": "corpus_catalog_schema",
  "versao": "1.0",
  "data_criacao": "2026-04-20",
  "total_documentos": 145,
  "documentos": [
    {
      "documento_id": "escritura_boa_001",
      "arquivo": "corpus/anonimizados/escrituras/escritura_boa_001.pdf",
      "tipo_documento": "ESCRITURA_COMPRA_VENDA",
      "categoria_corpus": "ESC-BOA",
      "classificacao_qualidade": "BOA",
      "total_paginas": 8,
      "tem_texto_nativo": false,
      "marcas_dagua_presentes": false,
      "tipo_marca_dagua": null,
      "rodapes_sistema_presentes": false,
      "formato_matricula": null,
      "tem_onus": false,
      "tipos_onus": [],
      "tem_transporte_ficha": false,
      "total_transmitentes": 1,
      "transmitente_pj": false,
      "assinatura_rogo": false,
      "urbano_ou_rural": "URBANO",
      "municipio_origem": "Ibirité",
      "anonimizacao_verificada": true,
      "data_coleta": "2026-04-21",
      "coletado_por": "cartorio_alvo",
      "ground_truth_disponivel": true,
      "ground_truth_arquivo": "corpus/ground_truth/escritura_boa_001_gt.json",
      "observacoes": ""
    }
  ]
}
```

### 3.4. Ground truth

#### 3.4.1. Schema JSON completo do arquivo de ground truth

```json
{
  "$schema": "ground_truth_schema",
  "documento_id": "escritura_boa_001",
  "tipo": "ESCRITURA_COMPRA_VENDA",
  "classificacao_qualidade": "BOA",
  "total_paginas": 8,
  "anotador_primario": "anotador_1",
  "anotador_secundario": "anotador_2",
  "data_anotacao_primaria": "2026-04-25",
  "data_anotacao_secundaria": "2026-04-26",
  "discordancias_resolvidas": false,
  "resolucao_discordancias": null,

  "campos": {
    "tipo_titulo": {
      "valor": "ESCRITURA_PUBLICA",
      "pagina": 1,
      "obrigatorio": true
    },
    "protocolo": {
      "valor": "PROT-ANON-00001",
      "pagina": 1,
      "obrigatorio": false
    },
    "numero_livro": {
      "valor": "450",
      "pagina": 1,
      "obrigatorio": true
    },
    "numero_folhas": {
      "valor": "123",
      "pagina": 1,
      "obrigatorio": true
    },
    "data_lavratura": {
      "valor": "2025-03-15",
      "pagina": 1,
      "obrigatorio": true
    },
    "tabeliao_nome": {
      "valor": "NOME ANONIMIZADO DO TABELIAO",
      "pagina": 1,
      "obrigatorio": true
    },
    "municipio_tabelionato": {
      "valor": "Ibirité",
      "pagina": 1,
      "obrigatorio": true
    },
    "uf_tabelionato": {
      "valor": "MG",
      "pagina": 1,
      "obrigatorio": true
    },
    "selo_digital": {
      "valor": "AAAA-BBBB-CCCC-DDDD",
      "pagina": 8,
      "obrigatorio": false
    },
    "codigo_seguranca": {
      "valor": "1234567890",
      "pagina": 8,
      "obrigatorio": false
    },
    "hash_codigo": {
      "valor": "ABCDEF1234567890",
      "pagina": 8,
      "obrigatorio": false
    },

    "transmitente_1_nome": {
      "valor": "NOME ANONIMIZADO TRANSMITENTE 1",
      "pagina": 1,
      "obrigatorio": true
    },
    "transmitente_1_cpf": {
      "valor": "12345678901",
      "pagina": 1,
      "obrigatorio": true
    },
    "transmitente_1_tipo_pessoa": {
      "valor": "PF",
      "pagina": 1,
      "obrigatorio": true
    },
    "transmitente_1_estado_civil": {
      "valor": "CASADO",
      "pagina": 1,
      "obrigatorio": true
    },
    "transmitente_1_regime_bens": {
      "valor": "COMUNHAO_PARCIAL",
      "pagina": 1,
      "obrigatorio": true
    },
    "transmitente_1_profissao": {
      "valor": "COMERCIANTE",
      "pagina": 1,
      "obrigatorio": true
    },
    "transmitente_1_nacionalidade": {
      "valor": "BRASILEIRA",
      "pagina": 1,
      "obrigatorio": true
    },
    "transmitente_1_endereco": {
      "valor": "RUA ANONIMIZADA 123 BAIRRO CENTRO IBIRITE MG",
      "pagina": 1,
      "obrigatorio": true
    },
    "transmitente_1_uniao_estavel_declarada": {
      "valor": "false",
      "pagina": 1,
      "obrigatorio": false
    },
    "transmitente_1_companheiro_anuente": {
      "valor": "true",
      "pagina": 2,
      "obrigatorio": false
    },
    "transmitente_1_pacto_antenupcial_mencionado": {
      "valor": "false",
      "pagina": null,
      "obrigatorio": false
    },
    "transmitente_1_assinatura_rogo": {
      "valor": "false",
      "pagina": null,
      "obrigatorio": false
    },
    "transmitente_1_rogatario_nome": {
      "valor": null,
      "pagina": null,
      "obrigatorio": false
    },

    "adquirente_1_nome": {
      "valor": "NOME ANONIMIZADO ADQUIRENTE 1",
      "pagina": 2,
      "obrigatorio": true
    },
    "adquirente_1_cpf": {
      "valor": "98765432101",
      "pagina": 2,
      "obrigatorio": true
    },
    "adquirente_1_tipo_pessoa": {
      "valor": "PF",
      "pagina": 2,
      "obrigatorio": true
    },
    "adquirente_1_estado_civil": {
      "valor": "SOLTEIRO",
      "pagina": 2,
      "obrigatorio": true
    },
    "adquirente_1_profissao": {
      "valor": "ENGENHEIRO",
      "pagina": 2,
      "obrigatorio": true
    },
    "adquirente_1_nacionalidade": {
      "valor": "BRASILEIRA",
      "pagina": 2,
      "obrigatorio": true
    },
    "adquirente_1_endereco": {
      "valor": "AVENIDA ANONIMIZADA 456 BAIRRO NOVO IBIRITE MG",
      "pagina": 2,
      "obrigatorio": true
    },

    "matricula": {
      "valor": "ANON-00001",
      "pagina": 3,
      "obrigatorio": true
    },
    "descricao_imovel": {
      "valor": "UM LOTE DE TERRENO SITUADO NO BAIRRO ANONIMIZADO...",
      "pagina": 3,
      "obrigatorio": true
    },
    "tipo_imovel": {
      "valor": "LOTE",
      "pagina": 3,
      "obrigatorio": true
    },
    "urbano_ou_rural": {
      "valor": "URBANO",
      "pagina": 3,
      "obrigatorio": true
    },
    "inscricao_imobiliaria": {
      "valor": "01.02.003.0004.00005",
      "pagina": 3,
      "obrigatorio": false
    },
    "area": {
      "valor": "360.00",
      "pagina": 3,
      "obrigatorio": true
    },
    "unidade_area": {
      "valor": "m2",
      "pagina": 3,
      "obrigatorio": true
    },
    "fracao_ideal": {
      "valor": null,
      "pagina": null,
      "obrigatorio": false
    },
    "logradouro": {
      "valor": "RUA ANONIMIZADA",
      "pagina": 3,
      "obrigatorio": false
    },
    "numero": {
      "valor": "123",
      "pagina": 3,
      "obrigatorio": false
    },
    "bairro": {
      "valor": "BAIRRO ANONIMIZADO",
      "pagina": 3,
      "obrigatorio": false
    },
    "municipio": {
      "valor": "IBIRITE",
      "pagina": 3,
      "obrigatorio": true
    },

    "alienacao_total_ou_parcial": {
      "valor": "TOTAL",
      "pagina": 4,
      "obrigatorio": true
    },
    "fracao_alienada": {
      "valor": null,
      "pagina": null,
      "obrigatorio": false
    },
    "valor_partes": {
      "valor": "90000000",
      "pagina": 4,
      "obrigatorio": true
    },
    "valor_avaliacao_prefeitura": {
      "valor": null,
      "pagina": null,
      "obrigatorio": false
    },

    "onus_mencionados": {
      "valor": "[]",
      "pagina": null,
      "obrigatorio": false
    },
    "clausula_resolutiva": {
      "valor": "false",
      "pagina": null,
      "obrigatorio": false
    },
    "retrovenda": {
      "valor": "false",
      "pagina": null,
      "obrigatorio": false
    },
    "certidao_acoes_reais_apresentada": {
      "valor": "true",
      "pagina": 6,
      "obrigatorio": true
    },
    "declaracao_onus_transmitente": {
      "valor": "true",
      "pagina": 6,
      "obrigatorio": true
    },
    "certidao_debitos_municipais_apresentada": {
      "valor": "true",
      "pagina": 6,
      "obrigatorio": false
    },
    "dispensa_debitos_municipais": {
      "valor": "false",
      "pagina": null,
      "obrigatorio": false
    },
    "quitacao_condominio_apresentada": {
      "valor": null,
      "pagina": null,
      "obrigatorio": false
    },
    "declaracao_sem_divida_condominio": {
      "valor": null,
      "pagina": null,
      "obrigatorio": false
    },
    "itbi_mencionado": {
      "valor": "true",
      "pagina": 5,
      "obrigatorio": true
    },
    "doi_emitida_mencionada": {
      "valor": "true",
      "pagina": 7,
      "obrigatorio": true
    },
    "certidao_federal_inss_pf": {
      "valor": "true",
      "pagina": 6,
      "obrigatorio": false
    },
    "certidao_federal_inss_pj": {
      "valor": null,
      "pagina": null,
      "obrigatorio": false
    },
    "declaracao_nao_empregador": {
      "valor": "false",
      "pagina": null,
      "obrigatorio": false
    }
  },

  "texto_completo_por_pagina": {
    "1": "Texto completo transcrito manualmente da página 1...",
    "2": "Texto completo transcrito manualmente da página 2..."
  },

  "checklist_gabarito": {
    "1": "NAO_SE_APLICA",
    "2": "SIM",
    "3": "SIM",
    "4": "SIM",
    "5": "SIM",
    "6": "SIM",
    "7": "SIM",
    "8": "SIM",
    "9": "SIM",
    "10": "SIM",
    "11": "NAO_SE_APLICA",
    "12": "SIM",
    "13": "SIM",
    "14": "REVISAO_OBRIGATORIA",
    "15": "SIM",
    "16": "SIM",
    "17": "SIM",
    "18": "NAO_SE_APLICA",
    "19": "SIM",
    "20": "NAO_SE_APLICA",
    "21": "NAO",
    "22": "SIM",
    "23": "SIM",
    "24": "SIM",
    "25": "SIM",
    "26": "SIM",
    "27": "NAO_SE_APLICA",
    "28": "SIM",
    "29": "SIM",
    "30": "NAO_SE_APLICA",
    "31": "NAO_SE_APLICA",
    "32": "NAO_SE_APLICA",
    "33": "SIM",
    "34": "MANUAL"
  }
}
```

#### 3.4.2. Lista completa de campos a anotar

**Para escritura pública de compra e venda:**

Metadados formais: `tipo_titulo`, `protocolo`, `numero_livro`, `numero_folhas`, `data_lavratura`, `tabeliao_nome`, `municipio_tabelionato`, `uf_tabelionato`, `selo_digital`, `codigo_seguranca`, `hash_codigo`.

Por transmitente (N indexado): `transmitente_N_nome`, `transmitente_N_cpf`, `transmitente_N_tipo_pessoa`, `transmitente_N_estado_civil`, `transmitente_N_regime_bens`, `transmitente_N_profissao`, `transmitente_N_nacionalidade`, `transmitente_N_endereco`, `transmitente_N_uniao_estavel_declarada`, `transmitente_N_companheiro_anuente`, `transmitente_N_pacto_antenupcial_mencionado`, `transmitente_N_assinatura_rogo`, `transmitente_N_rogatario_nome`.

Transmitente PJ (adicional): `transmitente_N_razao_social`, `transmitente_N_cnpj`, `transmitente_N_representante_nome`, `transmitente_N_representante_cpf`, `transmitente_N_tipo_representacao`.

Por adquirente (N indexado): `adquirente_N_nome`, `adquirente_N_cpf`, `adquirente_N_tipo_pessoa`, `adquirente_N_estado_civil`, `adquirente_N_profissao`, `adquirente_N_nacionalidade`, `adquirente_N_endereco`.

Imóvel: `matricula`, `descricao_imovel`, `tipo_imovel`, `urbano_ou_rural`, `inscricao_imobiliaria`, `area`, `unidade_area`, `fracao_ideal`, `logradouro`, `numero`, `bairro`, `municipio`.

Dados negociais: `alienacao_total_ou_parcial`, `fracao_alienada`, `valor_partes`, `valor_avaliacao_prefeitura`.

Menções jurídicas: `onus_mencionados`, `clausula_resolutiva`, `retrovenda`, `certidao_acoes_reais_apresentada`, `declaracao_onus_transmitente`, `certidao_debitos_municipais_apresentada`, `dispensa_debitos_municipais`, `quitacao_condominio_apresentada`, `declaracao_sem_divida_condominio`, `itbi_mencionado`, `doi_emitida_mencionada`, `certidao_federal_inss_pf`, `certidao_federal_inss_pj`, `declaracao_nao_empregador`.

**Para matrícula de imóvel:**

Identificação: `matricula_numero`, `cartorio_nome`, `cartorio_municipio`, `formato_matricula`.

Por proprietário atual (N indexado): `proprietario_N_nome`, `proprietario_N_cpf_cnpj`, `proprietario_N_estado_civil`, `proprietario_N_regime_bens`, `proprietario_N_tipo_pessoa`, `proprietario_N_fracao_propriedade`.

Imóvel: `descricao_imovel`, `tipo_imovel`, `urbano_ou_rural`, `inscricao_imobiliaria`, `area`, `unidade_area`, `fracao_ideal`, `logradouro`, `numero`, `bairro`, `municipio`.

Ruralidade: `cadastro_incra`, `itr_ultimos_5_anos_quitados`, `car_averbado`.

Estrutura registral: `matricula_mae`, `incorporacao_registrada`, `data_validade_incorporacao`, `transporte_ficha`, `fichas_total`.

Por ônus (N indexado): `onus_N_tipo`, `onus_N_impeditivo_ou_nao`, `onus_N_beneficiario`, `onus_N_registro_referencia`, `onus_N_data_constituicao`.

Averbações: `averbacoes` (array de tipo, data, referência), `construcoes_averbadas`, `patrimonio_afetacao`.

#### 3.4.3. Processo de resolução de discordância

1. Cada documento do corpus de calibração (primeiros 30 documentos) é anotado independentemente por 2 anotadores.
2. Após ambas as anotações, um script de comparação (`scripts/validar_ground_truth.ts`) identifica discordâncias campo a campo.
3. Para cada discordância:
   - Se o valor de um anotador é claramente um erro de transcrição (typo), o outro valor prevalece sem reunião.
   - Se a discordância é de interpretação (ex: qual é o estado civil se o texto é ambíguo), os dois anotadores se reúnem e chegam a consenso. Se não houver consenso, um terceiro anotador (conferente registral sênior) decide.
4. A resolução é registrada no campo `resolucao_discordancias` do ground truth com texto explicativo.
5. Para o corpus de regressão (documentos 31 em diante), 1 anotador anota e 20% dos documentos são revisados por um segundo anotador como controle de qualidade.

#### 3.4.4. Verificação de integridade dos arquivos de ground truth

O script `scripts/validar_ground_truth.ts` verifica:

1. **Validação de schema:** o arquivo JSON obedece ao schema definido (usando `ajv` para JSON Schema validation).
2. **Campos obrigatórios presentes:** todos os campos marcados como `obrigatorio: true` no schema têm valor não-nulo.
3. **Tipos de dados corretos:** CPFs têm 11 dígitos, CNPJs têm 14 dígitos, datas estão em formato ISO 8601, valores monetários são inteiros (centavos).
4. **Consistência interna:** `documento_id` no ground truth corresponde a um documento no `corpus_catalog.json`.
5. **Checklist gabarito completo:** todos os 34 itens do checklist têm um valor atribuído.
6. **Texto por página presente:** ao menos as páginas que contêm campos obrigatórios têm transcrição em `texto_completo_por_pagina`.

Comando:

```bash
npm run validar:gt
```

Saída: relatório em `relatorios/validacao_ground_truth.json` listando erros por documento.

---

## SEÇÃO 4 — Benchmark de rasterização

### 4.1. Objetivo

Decidir entre `mupdf` e `poppler` como biblioteca primária de rasterização de PDF para imagem no Windows, com base em qualidade, performance e confiabilidade medidas sobre documentos reais.

### 4.2. Instalação no Windows

**mupdf para Node.js:**

```bash
npm install mupdf
```

O pacote `mupdf` no npm é o binding oficial JavaScript/WASM do MuPDF. Não requer compilação nativa nem dependências de sistema adicionais no Windows — o binário WASM é incluído no pacote.

**poppler para Node.js:**

Poppler não tem binding nativo direto para Node.js. A integração é feita via `child_process.execFile` chamando o binário `pdftoppm` (instalado conforme Seção 2.5).

```typescript
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

async function rasterizarComPoppler(
  pdfPath: string, outputPrefix: string, dpi: number
): Promise<void> {
  await execFileAsync('pdftoppm', [
    '-png', '-r', String(dpi), pdfPath, outputPrefix
  ]);
}
```

### 4.3. Script de benchmark

Arquivo: `benchmarks/rasterizacao/run_benchmark_rasterizacao.ts`

```typescript
import * as mupdf from 'mupdf';
import { execFile } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import { performance } from 'perf_hooks';

const execFileAsync = promisify(execFile);

interface RasterBenchmarkResult {
  documento_id: string;
  pagina: number;
  biblioteca: 'mupdf' | 'poppler';
  dpi: number;
  tempo_ms: number;
  tamanho_bytes: number;
  largura_px: number;
  altura_px: number;
  erro: string | null;
}

async function rasterizarMupdf(
  pdfPath: string, pagina: number, dpi: number, outputPath: string
): Promise<{ tempo_ms: number; largura: number; altura: number }> {
  const start = performance.now();
  const data = fs.readFileSync(pdfPath);
  const doc = mupdf.Document.openDocument(data, 'application/pdf');
  const page = doc.loadPage(pagina);
  const scale = dpi / 72;
  const pixmap = page.toPixmap(
    mupdf.Matrix.scale(scale, scale),
    mupdf.ColorSpace.DeviceRGB
  );
  const pngBuffer = pixmap.asPNG();
  fs.writeFileSync(outputPath, pngBuffer);
  const tempo = performance.now() - start;
  return { tempo_ms: tempo, largura: pixmap.getWidth(), altura: pixmap.getHeight() };
}

async function rasterizarPoppler(
  pdfPath: string, pagina: number, dpi: number, outputDir: string
): Promise<{ tempo_ms: number; largura: number; altura: number }> {
  const start = performance.now();
  const prefix = path.join(outputDir, `poppler_p${pagina}`);
  await execFileAsync('pdftoppm', [
    '-png', '-r', String(dpi),
    '-f', String(pagina + 1), '-l', String(pagina + 1),
    pdfPath, prefix
  ]);
  const tempo = performance.now() - start;
  // Ler a imagem gerada para obter dimensões
  const sharp = require('sharp');
  const files = fs.readdirSync(outputDir)
    .filter(f => f.startsWith(`poppler_p${pagina}`));
  const imgPath = path.join(outputDir, files[0]);
  const meta = await sharp(imgPath).metadata();
  return { tempo_ms: tempo, largura: meta.width!, altura: meta.height! };
}

async function main() {
  const catalog = JSON.parse(
    fs.readFileSync('corpus/corpus_catalog.json', 'utf-8')
  );

  // Selecionar amostra de 20 documentos representativos:
  // 5 escrituras boa, 5 escrituras degradadas, 5 matrículas atuais,
  // 3 matrículas monoespaçadas, 2 escrituras com marca d'água
  const amostra = selecionarAmostraRepresentativa(catalog.documentos, 20);
  const resultados: RasterBenchmarkResult[] = [];
  const dpis = [300, 400];

  for (const doc of amostra) {
    for (const dpi of dpis) {
      // Rasterizar página 0 (primeira página) de cada documento
      for (const pagina of [0]) {
        // mupdf
        try {
          const outputMupdf = `benchmarks/rasterizacao/amostras/${doc.documento_id}_mupdf_${dpi}dpi_p${pagina}.png`;
          const resMupdf = await rasterizarMupdf(doc.arquivo, pagina, dpi, outputMupdf);
          const stat = fs.statSync(outputMupdf);
          resultados.push({
            documento_id: doc.documento_id, pagina, biblioteca: 'mupdf', dpi,
            tempo_ms: resMupdf.tempo_ms, tamanho_bytes: stat.size,
            largura_px: resMupdf.largura, altura_px: resMupdf.altura, erro: null
          });
        } catch (e: any) {
          resultados.push({
            documento_id: doc.documento_id, pagina, biblioteca: 'mupdf', dpi,
            tempo_ms: 0, tamanho_bytes: 0, largura_px: 0, altura_px: 0,
            erro: e.message
          });
        }

        // poppler
        try {
          const outputDir = 'benchmarks/rasterizacao/amostras';
          const resPoppler = await rasterizarPoppler(doc.arquivo, pagina, dpi, outputDir);
          const files = fs.readdirSync(outputDir)
            .filter(f => f.startsWith(`poppler_p${pagina}`) && f.endsWith('.png'));
          const stat = fs.statSync(path.join(outputDir, files[files.length - 1]));
          resultados.push({
            documento_id: doc.documento_id, pagina, biblioteca: 'poppler', dpi,
            tempo_ms: resPoppler.tempo_ms, tamanho_bytes: stat.size,
            largura_px: resPoppler.largura, altura_px: resPoppler.altura, erro: null
          });
        } catch (e: any) {
          resultados.push({
            documento_id: doc.documento_id, pagina, biblioteca: 'poppler', dpi,
            tempo_ms: 0, tamanho_bytes: 0, largura_px: 0, altura_px: 0,
            erro: e.message
          });
        }
      }
    }
  }

  fs.writeFileSync(
    'benchmarks/rasterizacao/resultados_rasterizacao.json',
    JSON.stringify({ data: new Date().toISOString(), resultados }, null, 2)
  );
  console.log('Benchmark de rasterização concluído.');
}

function selecionarAmostraRepresentativa(docs: any[], n: number): any[] {
  // Seleciona documentos garantindo representatividade por categoria
  const categorias: Record<string, any[]> = {};
  for (const d of docs) {
    const cat = d.categoria_corpus;
    if (!categorias[cat]) categorias[cat] = [];
    categorias[cat].push(d);
  }
  const selecionados: any[] = [];
  const quotas: Record<string, number> = {
    'ESC-BOA': 5, 'ESC-DEG': 5, 'MAT-ATUAL-BOA': 5,
    'MAT-MONO': 3, 'ESC-MARCA': 2
  };
  for (const [cat, quota] of Object.entries(quotas)) {
    const disponiveis = categorias[cat] || [];
    selecionados.push(...disponiveis.slice(0, quota));
  }
  return selecionados.slice(0, n);
}

main().catch(console.error);
```

### 4.4. Critérios de avaliação

| Critério | Métrica | Como medir |
|---|---|---|
| Performance | Tempo médio de rasterização por página (ms) | Média aritmética dos tempos por biblioteca e DPI |
| Tamanho de saída | Tamanho médio do PNG por página (KB) | Média aritmética |
| Resolução efetiva | Dimensões em pixels vs. esperado (largura_esperada = largura_polegadas × DPI) | Verificar que a resolução é a solicitada |
| Qualidade visual | Inspeção manual de 10 pares de imagens (mupdf vs poppler) lado a lado | Checklist: texto nítido (sim/não), bordas de caracteres definidas (sim/não), artefatos de rasterização (sim/não) |
| Confiabilidade | Taxa de erros (falhas de rasterização) | Contagem de erros / total de tentativas |

### 4.5. Gate de decisão da rasterização

**mupdf é escolhido como primário SE todas as seguintes condições forem verdadeiras:**

1. Taxa de erro de mupdf = 0% na amostra de 20 documentos
2. Tempo médio de mupdf ≤ 1.5× tempo médio de poppler (mupdf pode ser até 50% mais lento e ainda ser aceitável pela qualidade superior)
3. Inspeção visual: mupdf produz texto tão ou mais nítido que poppler em ≥ 18 de 20 documentos
4. Resolução efetiva confere com a solicitada em 100% dos casos

**Se mupdf falhar em qualquer condição acima**, poppler é promovido a primário e o resultado é registrado em `decisoes/decisao_rasterizacao.md`.

**Se ambas falharem** (taxa de erro > 0% para ambas), a ação corretiva é: investigar os documentos que causaram falha, verificar se são PDFs protegidos ou corrompidos, e excluí-los da amostra com justificativa. Repetir o benchmark sem esses documentos.

---

## SEÇÃO 5 — Benchmark de pré-processamento

### 5.1. Sequência de experimentos

Para cada documento rasterizado do corpus (usando a biblioteca aprovada no Gate 1), executar os seguintes experimentos sobre cada página:

#### Experimento A — Baseline bruto (sem pré-processamento)

Nenhuma transformação. A imagem rasterizada é enviada diretamente ao OCR.

#### Experimento B — Apenas deskew

```python
# preprocessar_pagina.py — Experimento B
import cv2
import numpy as np

def deskew(image: np.ndarray) -> np.ndarray:
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if len(image.shape) == 3 else image
    # Detectar ângulo via projeção horizontal
    coords = np.column_stack(np.where(gray < 128))
    if len(coords) < 100:
        return image
    angle = cv2.minAreaRect(coords)[-1]
    if angle < -45:
        angle = -(90 + angle)
    else:
        angle = -angle
    # Limite de segurança
    if abs(angle) > 15.0:
        return image
    if abs(angle) < 0.5:
        return image
    (h, w) = image.shape[:2]
    center = (w // 2, h // 2)
    M = cv2.getRotationMatrix2D(center, angle, 1.0)
    rotated = cv2.warpAffine(image, M, (w, h),
                              flags=cv2.INTER_CUBIC,
                              borderMode=cv2.BORDER_REPLICATE)
    return rotated
```

#### Experimento C — Deskew + denoising leve

```python
def denoise_leve(image: np.ndarray) -> np.ndarray:
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if len(image.shape) == 3 else image
    return cv2.fastNlMeansDenoising(gray, h=5, templateWindowSize=7, searchWindowSize=21)
```

Sequência: `deskew` → `denoise_leve`.

#### Experimento D — Deskew + denoising médio + binarização Sauvola

```python
def denoise_medio(image: np.ndarray) -> np.ndarray:
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if len(image.shape) == 3 else image
    return cv2.fastNlMeansDenoising(gray, h=10, templateWindowSize=7, searchWindowSize=21)

def binarizar_sauvola(image: np.ndarray, window_size: int = 25, k: float = 0.2) -> np.ndarray:
    """Binarização adaptativa de Sauvola."""
    gray = image if len(image.shape) == 2 else cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    mean = cv2.blur(gray.astype(np.float64), (window_size, window_size))
    sq_mean = cv2.blur((gray.astype(np.float64))**2, (window_size, window_size))
    std = np.sqrt(np.maximum(sq_mean - mean**2, 0))
    R = 128.0
    threshold = mean * (1.0 + k * (std / R - 1.0))
    binary = np.where(gray > threshold, 255, 0).astype(np.uint8)
    return binary
```

Sequência: `deskew` → `denoise_medio` → `binarizar_sauvola`.

#### Experimento E — Pipeline completo (D + normalização de contraste + limpeza de bordas)

```python
def normalizar_contraste(image: np.ndarray) -> np.ndarray:
    """Equalização adaptativa de histograma (CLAHE)."""
    gray = image if len(image.shape) == 2 else cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    return clahe.apply(gray)

def limpar_bordas(image: np.ndarray, margem_percentual: float = 0.02) -> np.ndarray:
    """Remove faixas escuras nas bordas (artefato de scanner)."""
    h, w = image.shape[:2]
    margem_h = int(h * margem_percentual)
    margem_w = int(w * margem_percentual)
    result = image.copy()
    result[:margem_h, :] = 255
    result[-margem_h:, :] = 255
    result[:, :margem_w] = 255
    result[:, -margem_w:] = 255
    return result
```

Sequência: `deskew` → `normalizar_contraste` → `denoise_medio` → `binarizar_sauvola` → `limpar_bordas`.

#### Experimento F — Pipeline completo + detecção e atenuação de marca d'água

Sequência: `detectar_marca_dagua` → `atenuar_marca_dagua` → pipeline do Experimento E.

(Detalhamento da detecção de marca d'água na Seção 5.2 abaixo.)

### 5.2. Detecção de marca d'água

#### 5.2.1. Marcas d'água laterais

Padrão: faixa vertical na borda esquerda ou direita da página contendo texto rotacionado 90° com conteúdo "ESTADO DE MINAS GERAIS — LIBERTAS QUAE SERA TAMEN" ou variantes.

**Método de detecção:**

```python
def detectar_marca_dagua_lateral(image: np.ndarray, largura_faixa_pct: float = 0.08) -> dict:
    """
    Detecta marca d'água lateral por análise de projeção horizontal
    em faixa de borda esquerda/direita.
    """
    gray = image if len(image.shape) == 2 else cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    h, w = gray.shape
    largura_faixa = int(w * largura_faixa_pct)

    resultado = {'detectada': False, 'lado': None, 'regiao': None}

    for lado, faixa in [('esquerda', gray[:, :largura_faixa]),
                         ('direita', gray[:, -largura_faixa:])]:
        # Binarizar a faixa
        _, bin_faixa = cv2.threshold(faixa, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
        # Projeção vertical (soma por linha)
        proj = np.sum(bin_faixa, axis=1)
        # Se > 60% das linhas têm pixels de texto, há marca d'água lateral
        linhas_com_texto = np.sum(proj > largura_faixa * 0.05)
        if linhas_com_texto > h * 0.6:
            x0 = 0 if lado == 'esquerda' else w - largura_faixa
            resultado = {
                'detectada': True,
                'lado': lado,
                'regiao': {'x0': x0, 'y0': 0, 'x1': x0 + largura_faixa, 'y1': h}
            }
            break

    return resultado
```

#### 5.2.2. Marcas d'água diagonais

Padrão: texto em ângulo de ~30-45° cruzando a página com conteúdo "PARA SIMPLES CONSULTA", "CERTIDÃO", "NÃO VALE COMO ESCRITURA".

**Método de detecção: Hough Transform + template matching.**

```python
def detectar_marca_dagua_diagonal(image: np.ndarray) -> dict:
    """
    Detecta marca d'água diagonal por Hough Transform para linhas
    em ângulo não-horizontal e não-vertical.
    """
    gray = image if len(image.shape) == 2 else cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    # Binarizar com threshold alto para capturar texto claro (marca d'água é tipicamente cinza claro)
    _, light_text = cv2.threshold(gray, 180, 255, cv2.THRESH_BINARY_INV)

    # Detectar linhas via Hough
    lines = cv2.HoughLinesP(light_text, 1, np.pi / 180,
                             threshold=100, minLineLength=200, maxLineGap=20)

    resultado = {'detectada': False, 'angulo': None, 'regioes': []}

    if lines is not None:
        angulos_diagonais = []
        for line in lines:
            x1, y1, x2, y2 = line[0]
            angulo = np.degrees(np.arctan2(y2 - y1, x2 - x1))
            # Marcas d'água diagonais estão entre 20° e 70° ou -20° e -70°
            if 20 < abs(angulo) < 70:
                angulos_diagonais.append(angulo)

        if len(angulos_diagonais) > 5:
            angulo_medio = np.median(angulos_diagonais)
            resultado = {
                'detectada': True,
                'angulo': float(angulo_medio),
                'regioes': [{'tipo': 'diagonal', 'angulo': float(angulo_medio)}]
            }

    return resultado
```

#### 5.2.3. Atenuação de marca d'água

```python
def atenuar_marca_dagua(image: np.ndarray, regiao: dict) -> np.ndarray:
    """
    Atenua marca d'água por threshold local na região detectada.
    Preserva texto legítimo escuro, remove texto cinza claro da marca d'água.
    """
    result = image.copy()
    gray = result if len(result.shape) == 2 else cv2.cvtColor(result, cv2.COLOR_BGR2GRAY)

    if regiao.get('lado'):  # Marca lateral
        r = regiao['regiao']
        roi = gray[r['y0']:r['y1'], r['x0']:r['x1']]
        # Manter apenas pixels muito escuros (texto legítimo)
        _, mask = cv2.threshold(roi, 100, 255, cv2.THRESH_BINARY)
        roi[mask == 255] = 255  # Clarear tudo que não é texto escuro
        if len(result.shape) == 2:
            result[r['y0']:r['y1'], r['x0']:r['x1']] = roi
        else:
            for c in range(3):
                result[r['y0']:r['y1'], r['x0']:r['x1'], c] = roi

    elif regiao.get('angulo'):  # Marca diagonal
        # Para marcas diagonais, aplicar threshold global que preserva texto escuro
        _, mask = cv2.threshold(gray, 160, 255, cv2.THRESH_BINARY)
        if len(result.shape) == 2:
            result[mask == 255] = 255
        else:
            for c in range(3):
                result[:, :, c][mask == 255] = 255

    return result
```

#### 5.2.4. Registro de presença de marca d'água

A presença e o tipo de marca d'água são registrados como metadado no resultado do pré-processamento:

```json
{
  "pagina": 1,
  "marca_dagua_lateral": { "detectada": true, "lado": "esquerda" },
  "marca_dagua_diagonal": { "detectada": false },
  "marca_dagua_atenuada": true
}
```

### 5.3. Rodapés de sistema

#### 5.3.1. Padrão de rodapé a detectar

Padrão principal (matrículas eletrônicas): `Solicitado por: .* - Data da Solicitação: \d{2}/\d{2}/\d{4} \d{2}:\d{2}`

Padrões secundários: `Válido em todo território nacional`, rodapés de tabelionato (nome, endereço, telefone).

#### 5.3.2. Método de detecção

Combinação de posição na página + regex:

```typescript
function detectarRodapeSistema(textoPagina: string, totalLinhas: number): {
  detectado: boolean;
  linhasRodape: number[];
  textoRodape: string;
} {
  const linhas = textoPagina.split('\n');
  const ultimasLinhas = linhas.slice(-Math.ceil(totalLinhas * 0.10)); // Últimos 10%
  const regexRodape = /Solicitado por:.*-\s*Data da Solicitação:\s*\d{2}\/\d{2}\/\d{4}/i;
  const regexValido = /V[áa]lido em todo territ[óo]rio nacional/i;

  const linhasDetectadas: number[] = [];
  const textosDetectados: string[] = [];

  for (let i = linhas.length - ultimasLinhas.length; i < linhas.length; i++) {
    if (regexRodape.test(linhas[i]) || regexValido.test(linhas[i])) {
      linhasDetectadas.push(i);
      textosDetectados.push(linhas[i]);
    }
  }

  return {
    detectado: linhasDetectadas.length > 0,
    linhasRodape: linhasDetectadas,
    textoRodape: textosDetectados.join('\n')
  };
}
```

#### 5.3.3. Filtragem

O rodapé é **marcado como região não-textual** no resultado (registrado como metadado), mas **não é removido da imagem pré-processada** (preservado para auditoria). O parser recebe a informação de quais linhas são rodapé e as ignora durante a extração de campos.

### 5.4. Métricas de avaliação do pré-processamento

Para cada experimento (A-F) e cada documento:

1. **CER antes do pré-processamento:** OCR executado sobre imagem bruta (Experimento A) comparado ao ground truth.
2. **CER depois do pré-processamento:** OCR executado sobre imagem pré-processada comparado ao ground truth.
3. **Redução percentual de CER:** `(CER_antes - CER_depois) / CER_antes * 100`
4. **Checklist de inspeção visual** por imagem pré-processada:

| Critério | Condição para APROVADO |
|---|---|
| Texto principal legível | Todos os caracteres do texto principal são discerníveis individualmente na imagem |
| Sem inversão de cor | Texto permanece escuro sobre fundo claro em 100% da área textual |
| Sem perda de caracteres | Nenhum caractere do texto principal foi eliminado pelo pré-processamento (comparar com imagem bruta) |
| Marca d'água atenuada (se presente) | Marca d'água não é o elemento visual dominante na região onde foi detectada |
| Bordas de caracteres preservadas | Caracteres com hastes finas (i, l, 1, t) não foram erosionados a ponto de perder legibilidade |

Resultados registrados em `benchmarks/preprocessamento/preprocessamento_resultados.json`:

```json
{
  "data": "2026-05-01",
  "resultados": [
    {
      "documento_id": "escritura_boa_001",
      "pagina": 1,
      "experimento": "A",
      "cer_texto_geral": 0.08,
      "cer_cpf": 0.00,
      "cer_nomes": 0.04,
      "cer_matricula": 0.00,
      "inspecao_visual": {
        "texto_legivel": true,
        "sem_inversao": true,
        "sem_perda_caracteres": true,
        "marca_dagua_atenuada": null,
        "bordas_preservadas": true
      }
    }
  ]
}
```

### 5.5. Gate de decisão do pré-processamento

O pipeline de pré-processamento é **aprovado** quando TODAS as condições são satisfeitas:

1. **Redução de CER geral ≥ 20%** vs. baseline bruto (Experimento A) calculada como média sobre o corpus de calibração (primeiros 30 documentos anotados).
2. **Taxa de filtragem correta de marcas d'água ≥ 95%** das páginas com marca d'água: marca d'água foi detectada e atenuada sem remover texto legítimo.
3. **Nenhum caso** onde o pré-processamento removeu texto legítimo identificável (verificado pela inspeção visual + comparação de CER campo a campo — se CER de algum campo piorou com pré-processamento vs. sem, investigar e documentar).

**Se o gate falhar:**

- Se redução de CER < 20%: ajustar parâmetros de denoising e binarização; testar com perfil ENHANCED e AGGRESSIVE; repetir benchmark.
- Se filtragem de marca d'água < 95%: refinar os thresholds de detecção; ajustar ângulos e faixas de busca; repetir.
- Se houve perda de texto legítimo: identificar a etapa responsável; reduzir agressividade do denoising ou binarização para o tipo de documento afetado; criar perfil específico se necessário.

**O experimento vencedor** (A-F) é aquele que:
1. Não causa perda de texto legítimo em nenhum documento
2. Tem a maior redução média de CER no corpus
3. Detecta e atenua marcas d'água em ≥ 95% dos casos

---

## SEÇÃO 6 — Benchmark de OCR

### 6.1. Instalação dos motores

#### Tesseract 5

Instalação do binário: conforme Seção 2.5.

Binding para Node.js via `node-tesseract-ocr`:

```bash
npm install node-tesseract-ocr
```

Configuração no script:

```typescript
import tesseract from 'node-tesseract-ocr';

const configTesseract = {
  lang: 'por',
  oem: 1,     // LSTM only
  psm: 3,     // Fully automatic page segmentation
  tessedit_char_whitelist: '',  // Sem restrição
  tessdata_dir: 'C:\\Program Files\\Tesseract-OCR\\tessdata'
};

async function ocrTesseract(imagePath: string): Promise<{texto: string; confianca: number}> {
  const texto = await tesseract.recognize(imagePath, configTesseract);
  // Confiança extraída via tsv output
  const tsv = await tesseract.recognize(imagePath, { ...configTesseract, tsv: true });
  const confianca = calcularConfiancaMedia(tsv);
  return { texto, confianca };
}
```

#### PaddleOCR

Instalação via pip (já incluída no `requirements.txt`):

```bash
pip install paddlepaddle paddleocr
```

Script worker em Python (`ferramentas/ocr_workers/paddleocr_worker.py`):

```python
"""
paddleocr_worker.py
Recebe caminho de imagem via argumento, retorna resultado OCR em JSON via stdout.
"""
import sys
import json
from paddleocr import PaddleOCR

# Inicializar uma vez (carrega modelos)
ocr = PaddleOCR(
    use_angle_cls=True,
    lang='pt',
    use_gpu=False,
    show_log=False
)

def processar(image_path: str) -> dict:
    result = ocr.ocr(image_path, cls=True)
    if not result or not result[0]:
        return {'texto': '', 'blocos': [], 'confianca_media': 0.0}

    blocos = []
    confiancas = []
    textos = []
    for line in result[0]:
        bbox = line[0]
        texto = line[1][0]
        conf = line[1][1]
        textos.append(texto)
        confiancas.append(conf)
        blocos.append({
            'texto': texto,
            'confianca': conf,
            'bbox': {
                'x0': min(p[0] for p in bbox),
                'y0': min(p[1] for p in bbox),
                'x1': max(p[0] for p in bbox),
                'y1': max(p[1] for p in bbox)
            }
        })

    return {
        'texto': '\n'.join(textos),
        'blocos': blocos,
        'confianca_media': sum(confiancas) / len(confiancas) if confiancas else 0.0
    }

if __name__ == '__main__':
    image_path = sys.argv[1]
    resultado = processar(image_path)
    print(json.dumps(resultado, ensure_ascii=False))
```

Execução a partir de Node.js via child process:

```typescript
import { execFile } from 'child_process';
import { promisify } from 'util';
const execFileAsync = promisify(execFile);

async function ocrPaddleOCR(imagePath: string): Promise<{texto: string; confianca: number}> {
  const { stdout } = await execFileAsync('python', [
    'ferramentas/ocr_workers/paddleocr_worker.py', imagePath
  ], { maxBuffer: 10 * 1024 * 1024 });
  const resultado = JSON.parse(stdout);
  return { texto: resultado.texto, confianca: resultado.confianca_media };
}
```

#### Doctr

**Decisão: Doctr é excluído do benchmark da Fase 0.** Conforme plano v1.3, Doctr foi removido da lista de candidatos porque sua dependência de PyTorch adiciona ~2 GB ao instalador e complexidade de empacotamento desproporcional ao ganho marginal sobre PaddleOCR. O benchmark avalia apenas Tesseract 5 e PaddleOCR.

### 6.2. Protocolo de execução do benchmark

Para cada motor (Tesseract, PaddleOCR) e cada documento do corpus de calibração (30 documentos com ground truth de 2 anotadores):

1. Ler cada página do documento (imagem pré-processada com o pipeline aprovado no Gate 1).
2. Executar OCR sobre a página.
3. Capturar: texto extraído completo, confiança média, blocos com confiança individual, tempo de processamento.
4. Salvar resultado em: `benchmarks/ocr/ocr_resultados/{motor}/{documento_id}/pagina_{n}.json`

Schema do arquivo de resultado por página:

```json
{
  "documento_id": "escritura_boa_001",
  "motor": "tesseract",
  "pagina": 1,
  "timestamp": "2026-05-05T14:30:00Z",
  "tempo_processamento_ms": 1250,
  "texto_completo": "ESCRITURA PÚBLICA DE COMPRA E VENDA...",
  "confianca_media": 0.89,
  "total_blocos": 45,
  "blocos": [
    {
      "texto": "ESCRITURA PÚBLICA",
      "confianca": 0.95,
      "bbox": { "x0": 100, "y0": 50, "x1": 500, "y1": 80 }
    }
  ],
  "perfil_preprocessamento": "EXPERIMENTO_E",
  "erro": null
}
```

### 6.3. Medição de CER

**Biblioteca escolhida:** `fastest-levenshtein` (npm) para cálculo de distância de edição. Justificativa: implementação otimizada em JavaScript puro, sem dependências nativas, performance adequada para comparação de strings de até milhares de caracteres.

```bash
npm install fastest-levenshtein
```

**Normalização do texto antes da comparação:**

```typescript
function normalizarParaCER(texto: string): string {
  return texto
    .toUpperCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')  // Remover acentos
    .replace(/\s+/g, ' ')                                // Normalizar espaços
    .replace(/[^\w\s]/g, '')                              // Remover pontuação
    .trim();
}
```

**Cálculo do CER:**

```typescript
import { distance } from 'fastest-levenshtein';

function calcularCER(textoOCR: string, textoGroundTruth: string): number {
  const ocr = normalizarParaCER(textoOCR);
  const gt = normalizarParaCER(textoGroundTruth);
  if (gt.length === 0) return ocr.length === 0 ? 0 : 1;
  return distance(ocr, gt) / gt.length;
}
```

**CER por tipo de campo:**

Para cada documento, o CER é calculado separadamente para:

- **CPF/CNPJ:** extrair apenas os dígitos (11 ou 14 caracteres); comparar com ground truth somente dígitos.
- **Número de matrícula:** extrair apenas o número; comparar como string.
- **Nomes próprios:** comparar nome completo normalizado (sem acentos, maiúsculas).
- **Texto geral:** comparar o texto completo da página (excluindo rodapés e marcas d'água).

**Formato do relatório final:**

Arquivo `benchmarks/ocr/ocr_benchmark_relatorio.json`:

```json
{
  "data": "2026-05-06",
  "corpus_calibracao_total": 30,
  "motores_avaliados": ["tesseract", "paddleocr"],
  "perfil_preprocessamento": "EXPERIMENTO_E",
  "resultados_por_motor": {
    "tesseract": {
      "cer_cpf_cnpj": 0.008,
      "cer_matricula": 0.005,
      "cer_nomes": 0.025,
      "cer_texto_geral": 0.042,
      "tempo_medio_por_pagina_ms": 1100,
      "gate_cpf_aprovado": true,
      "gate_matricula_aprovado": true,
      "gate_nomes_aprovado": true,
      "gate_texto_geral_aprovado": true
    },
    "paddleocr": {
      "cer_cpf_cnpj": 0.003,
      "cer_matricula": 0.002,
      "cer_nomes": 0.018,
      "cer_texto_geral": 0.035,
      "tempo_medio_por_pagina_ms": 2300,
      "gate_cpf_aprovado": true,
      "gate_matricula_aprovado": true,
      "gate_nomes_aprovado": true,
      "gate_texto_geral_aprovado": true
    }
  },
  "detalhamento_por_documento": []
}
```

### 6.4. Critérios de aceite por motor

Conforme Seção 23.6 do plano v1.3:

| Métrica | Limiar de aceite |
|---|---|
| CER em CPF/CNPJ | ≤ 1% (0.01) |
| CER em número de matrícula | ≤ 1% (0.01) |
| CER em nomes próprios | ≤ 3% (0.03) |
| CER em texto geral | ≤ 5% (0.05) |

### 6.5. Gate de decisão do OCR

**O motor é aprovado SE** atinge todos os 4 limiares acima no corpus de calibração (30 documentos anotados por 2 anotadores).

**Regras de seleção entre os motores:**

1. Se ambos atingem todos os limiares: escolher o que tem menor CER médio ponderado (peso 3 para CPF/CNPJ e matrícula, peso 2 para nomes, peso 1 para texto geral). Em caso de empate (diferença < 0,5%), escolher Tesseract pela menor complexidade de empacotamento.
2. Se apenas um atinge todos os limiares: escolher esse motor.
3. Se nenhum atinge todos os limiares: **NÃO trocar de motor.** Ação corretiva obrigatória: refinar o pipeline de pré-processamento (testar parâmetros mais agressivos, perfis ENHANCED e AGGRESSIVE, ajustes em denoising e binarização). Repetir o benchmark de OCR. Se após 2 iterações de refinamento nenhum motor atingir todos os limiares, documentar as exceções e escalar para decisão do líder técnico.

**Registro da decisão:**

Arquivo `decisoes/decisao_motor_ocr.md` com:

```markdown
# Decisão: Motor OCR Primário

**Data:** YYYY-MM-DD
**Motor escolhido:** [Tesseract 5 / PaddleOCR]

## Métricas atingidas

| Métrica | Limiar | Resultado | Aprovado |
|---|---|---|---|
| CER CPF/CNPJ | ≤ 1% | X.XX% | SIM/NÃO |
| CER Matrícula | ≤ 1% | X.XX% | SIM/NÃO |
| CER Nomes | ≤ 3% | X.XX% | SIM/NÃO |
| CER Texto geral | ≤ 5% | X.XX% | SIM/NÃO |

## Justificativa
[Texto explicando a escolha]

## Exceções documentadas (se houver)
[Nenhuma / descrição de exceções aceitas com justificativa]

## Perfil de pré-processamento associado
[Experimento vencedor, parâmetros]
```

---

## SEÇÃO 7 — Prototipagem do parser (parser sketch)

### 7.1. Campos a priorizar na prototipagem

**Para escritura — ordem de prioridade:**

| Prioridade | Campo | Justificativa |
|---|---|---|
| 1 | `transmitente_1_cpf` | Afeta itens 7, 8 do checklist; validável por dígito verificador; campo mais crítico para conferência |
| 2 | `matricula` | Afeta item 13; comparação exata com matrícula; identificador chave do imóvel |
| 3 | `transmitente_1_nome` | Afeta itens 7, 8; comparação com proprietário da matrícula |
| 4 | `transmitente_1_estado_civil` | Afeta itens 7, 10, 11, 12; determina necessidade de cônjuge anuente |
| 5 | `adquirente_1_cpf` | Afeta item 9 |
| 6 | `adquirente_1_nome` | Afeta item 9 |
| 7 | `data_lavratura` | Afeta item 4 |
| 8 | `uf_tabelionato` | Afeta item 5 |
| 9 | `valor_partes` | Afeta item 33 |
| 10 | `doi_emitida_mencionada` | Afeta item 23 |
| 11 | `itbi_mencionado` | Afeta item 22 |
| 12 | `certidao_acoes_reais_apresentada` | Afeta item 24 |
| 13 | `area` + `unidade_area` | Afeta item 15 |
| 14 | `tipo_imovel` | Afeta itens 27, 32 |
| 15 | `urbano_ou_rural` | Afeta item 32 |

**Para matrícula — ordem de prioridade:**

| Prioridade | Campo | Justificativa |
|---|---|---|
| 1 | `matricula_numero` | Identificador primário; comparação com escritura |
| 2 | `proprietario_1_nome` | Comparação com transmitente da escritura |
| 3 | `proprietario_1_cpf_cnpj` | Comparação com CPF do transmitente |
| 4 | `proprietario_1_estado_civil` | Comparação com estado civil do transmitente |
| 5 | `area` + `unidade_area` | Comparação com escritura |
| 6 | `formato_matricula` | Determina perfil de parsing |
| 7 | `onus_N_tipo` + `onus_N_impeditivo_ou_nao` | Afeta item 19 |
| 8 | `transporte_ficha` | Afeta continuidade de parsing |
| 9 | `cadastro_incra` | Afeta item 32 |
| 10 | `inscricao_imobiliaria` | Afeta item 16 |

### 7.2. Método de exploração de âncoras

#### 7.2.1. Análise do corpus

Para cada documento do corpus de calibração:

1. Abrir o texto OCR produzido pelo pipeline aprovado.
2. Para cada campo do ground truth, localizar no texto OCR a região onde o valor aparece.
3. Registrar o texto que **precede** o valor (rótulo/âncora) — tipicamente as 5-15 palavras antes do valor.
4. Registrar variações desse rótulo entre documentos diferentes.

Este trabalho é executado pelo script `parser_sketch/src/explorar_ancoras.ts` de forma semi-automática: o script busca o valor do ground truth no texto OCR e extrai o contexto ao redor. O operador humano valida e consolida.

#### 7.2.2. Schema do catálogo de âncoras (`parser_sketch/catalogo_ancoras.json`)

```json
{
  "$schema": "catalogo_ancoras_schema",
  "versao": "1.0",
  "data": "2026-05-10",
  "tipo_documento": "ESCRITURA_COMPRA_VENDA",
  "ancoras": {
    "transmitente_1_cpf": {
      "campo": "transmitente_1_cpf",
      "tipo_extracao": "REGEX_ROTULO",
      "ancoras_primarias": [
        "CPF nº",
        "CPF/MF nº",
        "inscrito no CPF sob o nº",
        "inscrit[oa] no CPF"
      ],
      "ancoras_variantes_ocr": [
        "CPF n°",
        "CPF n º",
        "CPF/MF n°",
        "inscrito no CPF sob o n°"
      ],
      "regex_valor": "\\d{3}[\\s\\.]?\\d{3}[\\s\\.]?\\d{3}[\\s\\-]?\\d{2}",
      "contexto_bloco": "Bloco de qualificação de parte (após 'OUTORGANTE' ou 'VENDEDOR')",
      "frequencia_no_corpus": 28,
      "total_documentos_analisados": 30,
      "observacoes": "Em 2 documentos o OCR fragmentou 'CPF' como 'C PF' ou 'C P F'"
    },
    "matricula": {
      "campo": "matricula",
      "tipo_extracao": "REGEX_ROTULO",
      "ancoras_primarias": [
        "Matrícula nº",
        "matrícula n°",
        "MATRÍCULA Nº"
      ],
      "ancoras_variantes_ocr": [
        "Matricula nº",
        "Matrícula n °",
        "Matricula n°",
        "Matrlcula nº"
      ],
      "regex_valor": "\\d{1,6}[\\.\\s]?\\d{0,3}",
      "contexto_bloco": "Bloco de descrição do imóvel ou cabeçalho da matrícula",
      "frequencia_no_corpus": 30,
      "total_documentos_analisados": 30,
      "observacoes": ""
    }
  }
}
```

### 7.3. Implementação do parser sketch

**Linguagem:** TypeScript. Justificativa: consistência com a linguagem primária do produto final; os parsers de produção da Fase 1 serão em TypeScript; o sketch serve como base exploratória que será refinada.

**Estrutura de arquivos:**

```
parser_sketch/src/
├── explorar_ancoras.ts          # Exploração semi-automática de âncoras no corpus
├── parser_escritura_sketch.ts   # Parser sketch para escritura
├── parser_matricula_sketch.ts   # Parser sketch para matrícula
├── normalizar_texto_ocr.ts      # Limpeza e normalização de texto OCR
├── medir_acerto.ts              # Medição de taxa de acerto vs ground truth
└── tipos.ts                     # Tipos compartilhados
```

**Exemplo de extração de CPF com âncora:**

```typescript
// parser_escritura_sketch.ts

interface CampoExtraidoSketch {
  campo: string;
  valor_bruto: string | null;
  valor_normalizado: string | null;
  metodo: 'REGEX_ROTULO' | 'PADRAO_FIXO' | 'HEURISTICA';
  pagina: number;
  posicao_inicio: number;
  posicao_fim: number;
  confianca_estimada: number;
  alertas: string[];
}

function extrairCPF(texto: string, pagina: number): CampoExtraidoSketch {
  // Tratar artefatos OCR comuns antes da busca
  const textoLimpo = tratarArtefatosOCR(texto);

  // Âncoras: tentar todas as variantes conhecidas
  const ancoras = [
    /CPF[\s/]*(?:MF)?[\s]*n[º°]?\s*/gi,
    /inscrit[oa]\s+no\s+CPF[\s/]*(?:MF)?[\s]*(?:sob\s+)?[oa]?\s*n[º°]?\s*/gi,
    /C\s*P\s*F[\s]*n[º°]?\s*/gi  // OCR fragmentado
  ];

  // Regex para o valor do CPF (tolerante a espaços e pontos inseridos por OCR)
  const regexCPF = /(\d[\d\s\.]{10,16}\d)/;

  for (const ancRegex of ancoras) {
    let match;
    while ((match = ancRegex.exec(textoLimpo)) !== null) {
      const posAposAncora = match.index + match[0].length;
      const trecho = textoLimpo.substring(posAposAncora, posAposAncora + 30);
      const cpfMatch = regexCPF.exec(trecho);

      if (cpfMatch) {
        const valorBruto = cpfMatch[1];
        const digitos = valorBruto.replace(/\D/g, '');

        // Tentar corrigir substituições OCR comuns
        const digitosCorrigidos = corrigirSubstituicoesNumericas(digitos);

        const alertas: string[] = [];
        if (digitos !== digitosCorrigidos) {
          alertas.push('Correção OCR aplicada: substituição de caractere ambíguo');
        }

        const cpfValido = validarCPF(digitosCorrigidos);
        if (!cpfValido) {
          alertas.push('CPF com dígito verificador inválido');
        }

        return {
          campo: 'transmitente_1_cpf',
          valor_bruto: valorBruto,
          valor_normalizado: digitosCorrigidos.length === 11 ? digitosCorrigidos : null,
          metodo: 'REGEX_ROTULO',
          pagina,
          posicao_inicio: match.index,
          posicao_fim: posAposAncora + cpfMatch.index + cpfMatch[0].length,
          confianca_estimada: cpfValido ? 0.90 : 0.30,
          alertas
        };
      }
    }
  }

  // Fallback: busca por padrão fixo sem âncora
  const regexCPFSolto = /\b(\d{3}[\.\s]?\d{3}[\.\s]?\d{3}[-\s]?\d{2})\b/g;
  let cpfSoltoMatch;
  while ((cpfSoltoMatch = regexCPFSolto.exec(textoLimpo)) !== null) {
    const digitos = cpfSoltoMatch[1].replace(/\D/g, '');
    if (digitos.length === 11 && validarCPF(digitos)) {
      return {
        campo: 'transmitente_1_cpf',
        valor_bruto: cpfSoltoMatch[1],
        valor_normalizado: digitos,
        metodo: 'PADRAO_FIXO',
        pagina,
        posicao_inicio: cpfSoltoMatch.index,
        posicao_fim: cpfSoltoMatch.index + cpfSoltoMatch[0].length,
        confianca_estimada: 0.70,
        alertas: ['CPF encontrado por padrão fixo sem âncora de rótulo']
      };
    }
  }

  return {
    campo: 'transmitente_1_cpf',
    valor_bruto: null,
    valor_normalizado: null,
    metodo: 'REGEX_ROTULO',
    pagina, posicao_inicio: -1, posicao_fim: -1,
    confianca_estimada: 0,
    alertas: ['Campo não localizado']
  };
}

function corrigirSubstituicoesNumericas(texto: string): string {
  return texto
    .replace(/[Oo]/g, '0')
    .replace(/[Ii|lL]/g, '1')
    .replace(/[Ss]/g, '5')
    .replace(/[Bb]/g, '8')
    .replace(/[Gg]/g, '9');
}

function validarCPF(cpf: string): boolean {
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;
  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(cpf[i]) * (10 - i);
  let resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  if (resto !== parseInt(cpf[9])) return false;
  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(cpf[i]) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  return resto === parseInt(cpf[10]);
}

function tratarArtefatosOCR(texto: string): string {
  return texto
    .replace(/\r\n/g, '\n')
    .replace(/([a-záéíóúãõâêô])-\n([a-záéíóúãõâêô])/gi, '$1$2')  // Reconstituir palavras hifenizadas
    .replace(/\n(?=[a-záéíóúãõâêô])/gi, ' ')  // Juntar linhas fragmentadas
    .replace(/\s{2,}/g, ' ');
}
```

### 7.4. Medição da taxa de acerto do parser sketch

Script `parser_sketch/src/medir_acerto.ts`:

Para cada documento do corpus de calibração com ground truth:

1. Executar o parser sketch sobre o texto OCR do documento.
2. Para cada campo extraído, comparar com o valor do ground truth **após normalização** (mesma normalização aplicada a ambos).
3. Classificar como:
   - **Acerto:** valor normalizado extraído == valor normalizado do ground truth
   - **Erro:** valor extraído difere do ground truth
   - **Não localizado:** parser retornou null
4. Calcular taxa de acerto por campo: `acertos / (acertos + erros + não_localizados) * 100`

**Limiar mínimo:** ≥ 85% de acerto no corpus de calibração para considerar o campo "extraível de forma confiável".

**Campos que não atingem 85%:** documentados no relatório como "requer heurística adicional na Fase 1" com descrição do padrão de falha observado. **Não bloqueiam** a Fase 0.

### 7.5. Gate de decisão do parser sketch

O parser sketch é **aprovado** quando TODAS as condições são satisfeitas:

1. **Campos críticos atingem ≥ 85% de acerto:**
   - `transmitente_1_cpf` ≥ 85%
   - `matricula` (na escritura) ≥ 85%
   - `matricula_numero` (na matrícula) ≥ 85%
   - `transmitente_1_nome` ≥ 85%

2. **Catálogo de âncoras cobre ≥ 80% dos campos da Seção 17 do plano v1.3** para ≥ 80% dos documentos do corpus. "Cobertura" significa: a âncora foi encontrada no texto OCR e o valor subsequente corresponde ao ground truth.

**Se o gate falhar:**

- Se CPF < 85%: investigar se o problema é OCR (dígitos errados) ou parsing (âncora não encontrada). Se OCR: voltar ao Gate 2 e refinar pré-processamento. Se parsing: expandir catálogo de âncoras e ajustar regexes.
- Se nome < 85%: investigar padrão de falha (OCR fragmentou o nome? nome composto com variação?). Ajustar heurísticas de extração de nomes.
- Se cobertura de âncoras < 80%: expandir catálogo com variantes adicionais observadas nos documentos que falharam.

---

## SEÇÃO 8 — Baseline de regressão

### 8.1. Formato do baseline

Schema JSON completo (`baseline/fase0_baseline_v1.json`):

```json
{
  "$schema": "baseline_schema",
  "versao_baseline": "fase0_v1",
  "data_congelamento": "2026-05-15T10:00:00Z",
  "hash_arquivo": "sha256:abcdef1234567890...",
  "versao_pipeline": {
    "motor_ocr": "tesseract-5.3.4",
    "perfil_preprocessamento": "EXPERIMENTO_E",
    "biblioteca_rasterizacao": "mupdf",
    "dpi_rasterizacao": 300,
    "parser_sketch_versao": "1.0"
  },
  "corpus_calibracao_total": 30,
  "metricas_globais": {
    "cer_cpf_cnpj": 0.008,
    "cer_matricula": 0.005,
    "cer_nomes": 0.025,
    "cer_texto_geral": 0.042,
    "parser_acerto_cpf": 0.93,
    "parser_acerto_matricula": 0.97,
    "parser_acerto_nome": 0.87
  },
  "documentos": [
    {
      "documento_id": "escritura_boa_001",
      "versao_pipeline": "fase0_v1",
      "motor_ocr": "tesseract",
      "perfil_preprocessamento": "EXPERIMENTO_E",
      "campos_extraidos": {
        "transmitente_1_cpf": {
          "valor_extraido": "12345678901",
          "valor_ground_truth": "12345678901",
          "acerto": true,
          "confianca_ocr": 0.94,
          "metodo_extracao": "REGEX_ROTULO"
        },
        "transmitente_1_nome": {
          "valor_extraido": "NOME ANONIMIZADO TRANSMITENTE 1",
          "valor_ground_truth": "NOME ANONIMIZADO TRANSMITENTE 1",
          "acerto": true,
          "confianca_ocr": 0.88,
          "metodo_extracao": "REGEX_ROTULO"
        }
      },
      "metricas_pagina": [
        {
          "pagina": 1,
          "cer_texto_geral": 0.035,
          "confianca_media_ocr": 0.91,
          "marca_dagua_detectada": false,
          "rodape_filtrado": false
        }
      ]
    }
  ]
}
```

### 8.2. Quando e como congelar o baseline

**Condição exata para congelamento:** o baseline é congelado **imediatamente após** a aprovação dos três gates sequenciais (Gate 1: rasterização+pré-processamento, Gate 2: OCR, Gate 3: parser sketch). Nenhuma modificação no pipeline é permitida entre a aprovação do Gate 3 e o congelamento do baseline.

**Comando para gerar o baseline:**

```bash
npm run baseline:gerar
```

Este comando executa o pipeline completo (rasterização → pré-processamento → OCR → parser sketch) sobre todos os 30 documentos do corpus de calibração e gera o arquivo de baseline.

**Onde salvar:** `baseline/fase0_baseline_v1.json`

**Versionamento:** o nome do arquivo inclui a versão (`v1`). O hash SHA-256 do arquivo é calculado e registrado dentro do próprio JSON no campo `hash_arquivo`. A data de congelamento é registrada em `data_congelamento`.

### 8.3. Como executar comparação automatizada

**Script de comparação:** `benchmarks/scripts/comparar_baseline.ts`

```bash
npm run baseline:comparar -- --baseline baseline/fase0_baseline_v1.json --novo resultado_atual.json
```

O script:

1. Carrega o baseline e o novo resultado.
2. Para cada documento e cada campo, compara o acerto atual com o acerto no baseline.
3. **Critério de regressão:** qualquer campo que **perde acerto** (era `acerto: true` no baseline e agora é `acerto: false`) é reportado como regressão.
4. Calcula taxa de acerto global por campo. Se qualquer campo regride mais de **2 pontos percentuais** em relação ao baseline, a regressão é **bloqueante**.

**Saída:**

```json
{
  "data_comparacao": "2026-05-16T09:00:00Z",
  "baseline_usado": "fase0_baseline_v1",
  "regressoes_bloqueantes": [],
  "regressoes_nao_bloqueantes": [],
  "melhorias": [],
  "sumario": "0 regressões bloqueantes, 0 regressões não-bloqueantes, 2 melhorias."
}
```

Sumário em texto: impresso no console ao final da execução.

---

## SEÇÃO 9 — Cronograma de execução

| # | Atividade | Duração | Depende de | Paralelizável com |
|---|---|---|---|---|
| 1 | Setup do ambiente | 1 dia | — | — |
| 2 | Coleta do corpus (145 documentos) | 5 dias | #1 | — |
| 3 | Anonimização do corpus | 3 dias | #2 | — |
| 4 | Catalogação e nomenclatura | 1 dia | #3 | — |
| 5 | Anotação ground truth — primeiros 30 docs (2 anotadores) | 8 dias | #4 | — |
| 6 | Benchmark de rasterização | 2 dias | #5 parcial (10 docs anonimizados) | #5 (anotação continua em paralelo) |
| 7 | Benchmark de pré-processamento | 4 dias | #6 (rasterização aprovada) | #5 (anotação continua em paralelo) |
| 8 | Benchmark de OCR | 4 dias | #7 (pré-processamento aprovado) + #5 completo (30 docs anotados) | — |
| 9 | Parser sketch — exploração de âncoras | 3 dias | #8 (OCR aprovado) | — |
| 10 | Parser sketch — implementação e medição | 3 dias | #9 | — |
| 11 | Anotação ground truth — restante do corpus (docs 31-145, 1 anotador + revisão 20%) | 5 dias | #4 | #9, #10 |
| 12 | Congelamento do baseline | 1 dia | #10 (todos os gates aprovados) | — |
| 13 | Relatório final e decisões | 2 dias | #12 | — |

**Total estimado: 5 a 6 semanas** (considerando paralelismo possível).

**Dependências críticas (NÃO paralelizáveis):**

- O benchmark de rasterização (#6) precisa de ao menos 10 documentos anonimizados para começar, mas não precisa do ground truth completo.
- O benchmark de pré-processamento (#7) depende da decisão de rasterização.
- O benchmark de OCR (#8) depende do pipeline de pré-processamento aprovado E dos 30 documentos com ground truth completo.
- O parser sketch (#9, #10) depende do motor OCR aprovado.
- O baseline (#12) depende de todos os três gates aprovados.

**Paralelismo permitido:**

- A anotação de ground truth (#5) pode continuar enquanto os benchmarks de rasterização e pré-processamento são executados (os benchmarks iniciais usam subconjuntos menores).
- A anotação do restante do corpus (#11) pode ser feita em paralelo com o parser sketch.

---

## SEÇÃO 10 — Gates de decisão e critérios de saída

### 10.1. Três gates sequenciais

#### Gate 1 — Rasterização e pré-processamento aprovados

**Condições para aprovação (TODAS devem ser satisfeitas):**

1. Biblioteca de rasterização escolhida: mupdf ou poppler, conforme critérios da Seção 4.5.
2. Taxa de erro de rasterização = 0% na amostra de 20 documentos.
3. Pipeline de pré-processamento produz redução de CER geral ≥ 20% vs. baseline bruto.
4. Taxa de filtragem correta de marcas d'água ≥ 95%.
5. Nenhum caso de perda de texto legítimo pelo pré-processamento.
6. Arquivo `decisoes/decisao_rasterizacao.md` redigido e completo.

**Condições de reprovação:** qualquer condição acima não satisfeita.

**Ação corretiva:** ajustar parâmetros do pipeline de pré-processamento (denoising, binarização, detecção de marca d'água). Se rasterização falha: testar a biblioteca alternativa como primária. Repetir benchmark com parâmetros ajustados.

**Quem aprova:** líder técnico (engenheiro humano).

#### Gate 2 — Motor OCR aprovado

**Condições para aprovação (TODAS devem ser satisfeitas):**

1. Ao menos um motor (Tesseract 5 ou PaddleOCR) atinge TODOS os limiares:
   - CER CPF/CNPJ ≤ 1%
   - CER matrícula ≤ 1%
   - CER nomes ≤ 3%
   - CER texto geral ≤ 5%
2. Medição realizada sobre os 30 documentos do corpus de calibração com ground truth de 2 anotadores.
3. Arquivo `decisoes/decisao_motor_ocr.md` redigido e completo.

**Condições de reprovação:** nenhum motor atinge todos os limiares.

**Ação corretiva:** refinar pré-processamento primeiro (nunca trocar motor antes de esgotar refinamento). Se após 2 iterações de refinamento nenhum motor atingir: escalar para decisão do líder técnico com documentação das métricas obtidas.

**Quem aprova:** líder técnico (engenheiro humano).

#### Gate 3 — Parser sketch aprovado

**Condições para aprovação (TODAS devem ser satisfeitas):**

1. Campos críticos com taxa de acerto ≥ 85% no corpus de calibração:
   - `transmitente_1_cpf` ≥ 85%
   - `matricula` (escritura) ≥ 85%
   - `matricula_numero` (matrícula) ≥ 85%
   - `transmitente_1_nome` ≥ 85%
2. Catálogo de âncoras cobre ≥ 80% dos campos da Seção 17 para ≥ 80% dos documentos.
3. Arquivo `decisoes/decisao_parser_sketch.md` redigido e completo.
4. Catálogo de âncoras publicado em `parser_sketch/catalogo_ancoras.json`.

**Condições de reprovação:** qualquer campo crítico abaixo de 85% OU cobertura de âncoras insuficiente.

**Ação corretiva:** expandir catálogo de âncoras; ajustar regexes; se problema é OCR, voltar ao Gate 2. Campos não-críticos que não atingem 85% são documentados como pendência para a Fase 1.

**Quem aprova:** líder técnico (engenheiro humano).

### 10.2. Critério de saída da Fase 0

A Fase 0 é declarada concluída quando TODAS as condições abaixo são verdadeiras:

| # | Condição | Verificação |
|---|---|---|
| 1 | Gate 1 aprovado | `decisoes/decisao_rasterizacao.md` existe e está assinado |
| 2 | Gate 2 aprovado | `decisoes/decisao_motor_ocr.md` existe e está assinado |
| 3 | Gate 3 aprovado | `decisoes/decisao_parser_sketch.md` existe e está assinado |
| 4 | Baseline congelado | `baseline/fase0_baseline_v1.json` existe, hash verificável |
| 5 | Corpus catalogado | `corpus/corpus_catalog.json` válido com ≥ 145 documentos |
| 6 | Ground truth completo para calibração | ≥ 30 documentos com ground truth de 2 anotadores |
| 7 | Catálogo de âncoras publicado | `parser_sketch/catalogo_ancoras.json` com cobertura ≥ 80% |
| 8 | Relatório final redigido | `relatorios/relatorio_final_fase0.md` completo |
| 9 | Todos os entregáveis presentes | Checklist da Seção 11 — todos os arquivos presentes e válidos |
| 10 | Aprovação do líder técnico | Assinatura no relatório final |

---

## SEÇÃO 11 — Entregáveis obrigatórios

| # | Arquivo | Formato | Quem produz | Critério de completude |
|---|---|---|---|---|
| 1 | `corpus/corpus_catalog.json` | JSON | Claude Code + anotador humano | ≥ 145 documentos catalogados; schema válido; todos os campos obrigatórios preenchidos |
| 2 | `corpus/anonimizados/**/*.pdf` | PDF | Anotador humano + script | ≥ 145 PDFs anonimizados; verificação por segundo anotador concluída |
| 3 | `corpus/ground_truth/*_gt.json` | JSON | Anotadores humanos | ≥ 30 documentos com 2 anotadores; restante com 1 anotador + revisão 20%; schema válido |
| 4 | `benchmarks/rasterizacao/resultados_rasterizacao.json` | JSON | Claude Code | 20 documentos × 2 bibliotecas × 2 DPIs; todos os campos preenchidos |
| 5 | `benchmarks/preprocessamento/preprocessamento_resultados.json` | JSON | Claude Code | 6 experimentos × corpus de calibração; CER antes/depois; inspeção visual |
| 6 | `benchmarks/ocr/ocr_benchmark_relatorio.json` | JSON | Claude Code | 2 motores × 30 documentos; CER por tipo de campo; gates calculados |
| 7 | `parser_sketch/catalogo_ancoras.json` | JSON | Claude Code + revisão humana | Cobertura ≥ 80% dos campos da Seção 17 |
| 8 | `parser_sketch/parser_sketch_resultados.json` | JSON | Claude Code | Taxa de acerto por campo para 30 documentos |
| 9 | `baseline/fase0_baseline_v1.json` | JSON | Claude Code | Pipeline completo executado sobre 30 documentos; hash verificável |
| 10 | `decisoes/decisao_rasterizacao.md` | Markdown | Claude Code + aprovação humana | Motor escolhido, métricas, justificativa |
| 11 | `decisoes/decisao_motor_ocr.md` | Markdown | Claude Code + aprovação humana | Motor escolhido, métricas, exceções se houver |
| 12 | `decisoes/decisao_parser_sketch.md` | Markdown | Claude Code + aprovação humana | Viabilidade confirmada, campos pendentes listados |
| 13 | `relatorios/relatorio_variabilidade_documental.md` | Markdown | Claude Code | Variações de formato observadas no corpus; diferenças entre tabelionatos/cartórios |
| 14 | `relatorios/relatorio_final_fase0.md` | Markdown | Claude Code + aprovação humana | Síntese de todas as decisões; métricas finais; recomendações para Fase 1 |
| 15 | `relatorios/log_execucao.md` | Markdown | Claude Code | Registro cronológico de todas as atividades executadas |

---

## SEÇÃO 12 — Instruções específicas para o Claude Code

### 12.1. Como iniciar

Primeiro comando a executar após receber este documento:

```bash
# 1. Criar o repositório
mkdir cartoriodoc-fase0
cd cartoriodoc-fase0
git init

# 2. Copiar este plano para o repositório
cp fase0_plano_execucao.md .

# 3. Executar o setup do ambiente
powershell -ExecutionPolicy Bypass -File scripts/setup_ambiente.ps1

# 4. Registrar início da execução no log
echo "# Log de Execução — Fase 0" > relatorios/log_execucao.md
echo "" >> relatorios/log_execucao.md
echo "## $(date)" >> relatorios/log_execucao.md
echo "- Ambiente configurado" >> relatorios/log_execucao.md
echo "- Node.js: $(node --version)" >> relatorios/log_execucao.md
echo "- Python: $(python --version)" >> relatorios/log_execucao.md
echo "- Tesseract: instalado" >> relatorios/log_execucao.md
```

### 12.2. Como reportar progresso

Para cada atividade concluída, adicionar ao `relatorios/log_execucao.md`:

```markdown
## [YYYY-MM-DD HH:MM] Atividade: [Nome da atividade]

**Status:** CONCLUÍDA / BLOQUEADA / EM ANDAMENTO
**Duração:** X horas
**Resumo:** [1-2 frases descrevendo o que foi feito]
**Resultados:** [Arquivo(s) gerado(s)]
**Problemas encontrados:** [Nenhum / descrição]
**Próxima atividade:** [Nome]
```

### 12.3. Como registrar decisões técnicas

Toda decisão técnica tomada durante a execução (escolha de parâmetro, ajuste de threshold, exclusão de documento) deve ser registrada em um dos três arquivos de decisão (`decisoes/decisao_*.md`) com:

- Data e hora
- Contexto: por que a decisão foi necessária
- Alternativas consideradas
- Decisão tomada
- Justificativa (dados que suportam a decisão)
- Impacto: o que muda no pipeline

### 12.4. Como lidar com documentos que não processam

Se um documento do corpus não consegue ser processado corretamente (rasterização falha, OCR produz lixo, parser não encontra nenhum campo):

1. **Não bloquear a execução.** Registrar o documento como `status: "ERRO"` no catálogo.
2. Registrar no log: documento_id, etapa que falhou, mensagem de erro.
3. Continuar com os demais documentos.
4. Ao final, se > 10% dos documentos falharam na mesma etapa, investigar a causa raiz e reportar como problema sistêmico.
5. Se ≤ 10% falharam, documentar como exceções e verificar se são documentos atípicos (protegidos, corrompidos, ou fora do escopo do MVP).

### 12.5. Como sinalizar gates para aprovação humana

Quando as condições de um gate são atingidas:

1. Redigir o arquivo de decisão correspondente (`decisoes/decisao_*.md`).
2. Adicionar ao log de execução:

```markdown
## [YYYY-MM-DD HH:MM] 🚩 GATE [N] — PRONTO PARA APROVAÇÃO

**Gate:** [Nome do gate]
**Condições verificadas:**
- [x] Condição 1: [resultado]
- [x] Condição 2: [resultado]
- [x] Condição N: [resultado]

**Arquivo de decisão:** decisoes/decisao_[x].md
**Ação requerida:** Aprovação do líder técnico
```

3. **Aguardar aprovação humana antes de prosseguir** para a próxima atividade que depende deste gate.

### 12.6. O que NUNCA fazer durante a Fase 0

1. **NUNCA** escrever código de produção (código destinado a integrar o produto final).
2. **NUNCA** modificar o plano v1.3 sem aprovação explícita do líder técnico.
3. **NUNCA** usar serviços externos ou internet durante a execução de benchmarks.
4. **NUNCA** usar IA generativa para processar documentos, extrair texto, ou tomar decisões.
5. **NUNCA** declarar um gate como aprovado sem sinalizar para aprovação humana.
6. **NUNCA** prosseguir para atividade dependente de um gate antes que o gate seja aprovado.
7. **NUNCA** excluir documentos do corpus para melhorar métricas sem documentar e justificar.
8. **NUNCA** alterar o ground truth para coincidir com o resultado do pipeline.

### 12.7. Checklist de encerramento da Fase 0

Antes de declarar a Fase 0 pronta para aprovação final, verificar:

```markdown
# Checklist de Encerramento — Fase 0

- [ ] `corpus/corpus_catalog.json` válido com ≥ 145 documentos
- [ ] ≥ 30 documentos com ground truth de 2 anotadores validado
- [ ] `benchmarks/rasterizacao/resultados_rasterizacao.json` completo
- [ ] `benchmarks/preprocessamento/preprocessamento_resultados.json` completo
- [ ] `benchmarks/ocr/ocr_benchmark_relatorio.json` completo
- [ ] `parser_sketch/catalogo_ancoras.json` com cobertura ≥ 80%
- [ ] `parser_sketch/parser_sketch_resultados.json` com campos críticos ≥ 85%
- [ ] `baseline/fase0_baseline_v1.json` congelado com hash verificável
- [ ] `decisoes/decisao_rasterizacao.md` redigido e aprovado
- [ ] `decisoes/decisao_motor_ocr.md` redigido e aprovado
- [ ] `decisoes/decisao_parser_sketch.md` redigido e aprovado
- [ ] `relatorios/relatorio_variabilidade_documental.md` completo
- [ ] `relatorios/relatorio_final_fase0.md` redigido
- [ ] `relatorios/log_execucao.md` atualizado até a última atividade
- [ ] Nenhum TODO, placeholder ou decisão pendente no repositório
- [ ] Todos os gates aprovados pelo líder técnico
- [ ] Líder técnico assinou o relatório final

**Status:** [ ] PRONTO PARA APROVAÇÃO FINAL
**Data:** ____________________
**Assinatura do líder técnico:** ____________________
```

---

*Fim do documento — Plano Executável da Fase 0, Versão 1.0*
