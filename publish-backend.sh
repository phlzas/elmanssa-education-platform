#!/bin/bash
# Backend Publish Script
# Usage: bash publish-backend.sh

SERVER="76.13.36.5"
USER="root"
PASSWORD="elmanssa1234.COM"
PROJECT_DIR="/root/backup/elmanassa_backend/elmanassa"
DEPLOY_DIR="/var/www/elmanassa_backend"

echo "=========================================="
echo "PUBLISHING BACKEND"
echo "=========================================="

# Kill old process
echo "[1/5] Stopping old service..."
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $USER@$SERVER "pkill -9 dotnet || true"
sleep 2

# Build
echo "[2/5] Building..."
BUILD_OUTPUT=$(sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $USER@$SERVER "cd $PROJECT_DIR && dotnet build -c Release 2>&1")
if echo "$BUILD_OUTPUT" | grep -q "error CS"; then
    echo "BUILD FAILED!"
    echo "$BUILD_OUTPUT" | tail -20
    exit 1
fi
echo "Build successful!"

# Publish
echo "[3/5] Publishing..."
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $USER@$SERVER "cd $PROJECT_DIR && dotnet publish -c Release -o $DEPLOY_DIR --force 2>&1"
echo "Published!"

# Create appsettings
echo "[4/5] Creating appsettings..."
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $USER@$SERVER "cat > $DEPLOY_DIR/appsettings.json << 'EOF'
{
  \"ConnectionStrings\": {
    \"DefaultConnection\": \"Host=127.0.0.1;Database=elmanssa_datebase;Username=elmanassa_database;Password=elmanssa1234.COM;Pooling=false\"
  },
  \"JwtSettings\": {
    \"Secret\": \"your-super-secret-key-that-is-at-least-32-characters-long-change-this\",
    \"Issuer\": \"elmanassa-api\",
    \"Audience\": \"elmanassa-clients\",
    \"ExpiryInHours\": 24
  },
  \"EmailSettings\": {
    \"SmtpHost\": \"mail.elmanssa.com\",
    \"SmtpPort\": 587,
    \"SmtpUser\": \"cloud@elmanssa.com\",
    \"SmtpPassword\": \"cloud123\",
    \"EnableSsl\": true,
    \"FromEmail\": \"cloud@elmanssa.com\",
    \"FromName\": \"Elmanssa Platform\"
  },
  \"Logging\": {
    \"LogLevel\": {
      \"Default\": \"Information\",
      \"Microsoft.AspNetCore\": \"Warning\"
    }
  },
  \"AllowedHosts\": \"*\"
}
EOF"
echo "Appsettings created!"

# Start service
echo "[5/5] Starting service..."
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $USER@$SERVER "cd $DEPLOY_DIR && ASPNETCORE_ENVIRONMENT=Development nohup dotnet elmanassa.dll --urls=\"http://0.0.0.0:5000\" > /tmp/backend_prod.log 2>&1 &"
sleep 8

# Test
echo ""
echo "=========================================="
echo "TESTING"
echo "=========================================="
SUBJECTS=$(sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $USER@$SERVER "curl -s -o /dev/null -w '%{http_code}' http://localhost:5000/api/v1/subjects")
COURSES=$(sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $USER@$SERVER "curl -s -o /dev/null -w '%{http_code}' http://localhost:5000/api/v1/courses")

echo "GET /api/v1/subjects: $SUBJECTS"
echo "GET /api/v1/courses: $COURSES"

if [ "$SUBJECTS" = "200" ] && [ "$COURSES" = "200" ]; then
    echo ""
    echo "=========================================="
    echo "BACKEND DEPLOYED SUCCESSFULLY!"
    echo "=========================================="
else
    echo ""
    echo "WARNING: Some endpoints returned errors. Check logs."
fi
