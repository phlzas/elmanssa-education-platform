#!/bin/bash
# Backend Publish Script
# Usage: bash publish-backend.sh

echo "=========================================="
echo "PUBLISHING BACKEND"
echo "=========================================="

# Kill old process
echo "[1/5] Stopping old service..."
ssh root@76.13.36.5 "pkill -9 dotnet || true"
sleep 2

# Upload source files
echo "[2/5] Uploading source files..."
ssh root@76.13.36.5 "rm -rf /tmp/elmanassa_deploy && mkdir -p /tmp/elmanassa_deploy"
scp -r elmanassa_backend/elmanassa/* root@76.13.36.5:/tmp/elmanassa_deploy/

# Build on server
echo "[3/5] Building..."
ssh root@76.13.36.5 "cd /tmp/elmanassa_deploy && dotnet build -c Release 2>&1" | grep -E "error|Build succeeded|Build FAILED"
if [ $? -ne 0 ]; then
    echo "Build successful!"
else
    echo "BUILD FAILED!"
    exit 1
fi

# Publish
echo "[4/5] Publishing..."
ssh root@76.13.36.5 "cd /tmp/elmanassa_deploy && dotnet publish -c Release -o /var/www/elmanassa_backend --force 2>&1"
echo "Published!"

# Create appsettings
echo "[5/5] Creating appsettings..."
ssh root@76.13.36.5 'cat > /var/www/elmanassa_backend/appsettings.json << '"'"'EOF'"'"'
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
EOF'
echo "Appsettings created!"

# Start service
echo ""
echo "Starting service..."
ssh root@76.13.36.5 'cd /var/www/elmanassa_backend && ASPNETCORE_ENVIRONMENT=Development nohup dotnet elmanassa.dll --urls="http://0.0.0.0:5000" > /tmp/backend_prod.log 2>&1 &'
sleep 8

# Test
echo ""
echo "=========================================="
echo "TESTING"
echo "=========================================="
SUBJECTS=$(ssh root@76.13.36.5 "curl -s -o /dev/null -w '%{http_code}' http://localhost:5000/api/v1/subjects")
POPULAR=$(ssh root@76.13.36.5 "curl -s -o /dev/null -w '%{http_code}' http://localhost:5000/api/v1/subjects/popular")

echo "GET /api/v1/subjects: $SUBJECTS"
echo "GET /api/v1/subjects/popular: $POPULAR"

if [ "$SUBJECTS" = "200" ] && [ "$POPULAR" = "200" ]; then
    echo ""
    echo "=========================================="
    echo "BACKEND DEPLOYED SUCCESSFULLY!"
    echo "=========================================="
fi
