#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "🚀 Starting build process for Scheda Clienti WordPress Plugin..."

# 1. Cleanup old build files
echo "🧹 Cleaning up old builds..."
rm -rf dist
rm -f scheda-clienti-plugin.zip
# Clean up old assets in the wordpress folder
rm -f scheda-clienti-wordpress/assets/index*.js
rm -f scheda-clienti-wordpress/assets/index*.css

# 2. Install dependencies
echo "📦 Installing dependencies..."
npm install

# 3. Build the React app
echo "🏗️ Building React application..."
npm run build --silent

# 4. Sync assets to WordPress plugin folder
echo "🔄 Syncing assets to WordPress plugin..."
# Delete any existing JS/CSS files first to avoid picking old hashed versions
rm -f scheda-clienti-wordpress/assets/index*.js
rm -f scheda-clienti-wordpress/assets/index*.css

if [ -d "dist/assets" ]; then
    cp dist/assets/* scheda-clienti-wordpress/assets/
    echo "✅ Assets copied from dist/assets"
else
    cp dist/*.js scheda-clienti-wordpress/assets/ 2>/dev/null || true
    cp dist/*.css scheda-clienti-wordpress/assets/ 2>/dev/null || true
    echo "✅ Assets copied from dist root"
fi

# 5. Create ZIP for WordPress
echo "📦 Creating WordPress plugin ZIP..."
rm -f scheda-clienti-plugin.zip
zip -r scheda-clienti-plugin.zip scheda-clienti-wordpress/ -x "*.DS_Store" -q

echo "-------------------------------------------------------"
echo "✅ SUCCESS! Build complete."
echo "📦 Plugin file: scheda-clienti-plugin.zip"
echo "💡 Instructions:"
echo "   1. Upload the ZIP to WordPress (Plugins -> Add New -> Upload)"
echo "   2. If already installed, select 'Replace current with uploaded'"
echo "   3. Check your browser console for 'Scheda Clienti: Script loaded'"
echo "-------------------------------------------------------"
