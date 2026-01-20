#!/bin/bash

echo "🔧 Setting up Security Recipes with Newsboat integration..."

# Install newsboat if not present
if ! command -v newsboat &> /dev/null; then
    echo "📦 Installing newsboat..."
    sudo apt install -y newsboat
fi

# Setup newsboat config
echo "⚙️  Configuring newsboat..."
mkdir -p ~/.newsboat
cp newsboat-urls ~/.newsboat/urls
cp newsboat-config ~/.newsboat/config

# Fetch feeds
echo "📡 Fetching RSS feeds (this may take a minute)..."
newsboat -x reload

echo "✅ Setup complete!"
echo ""
echo "📚 To view feeds in newsboat: newsboat"
echo "🚀 To start the app: npm run dev"
echo ""
echo "The app will now dynamically load content from your newsboat feeds!"
