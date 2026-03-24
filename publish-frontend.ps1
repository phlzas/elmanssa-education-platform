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
ssh -o StrictHostKeyChecking=no $USER@$SERVER "rm -rf /var/www/elmanssa.com/* && mkdir -p /var/www/elmanssa.com/assets/courses"

# Upload all files
$DIST_DIR = "dist"
Get-ChildItem -Path $DIST_DIR -Recurse -File | ForEach-Object {
    $REL_PATH = $_.FullName.Substring($DIST_DIR.Length + 1).Replace("\", "/")
    $REMOTE_DIR = Split-Path $REL_PATH -Parent
    
    # Create remote directory
    ssh -o StrictHostKeyChecking=no $USER@$SERVER "mkdir -p /var/www/elmanssa.com/$REMOTE_DIR" 2>$null
    
    # Upload file
    scp -o StrictHostKeyChecking=no $_.FullName "${USER}@`$SERVER:/var/www/elmanssa.com/$REL_PATH" 2>$null
}

# Create default image
ssh -o StrictHostKeyChecking=no $USER@$SERVER "cp /var/www/elmanssa.com/assets/courses/web_dev_cover_1774214853072.png /var/www/elmanssa.com/assets/courses/default.png 2>/dev/null || true"

Write-Host "Files uploaded!" -ForegroundColor Green

# Test
Write-Host "[3/3] Testing..."
$STATUS = ssh -o StrictHostKeyChecking=no $USER@$SERVER "curl -s -o /dev/null -w '%{http_code}' http://localhost/"

Write-Host ""
Write-Host "=========================================="
if ($STATUS -eq "200") {
    Write-Host "FRONTEND DEPLOYED SUCCESSFULLY!" -ForegroundColor Green
} else {
    Write-Host "WARNING: Website returned status $STATUS" -ForegroundColor Yellow
}
Write-Host "=========================================="
Write-Host "URL: https://elmanssa.com"
