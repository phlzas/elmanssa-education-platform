#!/bin/bash
# Publish Both Backend and Frontend
# Usage: bash publish-all.sh

echo "=========================================="
echo "PUBLISHING BACKEND AND FRONTEND"
echo "=========================================="

# Publish Backend
echo ""
echo ">>> PUBLISHING BACKEND <<<"
bash publish-backend.sh

# Publish Frontend
echo ""
echo ">>> PUBLISHING FRONTEND <<<"
bash publish-frontend.sh

echo ""
echo "=========================================="
echo "ALL DONE!"
echo "=========================================="
