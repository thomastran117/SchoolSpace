[CmdletBinding()]
param(
  [string]$Namespace    = "schoolspace",
  [int]   $FrontendPort = 3040,
  [int]   $BackendPort  = 8040
)

$ErrorActionPreference = "Stop"

function Info($msg)    { Write-Host "[K8S ] $msg" -ForegroundColor Cyan }
function Success($msg) { Write-Host "[ OK ] $msg" -ForegroundColor Green }
function Warn($msg)    { Write-Host "[WARN] $msg" -ForegroundColor Yellow }
function Fail($msg)    { Write-Host "[ERR ] $msg" -ForegroundColor Red; exit 1 }

Info "Checking dependencies..."

foreach ($cmd in @("docker", "kubectl")) {
  if (-not (Get-Command $cmd -ErrorAction SilentlyContinue)) {
    Fail "$cmd not found on PATH"
  }
}

Success "All dependencies found"

$root = Resolve-Path (Join-Path (Split-Path $MyInvocation.MyCommand.Path) "../..")

$frontendPath = Join-Path $root "frontend"
$backendPath  = Join-Path $root "backend"
$workerPath   = Join-Path $root "worker"
$manifest     = Join-Path $root "schoolspace.yml"

Info "Building Docker images..."

docker build -t school-frontend:latest $frontendPath | Out-Null
docker build -t school-backend:latest  $backendPath  | Out-Null
docker build -t school-worker:latest   $workerPath   | Out-Null

Success "Docker images built"

Info "Applying Kubernetes manifests..."
kubectl apply -f $manifest | Out-Null
Success "Manifests applied"

Info "Waiting for deployments..."
kubectl rollout status deployment/frontend -n $Namespace --timeout=120s | Out-Null
kubectl rollout status deployment/backend  -n $Namespace --timeout=120s | Out-Null
kubectl rollout status deployment/worker   -n $Namespace --timeout=120s | Out-Null

Success "All deployments ready"

Info "Current pod status:"
kubectl get pods -n $Namespace

Warn "Starting port-forwards (Ctrl+C to stop)"

Start-Process powershell -NoNewWindow -ArgumentList @(
  "-NoProfile",
  "-Command",
  "kubectl port-forward -n $Namespace svc/frontend $FrontendPort`:3040 > `$null 2>&1"
)

Start-Process powershell -NoNewWindow -ArgumentList @(
  "-NoProfile",
  "-Command",
  "kubectl port-forward -n $Namespace svc/backend $BackendPort`:8040 > `$null 2>&1"
)

Write-Host ""
Success "Dev environment is ready"
Write-Host "  Frontend: http://localhost:$FrontendPort" -ForegroundColor White
Write-Host "  Backend : http://localhost:$BackendPort"  -ForegroundColor White

Write-Host ""
Write-Host "Cleanup later:" -ForegroundColor Yellow
Write-Host "  kubectl delete namespace $Namespace" -ForegroundColor Yellow
