#!/bin/bash

echo "🔍 Verifying xMati Mother Installation"
echo "==========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0

# Check Node version
echo -n "Checking Node version... "
NODE_VERSION=$(node -v 2>/dev/null)
if [[ $NODE_VERSION == "v23.4.0" ]]; then
    echo -e "${GREEN}✓ $NODE_VERSION${NC}"
else
    echo -e "${RED}✗ Expected v23.4.0, got $NODE_VERSION${NC}"
    echo -e "  ${YELLOW}Run: nvm use 23.4.0${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check npm version
echo -n "Checking npm version... "
NPM_VERSION=$(npm -v 2>/dev/null)
if [[ ! -z "$NPM_VERSION" ]]; then
    echo -e "${GREEN}✓ $NPM_VERSION${NC}"
else
    echo -e "${RED}✗ npm not found${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check if node_modules exists
echo -n "Checking dependencies... "
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓ Installed${NC}"
else
    echo -e "${RED}✗ Not installed${NC}"
    echo -e "  ${YELLOW}Run: npm install --legacy-peer-deps${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check .env file
echo -n "Checking .env file... "
if [ -f ".env" ]; then
    echo -e "${GREEN}✓ Found${NC}"
else
    echo -e "${RED}✗ Missing${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check .nvmrc file
echo -n "Checking .nvmrc file... "
if [ -f ".nvmrc" ]; then
    echo -e "${GREEN}✓ Found${NC}"
else
    echo -e "${RED}✗ Missing${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check key source directories
echo -n "Checking components... "
COMPONENT_COUNT=$(find src/components -type f -name "*.tsx" 2>/dev/null | wc -l)
if [ "$COMPONENT_COUNT" -ge 19 ]; then
    echo -e "${GREEN}✓ $COMPONENT_COUNT files${NC}"
else
    echo -e "${RED}✗ Only $COMPONENT_COUNT files found (expected 19+)${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check utils
echo -n "Checking utilities... "
if [ -f "src/utils/api.ts" ] && [ -f "src/utils/shared.ts" ]; then
    echo -e "${GREEN}✓ Found${NC}"
else
    echo -e "${RED}✗ Missing${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check auth
echo -n "Checking auth module... "
if [ -f "src/auth/basicAuth.ts" ]; then
    echo -e "${GREEN}✓ Found${NC}"
else
    echo -e "${RED}✗ Missing${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check main App files
echo -n "Checking App files... "
if [ -f "src/App.tsx" ] && [ -f "src/App.css" ]; then
    echo -e "${GREEN}✓ Found${NC}"
else
    echo -e "${RED}✗ Missing${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check package.json dependencies
echo -n "Checking key dependencies... "
DEPS_CHECK=0
if grep -q "@blueprintjs/core" package.json; then ((DEPS_CHECK++)); fi
if grep -q "@stripe/react-stripe-js" package.json; then ((DEPS_CHECK++)); fi
if grep -q "react-router-dom" package.json; then ((DEPS_CHECK++)); fi

if [ "$DEPS_CHECK" -eq 3 ]; then
    echo -e "${GREEN}✓ Found all key dependencies${NC}"
else
    echo -e "${YELLOW}⚠ Some dependencies might be missing${NC}"
fi

echo ""
echo "==========================================="

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed!${NC}"
    echo ""
    echo "Your project is ready to run:"
    echo "  npm start"
    echo ""
    exit 0
else
    echo -e "${RED}❌ $ERRORS error(s) found${NC}"
    echo ""
    echo "Please fix the errors above and try again."
    echo "For help, see: QUICK_START.txt or SETUP.md"
    echo ""
    exit 1
fi
