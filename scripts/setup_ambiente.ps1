# setup_ambiente.ps1 — Setup completo do ambiente da Fase 0
# Executar como Administrador no PowerShell
# Python 3.11 via Windows py launcher; dependencias isoladas em .venv

Write-Host "=== CartorioDoc Fase 0 - Setup do Ambiente ===" -ForegroundColor Cyan

# 1. Verificar Node.js 20 LTS
$nodeVersion = node --version 2>$null
if (-not $nodeVersion -or -not $nodeVersion.StartsWith("v20")) {
    Write-Host "ERRO: Node.js 20 LTS nao encontrado (encontrado: $nodeVersion). Instale v20 LTS de https://nodejs.org/" -ForegroundColor Red
    exit 1
}
Write-Host "Node.js: $nodeVersion" -ForegroundColor Green

# 2. Verificar Python 3.11 via py launcher
$py311Version = py -3.11 --version 2>$null
if (-not $py311Version -or -not $py311Version.Contains("3.11")) {
    Write-Host "ERRO: Python 3.11.x nao encontrado via py launcher (py -3.11). Instale Python 3.11 de https://www.python.org/" -ForegroundColor Red
    exit 1
}
Write-Host "Python 3.11: $py311Version (via py -3.11)" -ForegroundColor Green

# 3. Verificar Tesseract 5
$tessVersion = tesseract --version 2>$null
if (-not $tessVersion) {
    Write-Host "ERRO: Tesseract 5 nao encontrado no PATH." -ForegroundColor Red
    exit 1
}
Write-Host "Tesseract: instalado" -ForegroundColor Green

# 4. Verificar modelo tessdata_best para portugues
$tessdata = "C:\Program Files\Tesseract-OCR\tessdata\por.traineddata"
if (-not (Test-Path $tessdata)) {
    Write-Host "ERRO: Modelo por.traineddata nao encontrado em tessdata." -ForegroundColor Red
    exit 1
}
Write-Host "Modelo portugues tessdata_best: presente" -ForegroundColor Green

# 5. Criar .venv com Python 3.11 se nao existir
if (-not (Test-Path ".venv\Scripts\python.exe")) {
    Write-Host "Criando .venv com Python 3.11..." -ForegroundColor Yellow
    py -3.11 -m venv .venv
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERRO: Falha ao criar .venv." -ForegroundColor Red
        exit 1
    }
    Write-Host ".venv criado com Python 3.11." -ForegroundColor Green
} else {
    $venvPyVer = .venv\Scripts\python.exe --version 2>$null
    Write-Host ".venv existente: $venvPyVer" -ForegroundColor Green
}

# 6. Instalar dependencias Node.js
Write-Host "Instalando dependencias Node.js..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: npm install falhou." -ForegroundColor Red
    exit 1
}
Write-Host "Dependencias Node.js instaladas." -ForegroundColor Green

# 7. Instalar dependencias Python no .venv
Write-Host "Instalando dependencias Python no .venv (Python 3.11)..." -ForegroundColor Yellow
.venv\Scripts\pip.exe install -r requirements.txt
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: pip install falhou. Verifique requirements.txt e conectividade." -ForegroundColor Red
    exit 1
}
Write-Host "Dependencias Python instaladas no .venv." -ForegroundColor Green

# 8. Compilar TypeScript
Write-Host "Compilando TypeScript..." -ForegroundColor Yellow
npx tsc --noEmit
if ($LASTEXITCODE -ne 0) {
    Write-Host "AVISO: Erros de compilacao TypeScript. Verifique tsconfig.json." -ForegroundColor Yellow
}

# 9. Criar diretorios de trabalho
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
Write-Host "Diretorios criados." -ForegroundColor Green

Write-Host ""
Write-Host "=== Setup concluido com sucesso ===" -ForegroundColor Cyan
Write-Host "Proximo passo: coletar documentos do corpus em corpus/originais/" -ForegroundColor White
