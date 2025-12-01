[CmdletBinding()]
param(
  [string]$Namespace = "schoolspace",
  [string]$FrontendPort = "3040",
  [string]$ManifestFile = "schoolspace.yaml"
)

function Write-Status([string]$msg, [string]$color = "Cyan") {
  Write-Host ("[SETUP] $msg") -ForegroundColor $color
}

Write-Status "Checking dependencies..."

$dockerCmd = Get-Command docker -ErrorAction SilentlyContinue
if (-not $dockerCmd) {
  Write-Error "Docker not detected or not on PATH."
  exit 1
}
$dockerVersion = (& docker version --format '{{.Server.Version}}' 2>$null)
Write-Status "Docker: $dockerVersion"

$kubectlCmd = Get-Command kubectl -ErrorAction SilentlyContinue
if (-not $kubectlCmd) {
  Write-Error "kubectl not detected or not on PATH."
  exit 1
}
$kubectlVersion = & kubectl version --client=true
Write-Status "Kubectl: $kubectlVersion"

Write-Status "Building ARM64 Docker images..."

$root = Resolve-Path (Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Definition) "..")
$frontendPath = Join-Path $root "frontend"
$backendPath  = Join-Path $root "backend"

Push-Location $backendPath

Write-Status "Running Prisma generate (local check)..."
npx prisma generate

Write-Status "Building backend image (includes prisma migrate deploy on startup)..."
docker buildx build --platform linux/arm64 `
  -t schoolspace-backend:latest `
  --build-arg RUN_PRISMA_GENERATE=true `
  .

if ($LASTEXITCODE -ne 0) {
  Write-Error "Backend image build failed."
  exit 1
}
Pop-Location

Push-Location $frontendPath
docker buildx build --platform linux/arm64 -t schoolspace-frontend:latest .
if ($LASTEXITCODE -ne 0) {
  Write-Error "Frontend image build failed."
  exit 1
}
Pop-Location

Write-Status "Docker images built successfully."

$manifest = Join-Path $root $ManifestFile
if (-not (Test-Path $manifest)) {
  Write-Error "schoolspace.yaml not found at $manifest"
  exit 1
}

Write-Status "Applying Kubernetes manifests from $ManifestFile..."
kubectl apply -f $manifest | Write-Host

Write-Status "Waiting for pods in namespace '$Namespace' to become Ready..."

$retries = 0
do {
  Start-Sleep -Seconds 5
  $status = & kubectl get pods -n $Namespace --no-headers 2>$null

  $ready = ($status -match "Running") -and ($status -notmatch "CrashLoopBackOff")
  $retries++

  if ($ready) { break }
  if ($retries -ge 24) {
    Write-Warning "Timeout waiting for pods to be Ready."
    break
  }
} while (-not $ready)

Write-Status "Current pod status:"
kubectl get pods -n $Namespace

Write-Status "Starting port-forward to http://localhost:$FrontendPort ..."
Write-Host "Press Ctrl+C to stop the port-forward."

Start-Process -NoNewWindow powershell -ArgumentList @(
  "-NoProfile", "-Command",
  "kubectl port-forward -n $Namespace svc/frontend $FrontendPort`:80"
)

Write-Host ""
Write-Host "To clean up all resources later, run:" -ForegroundColor Yellow
Write-Host "  kubectl delete namespace $Namespace" -ForegroundColor Yellow
