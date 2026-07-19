try {
  $r = Invoke-WebRequest -Uri 'http://localhost:8081' -TimeoutSec 10
  Write-Host "Status: $($r.StatusCode)"
} catch {
  Write-Host "Error: $($_.Exception.Message)"
}
