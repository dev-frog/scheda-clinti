#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "🚀 Starting build process for Scheda Clienti WordPress Plugin..."

# Get current versions
PACKAGE_VERSION=$(grep '"version"' package.json | head -1 | cut -d '"' -f 4)
PHP_VERSION=$(grep 'Version:' scheda-clienti-wordpress/scheda-clienti.php | head -1 | sed 's/.*Version: //' | sed 's/[^0-9.]//g')

echo "📋 Current versions:"
echo "   package.json: $PACKAGE_VERSION"
echo "   PHP plugin:   $PHP_VERSION"

# Use the higher version as base
if [ "$PACKAGE_VERSION" = "0.0.0" ]; then
    CURRENT_VERSION="$PHP_VERSION"
else
    CURRENT_VERSION="$PACKAGE_VERSION"
fi

echo "🔧 Using version: $CURRENT_VERSION"

# Split version into parts
IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT_VERSION"

# Increment patch version
NEW_PATCH=$((PATCH + 1))
NEW_VERSION="$MAJOR.$MINOR.$NEW_PATCH"

echo "📈 New version will be: $NEW_VERSION"

# Confirm with user
read -p "Continue with version $NEW_VERSION? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Build cancelled by user"
    exit 1
fi

echo "✅ Proceeding with version $NEW_VERSION"

# Update package.json version
echo "🔄 Updating package.json..."
sed -i '' "s/\"version\": \"$PACKAGE_VERSION\"/\"version\": \"$NEW_VERSION\"/" package.json

# Update WordPress plugin PHP version
echo "🔄 Updating scheda-clienti.php..."
# Update version in comment header
sed -i '' "s/\* Version: [0-9.]*/\* Version: $NEW_VERSION/" scheda-clienti-wordpress/scheda-clienti.php
# Update SC_VERSION constant
sed -i '' "s/define('SC_VERSION', '[^']*')/define('SC_VERSION', '$NEW_VERSION')/" scheda-clienti-wordpress/scheda-clienti.php

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

# 5. Create ZIP for WordPress with version in filename
echo "📦 Creating WordPress plugin ZIP..."
rm -f scheda-clienti-plugin.zip
ZIP_FILENAME="scheda-clienti-plugin-v$NEW_VERSION.zip"
zip -r "$ZIP_FILENAME" scheda-clienti-wordpress/ -x "*.DS_Store" -q

echo "-------------------------------------------------------"
echo "✅ SUCCESS! Build complete."
echo "📦 Plugin file: $ZIP_FILENAME"
echo "🎯 Version: $NEW_VERSION"
echo "💡 Instructions:"
echo "   1. Upload the ZIP to WordPress (Plugins -> Add New -> Upload)"
echo "   2. If already installed, select 'Replace current with uploaded'"
echo "   3. Check your browser console for 'Scheda Clienti: Script loaded'"
echo "-------------------------------------------------------"
