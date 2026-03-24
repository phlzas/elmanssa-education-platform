# Publish Both Backend and Frontend (PowerShell)
# Usage: .\publish-all.ps1

Write-Host "=========================================="
Write-Host "PUBLISHING BACKEND AND FRONTEND"
Write-Host "=========================================="

# Publish Backend
Write-Host ""
Write-Host ">>> PUBLISHING BACKEND <<<"
.\publish-backend.ps1

# Publish Frontend
Write-Host ""
Write-Host ">>> PUBLISHING FRONTEND <<<"
.\publish-frontend.ps1

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "ALL DONE!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
