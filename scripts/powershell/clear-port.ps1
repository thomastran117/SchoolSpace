$ErrorActionPreference = "Stop"

$ports = @(3040, 8040)

foreach ($port in $ports) {
    Write-Host ""
    Write-Host "Checking port $port..."

    $connections = netstat -ano | Select-String ":$port\s"

    if (-not $connections) {
        Write-Host "  No process found using port $port"
        continue
    }

    foreach ($line in $connections) {
        $parts = $line -split "\s+"
        $ppid = $parts[-1]

        if ($ppid -and $ppid -ne "0") {
            try {
                $proc = Get-Process -Id $ppid -ErrorAction Stop
                Write-Host "  Killing PID $ppid ($($proc.ProcessName)) on port $port"
                Stop-Process -Id $ppid -Force
            }
            catch {
                Write-Host "  Failed to kill PID $ppid (may have already exited)"
            }
        }
    }
}

Write-Host ""
Write-Host "Done. Ports 3040 and 8040 should now be free."
