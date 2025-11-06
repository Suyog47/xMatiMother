#!/bin/bash

echo "🚀 Setting up production build..."

# Create production environment file
cat > .env.production << EOL
GENERATE_SOURCEMAP=false
REACT_APP_API_URL=https://www.app.xmati.ai/apis
EOL

# Build with specific settings to avoid some compatibility issues
echo "📦 Building with optimized settings..."
CI=false npm run build

echo "✅ Production build completed!"
echo "📁 Built files are in the 'build' directory"
echo ""
echo "To serve locally:"
echo "  npx serve -s build -l 3000"
echo ""
echo "To deploy:"
echo "  - Upload 'build' folder contents to your web server"
echo "  - Or use services like Netlify, Vercel, etc."