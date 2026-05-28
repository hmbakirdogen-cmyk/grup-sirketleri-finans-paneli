param(
  [int]$Port = 3000,
  [switch]$NoBrowser
)

$ErrorActionPreference = 'Stop'

function Write-Step {
  param([string]$Message)
  Write-Host "[Grup Finans] $Message" -ForegroundColor Cyan
}

function Get-FileHashSafe {
  param([string]$Path)

  if (-not (Test-Path $Path)) {
    return $null
  }

  return (Get-FileHash -Path $Path -Algorithm SHA256).Hash
}

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$url = "http://127.0.0.1:$Port/"
$stdoutLog = Join-Path $repoRoot 'vite-finans.out.log'
$stderrLog = Join-Path $repoRoot 'vite-finans.err.log'

Set-Location $repoRoot

$branchName = (git rev-parse --abbrev-ref HEAD).Trim()
if ($LASTEXITCODE -ne 0) {
  throw 'Aktif git dali okunamadi.'
}

$gitStatus = git status --porcelain
if ($LASTEXITCODE -ne 0) {
  throw 'Git durumu okunamadi.'
}

if ([string]::IsNullOrWhiteSpace($gitStatus)) {
  Write-Step "GitHub'dan en guncel surum aliniyor ($branchName)..."
  git pull --ff-only origin $branchName
  if ($LASTEXITCODE -ne 0) {
    throw 'GitHub guncellemesi basarisiz oldu.'
  }
}
else {
  Write-Warning 'Yerel degisiklikler bulundu. Dosyalari ezmemek icin otomatik guncelleme atlandi.'
}

$rootLockPath = Join-Path $repoRoot 'package-lock.json'
$installedLockPath = Join-Path $repoRoot 'node_modules/.package-lock.json'
$needsInstall = -not (Test-Path (Join-Path $repoRoot 'node_modules'))

if (-not $needsInstall) {
  $rootHash = Get-FileHashSafe -Path $rootLockPath
  $installedHash = Get-FileHashSafe -Path $installedLockPath
  $needsInstall = $rootHash -ne $installedHash
}

if ($needsInstall) {
  Write-Step 'Bagimliliklar guncelleniyor...'
  npm install --legacy-peer-deps
  if ($LASTEXITCODE -ne 0) {
    throw 'npm install basarisiz oldu.'
  }
}
else {
  Write-Step 'Bagimliliklar zaten guncel.'
}

$listeners = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
if ($listeners) {
  $processIds = $listeners | Select-Object -ExpandProperty OwningProcess -Unique
  foreach ($processId in $processIds) {
    Write-Step "Port $Port kullanan surec durduruluyor (PID $processId)..."
    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
  }
  Start-Sleep -Seconds 1
}

Remove-Item $stdoutLog, $stderrLog -Force -ErrorAction SilentlyContinue

Write-Step "Panel baslatiliyor: $url"
$devProcess = Start-Process `
  -FilePath 'npm.cmd' `
  -ArgumentList 'run', 'dev', '--', '--host', '127.0.0.1', '--port', $Port, '--strictPort' `
  -WorkingDirectory $repoRoot `
  -RedirectStandardOutput $stdoutLog `
  -RedirectStandardError $stderrLog `
  -WindowStyle Hidden `
  -PassThru

$deadline = (Get-Date).AddSeconds(45)
$isReady = $false

while ((Get-Date) -lt $deadline) {
  Start-Sleep -Milliseconds 750

  if ($devProcess.HasExited) {
    break
  }

  try {
    $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) {
      $isReady = $true
      break
    }
  }
  catch {
  }
}

if (-not $isReady) {
  $stdoutTail = if (Test-Path $stdoutLog) { (Get-Content $stdoutLog -Tail 20) -join "`n" } else { 'Stdout log yok.' }
  $stderrTail = if (Test-Path $stderrLog) { (Get-Content $stderrLog -Tail 20) -join "`n" } else { 'Stderr log yok.' }
  throw "Panel baslatilamadi.`n`nSTDOUT:`n$stdoutTail`n`nSTDERR:`n$stderrTail"
}

if (-not $NoBrowser) {
  Start-Process $url
}

Write-Step "Panel hazir: $url"
