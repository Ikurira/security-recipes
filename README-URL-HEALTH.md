# URL Health Monitoring

## Overview
The Security Recipes app includes URL validation to ensure source article links remain valid over time.

## Features

### Manual Checking (UI)
- **Quick Check**: Validates 50 most recent URLs
- **Full Check**: Validates up to 200 URLs
- **Health Score**: Visual percentage indicator
- **Invalid URL List**: Expandable details of broken links

### Automatic Checking (Script)
- Periodic validation via cron job
- Logging to `/tmp/security-recipes-url-check.log`
- Automatic newsboat reload if health drops critically

## Setup Periodic Checks

### Option 1: Cron Job (Recommended)
```bash
# Edit crontab
crontab -e

# Add one of these lines:

# Check every 6 hours
0 */6 * * * /home/kuriri/security-recipes/check-urls.sh

# Check daily at 2 AM
0 2 * * * /home/kuriri/security-recipes/check-urls.sh

# Check every hour
0 * * * * /home/kuriri/security-recipes/check-urls.sh
```

### Option 2: Systemd Timer
```bash
# Create service file
sudo nano /etc/systemd/system/url-health-check.service

[Unit]
Description=Security Recipes URL Health Check

[Service]
Type=oneshot
ExecStart=/home/kuriri/security-recipes/check-urls.sh
User=kuriri

# Create timer file
sudo nano /etc/systemd/system/url-health-check.timer

[Unit]
Description=Run URL Health Check every 6 hours

[Timer]
OnBootSec=10min
OnUnitActiveSec=6h

[Install]
WantedBy=timers.target

# Enable and start
sudo systemctl enable url-health-check.timer
sudo systemctl start url-health-check.timer
```

### Option 3: Manual Run
```bash
# Run check manually
./check-urls.sh

# View log
tail -f /tmp/security-recipes-url-check.log
```

## API Endpoint

### GET /api/validate-urls
Validates URLs from newsboat cache.

**Parameters:**
- `all=true` - Check up to 200 URLs (default: 50)

**Response:**
```json
{
  "checked": 50,
  "valid": 45,
  "invalid": 5,
  "validPercentage": 90,
  "results": [
    {
      "url": "https://example.com/article",
      "title": "Article Title",
      "status": 404,
      "valid": false,
      "error": "Not Found"
    }
  ],
  "timestamp": "2026-01-20T15:30:00.000Z"
}
```

## Health Score Interpretation

- **90-100%**: Excellent - All sources accessible
- **70-89%**: Good - Minor issues, some links may be outdated
- **50-69%**: Fair - Significant issues, consider running newsboat reload
- **Below 50%**: Poor - Many broken links, immediate action needed

## Troubleshooting

### High Invalid Count
1. Run `newsboat -x reload` to fetch fresh articles
2. Check internet connectivity
3. Some sites may block automated requests
4. Old articles naturally have higher failure rates

### Script Not Running
1. Check cron logs: `grep CRON /var/log/syslog`
2. Verify script permissions: `ls -l check-urls.sh`
3. Test manually: `./check-urls.sh`
4. Check app is running: `curl http://localhost:3000`

## Configuration

### Alert Threshold
Edit `check-urls.sh` to change alert threshold:
```bash
ALERT_THRESHOLD=70  # Alert if health score drops below this
```

### Enable Notifications
Uncomment in `check-urls.sh`:
```bash
notify-send "Security Recipes Alert" "URL health score is $HEALTH%"
```

### Auto-Reload Threshold
Script automatically runs `newsboat -x reload` if health drops below 50%.
Adjust in `check-urls.sh`:
```bash
if [ "$HEALTH" -lt "50" ]; then
```

## Best Practices

1. **Check Regularly**: Run checks every 6-12 hours
2. **Monitor Logs**: Review logs weekly for patterns
3. **Update Feeds**: Run `newsboat -x reload` daily
4. **Clean Old Data**: Periodically clear old newsboat cache
5. **Verify Manually**: Spot-check invalid URLs before removing feeds
