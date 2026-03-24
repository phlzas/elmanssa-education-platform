# Backend Publish Script (PowerShell)
# Usage: .\publish-backend.ps1

$SERVER = "76.13.36.5"
$USER = "root"
$PASSWORD = "elmanssa1234.COM"

Write-Host "=========================================="
Write-Host "PUBLISHING BACKEND"
Write-Host "=========================================="

# Kill old process
Write-Host "[1/5] Stopping old service..."
ssh -o StrictHostKeyChecking=no $USER@$SERVER "pkill -9 dotnet || true"
Start-Sleep -Seconds 2

# Build
Write-Host "[2/5] Building..."
ssh -o StrictHostKeyChecking=no $USER@$SERVER "cd /root/backup/elmanassa_backend/elmanassa && dotnet build -c Release 2>&1"
if ($LASTEXITCODE -ne 0) {
    Write-Host "BUILD FAILED!" -ForegroundColor Red
    exit 1
}
Write-Host "Build successful!" -ForegroundColor Green

# Publish
Write-Host "[3/5] Publishing..."
ssh -o StrictHostKeyChecking=no $USER@$SERVER "cd /root/backup/elmanassa_backend/elmanassa && dotnet publish -c Release -o /var/www/elmanassa_backend --force 2>&1"
Write-Host "Published!" -ForegroundColor Green

# Create appsettings
Write-Host "[4/5] Creating appsettings..."
$APPSETTINGS = @"
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=127.0.0.1;Database=elmanssa_datebase;Username=elmanassa_database;Password=elmanssa1234.COM;Pooling=false"
  },
  "JwtSettings": {
    "Secret": "your-super-secret-key-that-is-at-least-32-characters-long-change-this",
    "Issuer": "elmanassa-api",
    "Audience": "elmanassa-clients",
    "ExpiryInHours": 24
  },
  "EmailSettings": {
    "SmtpHost": "mail.elmanssa.com",
    "SmtpPort": 587,
    "SmtpUser": "cloud@elmanssa.com",
    "SmtpPassword": "cloud123",
    "EnableSsl": true,
    "FromEmail": "cloud@elmanssa.com",
    "FromName": "Elmanssa Platform"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}
"@
ssh -o StrictHostKeyChecking=no $USER@$SERVER "cat > /var/www/elmanassa_backend/appsettings.json << 'EOF'
$APPSETTINGS
EOF"
Write-Host "Appsettings created!" -ForegroundColor Green

# Start service
Write-Host "[5/5] Starting service..."
ssh -o StrictHostKeyChecking=no $USER@$SERVER "cd /var/www/elmanassa_backend && ASPNETCORE_ENVIRONMENT=Development nohup dotnet elmanassa.dll --urls='http://0.0.0.0:5000' > /tmp/backend_prod.log 2>&1 &"
Start-Sleep -Seconds 8

# Test
Write-Host ""
Write-Host "=========================================="
Write-Host "TESTING"
Write-Host "=========================================="
$SUBJECTS = ssh -o StrictHostKeyChecking=no $USER@$SERVER "curl -s -o /dev/null -w '%{http_code}' http://localhost:5000/api/v1/subjects"
$COURSES = ssh -o StrictHostKeyChecking=no $USER@$SERVER "curl -s -o /dev/null -w '%{http_code}' http://localhost:5000/api/v1/courses"

Write-Host "GET /api/v1/subjects: $SUBJECTS"
Write-Host "GET /api/v1/courses: $COURSES"

if ($SUBJECTS -eq "200" -and $COURSES -eq "200") {
    Write-Host ""
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host "BACKEND DEPLOYED SUCCESSFULLY!" -ForegroundColor Green
    Write-Host "==========================================" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "WARNING: Some endpoints returned errors. Check logs." -ForegroundColor Yellow
}
