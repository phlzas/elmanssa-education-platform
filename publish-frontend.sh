#!/bin/bash
# Frontend Publish Script
# Usage: bash publish-frontend.sh

SERVER="76.13.36.5"
USER="root"
PASSWORD="elmanssa1234.COM"
DIST_DIR="dist"
REMOTE_DIR="/var/www/elmanssa.com"

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
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $USER@$SERVER "rm -rf $REMOTE_DIR/* && mkdir -p $REMOTE_DIR/assets/courses"

# Upload all files
for file in $(find $DIST_DIR -type f); do
    REL_PATH=${file#$DIST_DIR/}
    REMOTE_PATH="$REMOTE_DIR/$REL_PATH"
    REMOTE_DIR_PATH=$(dirname "$REMOTE_PATH")
    
    # Create remote directory
    sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $USER@$SERVER "mkdir -p '$REMOTE_DIR_PATH'" 2>/dev/null
    
    # Upload file
    sshpass -p "$PASSWORD" scp -o StrictHostKeyChecking=no "$file" "$USER@$SERVER:$REMOTE_PATH" 2>/dev/null
done

# Create default image
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $USER@$SERVER "cp $REMOTE_DIR/assets/courses/web_dev_cover_1774214853072.png $REMOTE_DIR/assets/courses/default.png 2>/dev/null || true"

echo "Files uploaded!"

# Test
echo "[3/3] Testing..."
STATUS=$(sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $USER@$SERVER "curl -s -o /dev/null -w '%{http_code}' http://localhost/")

echo ""
echo "=========================================="
if [ "$STATUS" = "200" ]; then
    echo "FRONTEND DEPLOYED SUCCESSFULLY!"
else
    echo "WARNING: Website returned status $STATUS"
fi
echo "=========================================="
echo "URL: https://elmanssa.com"
