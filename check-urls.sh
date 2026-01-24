#!/bin/bash

# URL Health Check Script for Security Recipes
# Run this periodically via cron to monitor URL validity

LOG_FILE="/tmp/security-recipes-url-check.log"
ALERT_THRESHOLD=70  # Alert if health score drops below this percentage

echo "=== URL Health Check - $(date) ===" >> "$LOG_FILE"

# Check if the app is running
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "ERROR: App not running on localhost:3000" >> "$LOG_FILE"
    exit 1
fi

# Run URL validation
RESPONSE=$(curl -s "http://localhost:3000/api/validate-urls?all=true")

# Parse results
CHECKED=$(echo "$RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('checked', 0))")
VALID=$(echo "$RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('valid', 0))")
INVALID=$(echo "$RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('invalid', 0))")
HEALTH=$(echo "$RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('validPercentage', 0))")

echo "Checked: $CHECKED URLs" >> "$LOG_FILE"
echo "Valid: $VALID" >> "$LOG_FILE"
echo "Invalid: $INVALID" >> "$LOG_FILE"
echo "Health Score: $HEALTH%" >> "$LOG_FILE"

# Alert if health score is low
if [ "$HEALTH" -lt "$ALERT_THRESHOLD" ]; then
    echo "⚠️  WARNING: URL health score ($HEALTH%) is below threshold ($ALERT_THRESHOLD%)" >> "$LOG_FILE"
    
    # Optional: Send notification (uncomment to enable)
    # notify-send "Security Recipes Alert" "URL health score is $HEALTH%"
    
    # Optional: Log invalid URLs
    echo "$RESPONSE" | python3 -c "
import sys, json
data = json.load(sys.stdin)
if data.get('results'):
    print('\nInvalid URLs:')
    for r in data['results'][:5]:  # Show first 5
        print(f\"  - {r['title'][:60]}...\")
        print(f\"    {r['url']}\")
        print(f\"    Error: {r.get('error', 'HTTP ' + str(r['status']))}\")
" >> "$LOG_FILE"
fi

echo "---" >> "$LOG_FILE"

# Optional: Trigger newsboat reload if many URLs are invalid
if [ "$HEALTH" -lt "50" ]; then
    echo "Health score critically low. Running newsboat reload..." >> "$LOG_FILE"
    newsboat -x reload >> "$LOG_FILE" 2>&1
fi
