try {
  $r = Invoke-WebRequest -Uri 'http://localhost:8055/admin' -TimeoutSec 5
  Write-Host "Admin: Status $($r.StatusCode)"
} catch {
  Write-Host "Admin: FAIL - $($_.Exception.Message)"
}
try {
  $r = Invoke-WebRequest -Uri 'http://localhost:8055/items/diseases' -TimeoutSec 5
  Write-Host "API: Status $($r.StatusCode)"
} catch {
  Write-Host "API: FAIL - $($_.Exception.Message)"
}
