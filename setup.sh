#!/bin/bash

echo "🚀 Starting xMati Mother Application Setup"
echo "=========================================="
echo ""

# Check if nvm is installed
if ! command -v nvm &> /dev/null; then
    echo "⚠️  nvm is not installed. Please install nvm first."
    echo "   Visit: https://github.com/nvm-sh/nvm#installing-and-updating"
    exit 1
fi

# Load nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

echo "✅ Step 1: Setting Node version to 23.4.0"
nvm use 23.4.0 || nvm install 23.4.0

echo ""
echo "✅ Step 2: Checking Node version"
node -v
npm -v

echo ""
echo "✅ Step 3: Installing dependencies (this may take a few minutes)..."
npm install --legacy-peer-deps

echo ""
echo "=========================================="
echo "✅ Setup Complete!"
echo ""
echo "Available commands:"
echo "  npm start       - Start development server"
echo "  npm run build   - Build for production"
echo "  npm test        - Run tests"
echo ""
echo "The application will be available at:"
echo "  http://localhost:6000"
echo ""
echo "To start the app now, run:"
echo "  npm start"
echo "=========================================="
