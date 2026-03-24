# Backend Publish Script (PowerShell)
# Usage: .\publish-backend.ps1

$SERVER = "76.13.36.5"
$USER = "root"

Write-Host "=========================================="
Write-Host "PUBLISHING BACKEND"
Write-Host "=========================================="

# Kill old process
Write-Host "[1/5] Stopping old service..."
ssh ${USER}@${SERVER} "pkill -9 dotnet || true"
Start-Sleep -Seconds 2

# Upload source files
Write-Host "[2/5] Uploading source files..."
ssh ${USER}@${SERVER} "rm -rf /tmp/elmanassa_deploy && mkdir -p /tmp/elmanassa_deploy"
scp -r elmanassa_backend\elmanassa\* ${USER}@${SERVER}:/tmp/elmanassa_deploy/

# Build on server
Write-Host "[3/5] Building..."
ssh ${USER}@${SERVER} "cd /tmp/elmanassa_deploy && dotnet build -c Release 2>&1" | Select-String -Pattern "error|Build succeeded|Build FAILED"
Write-Host "Build completed!"

# Publish
Write-Host "[4/5] Publishing..."
ssh ${USER}@${SERVER} "cd /tmp/elmanassa_deploy && dotnet publish -c Release -o /var/www/elmanassa_backend --force 2>&1"
Write-Host "Published!" -ForegroundColor Green

# Create appsettings
Write-Host "[5/5] Creating appsettings..."
$APPSETTINGS = @'
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
'@
ssh ${USER}@${SERVER} "cat > /var/www/elmanassa_backend/appsettings.json << 'EOF'
$APPSETTINGS
EOF"
Write-Host "Appsettings created!" -ForegroundColor Green

# Start service
Write-Host ""
Write-Host "Starting service..."
ssh ${USER}@${SERVER} "cd /var/www/elmanassa_backend && ASPNETCORE_ENVIRONMENT=Development nohup dotnet elmanassa.dll --urls='http://0.0.0.0:5000' > /tmp/backend_prod.log 2>&1 &"
Start-Sleep -Seconds 8

# Test
Write-Host ""
Write-Host "=========================================="
Write-Host "TESTING"
Write-Host "=========================================="
$SUBJECTS = ssh ${USER}@${SERVER} "curl -s -o /dev/null -w '%{http_code}' http://localhost:5000/api/v1/subjects"
$POPULAR = ssh ${USER}@${SERVER} "curl -s -o /dev/null -w '%{http_code}' http://localhost:5000/api/v1/subjects/popular"

Write-Host "GET /api/v1/subjects: $SUBJECTS"
Write-Host "GET /api/v1/subjects/popular: $POPULAR"

if ($SUBJECTS -eq "200" -and $POPULAR -eq "200") {
    Write-Host ""
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host "BACKEND DEPLOYED SUCCESSFULLY!" -ForegroundColor Green
    Write-Host "==========================================" -ForegroundColor Green
}
