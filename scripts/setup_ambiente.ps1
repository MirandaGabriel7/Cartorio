# setup_ambiente.ps1 — Setup completo do ambiente da Fase 0
# Executar como Administrador no PowerShell

Write-Host "=== CartorioDoc Fase 0 - Setup do Ambiente ===" -ForegroundColor Cyan

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
Write-Host "=== Setup concluido com sucesso ===" -ForegroundColor Cyan
Write-Host "Proximo passo: coletar documentos do corpus e colocar em corpus/originais/" -ForegroundColor White
