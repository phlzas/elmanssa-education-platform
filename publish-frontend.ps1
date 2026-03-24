# Frontend Publish Script (PowerShell)
# Usage: .\publish-frontend.ps1

$SERVER = "76.13.36.5"
$USER = "root"

Write-Host "=========================================="
Write-Host "PUBLISHING FRONTEND"
Write-Host "=========================================="

# Build
Write-Host "[1/3] Building frontend..."
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "BUILD FAILED!" -ForegroundColor Red
    exit 1
}
Write-Host "Build successful!" -ForegroundColor Green

# Upload
Write-Host "[2/3] Uploading files..."
ssh ${USER}@${SERVER} "rm -rf /var/www/elmanssa.com/*"
scp -r dist/* ${USER}@${SERVER}:/var/www/elmanssa.com/

# Create default image
ssh ${USER}@${SERVER} "cp /var/www/elmanssa.com/assets/courses/web_dev_cover_1774214853072.png /var/www/elmanssa.com/assets/courses/default.png 2>/dev/null || true"

Write-Host "Files uploaded!" -ForegroundColor Green

# Test
Write-Host "[3/3] Testing..."
$STATUS = ssh ${USER}@${SERVER} "curl -s -o /dev/null -w '%{http_code}' http://localhost/"

Write-Host ""
Write-Host "=========================================="
if ($STATUS -eq "200") {
    Write-Host "FRONTEND DEPLOYED SUCCESSFULLY!" -ForegroundColor Green
} else {
    Write-Host "WARNING: Website returned status $STATUS" -ForegroundColor Yellow
}
Write-Host "=========================================="
Write-Host "URL: https://elmanssa.com"
