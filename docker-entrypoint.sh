#!/bin/bash
set -e

echo "🚀 Starting Security Recipes..."

# Initialize newsboat on first run
if [ ! -f /root/.newsboat/cache.db ]; then
    echo "📡 Fetching RSS feeds for the first time..."
    newsboat -x reload || echo "⚠️  Initial feed fetch failed, will retry later"
fi

# Set up cron for periodic feed updates
echo "⏰ Setting up periodic feed updates..."
echo "0 */6 * * * newsboat -x reload" | crontab -
crond

# Set up URL health checks
echo "🔗 Setting up URL health monitoring..."
echo "0 */12 * * * /app/check-urls.sh" | crontab -

echo "✅ Security Recipes is ready!"
echo "📊 Access at: http://localhost:3000"

# Start the Next.js app
exec "$@"
