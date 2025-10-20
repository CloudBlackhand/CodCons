# Script para instalar Railway CLI no Windows
Write-Host "Instalando Railway CLI..." -ForegroundColor Green

# Criar diretório temporário
$tempDir = "$env:TEMP\railway-install"
if (!(Test-Path $tempDir)) {
    New-Item -ItemType Directory -Path $tempDir -Force
}

# URL do Railway CLI para Windows
$railwayUrl = "https://github.com/railwayapp/cli/releases/latest/download/railway_windows_amd64.zip"
$zipFile = "$tempDir\railway.zip"
$extractDir = "$tempDir\railway"

try {
    Write-Host "Baixando Railway CLI..." -ForegroundColor Yellow
    Invoke-WebRequest -Uri $railwayUrl -OutFile $zipFile -UseBasicParsing
    
    Write-Host "Extraindo arquivos..." -ForegroundColor Yellow
    Expand-Archive -Path $zipFile -DestinationPath $extractDir -Force
    
    # Mover executável para pasta do sistema
    $railwayExe = "$extractDir\railway.exe"
    if (Test-Path $railwayExe) {
        $targetDir = "$env:USERPROFILE\.local\bin"
        if (!(Test-Path $targetDir)) {
            New-Item -ItemType Directory -Path $targetDir -Force
        }
        
        Copy-Item $railwayExe "$targetDir\railway.exe" -Force
        Write-Host "Railway CLI instalado em: $targetDir\railway.exe" -ForegroundColor Green
        
        # Adicionar ao PATH do usuário
        $userPath = [Environment]::GetEnvironmentVariable("PATH", "User")
        if ($userPath -notlike "*$targetDir*") {
            [Environment]::SetEnvironmentVariable("PATH", "$userPath;$targetDir", "User")
            Write-Host "Adicionado ao PATH do usuário. Reinicie o terminal para usar 'railway' command." -ForegroundColor Cyan
        }
    }
    
    # Limpar arquivos temporários
    Remove-Item $tempDir -Recurse -Force
    
    Write-Host "Instalação concluída!" -ForegroundColor Green
    Write-Host "Execute 'railway --version' para verificar a instalação." -ForegroundColor Cyan
    
} catch {
    Write-Host "Erro na instalação: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Tentando método alternativo..." -ForegroundColor Yellow
    
    # Método alternativo - usar npm se disponível
    try {
        $npmVersion = npm --version
        Write-Host "NPM encontrado: $npmVersion" -ForegroundColor Green
        Write-Host "Instalando Railway CLI via NPM..." -ForegroundColor Yellow
        npm install -g @railway/cli
        Write-Host "Instalação via NPM concluída!" -ForegroundColor Green
    } catch {
        Write-Host "NPM não disponível. Instale Node.js primeiro ou use o método manual." -ForegroundColor Red
    }
}
