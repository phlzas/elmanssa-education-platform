#!/bin/bash
# Frontend Publish Script
# Usage: bash publish-frontend.sh

echo "=========================================="
echo "PUBLISHING FRONTEND"
echo "=========================================="

# Build
echo "[1/3] Building frontend..."
npm run build
if [ $? -ne 0 ]; then
    echo "BUILD FAILED!"
    exit 1
fi
echo "Build successful!"

# Upload
echo "[2/3] Uploading files..."
ssh root@76.13.36.5 "rm -rf /var/www/elmanssa.com/*"
scp -r dist/* root@76.13.36.5:/var/www/elmanssa.com/

# Create default image
ssh root@76.13.36.5 "cp /var/www/elmanssa.com/assets/courses/web_dev_cover_1774214853072.png /var/www/elmanssa.com/assets/courses/default.png 2>/dev/null || true"

echo "Files uploaded!"

# Test
echo "[3/3] Testing..."
STATUS=$(ssh root@76.13.36.5 "curl -s -o /dev/null -w '%{http_code}' http://localhost/")

echo ""
echo "=========================================="
if [ "$STATUS" = "200" ]; then
    echo "FRONTEND DEPLOYED SUCCESSFULLY!"
else
    echo "WARNING: Website returned status $STATUS"
fi
echo "=========================================="
echo "URL: https://elmanssa.com"
