# Portable Recipe Storage with SQLite

## Overview
Recipes are now stored in a single SQLite database file that you can access from anywhere.

## Database Location
**`~/.security-recipes/recipes.db`**

Single file contains:
- All published recipes
- User settings
- Timestamps
- Categories and tags

## Access Your Recipes Anywhere

### Option 1: Cloud Sync (Recommended)
Sync the database file automatically across devices.

#### Dropbox
```bash
# Move database to Dropbox
mv ~/.security-recipes ~/Dropbox/security-recipes

# Create symlink
ln -s ~/Dropbox/security-recipes ~/.security-recipes

# Now syncs automatically!
```

#### Google Drive
```bash
# Move to Google Drive
mv ~/.security-recipes ~/GoogleDrive/security-recipes
ln -s ~/GoogleDrive/security-recipes ~/.security-recipes
```

#### iCloud Drive (macOS)
```bash
mv ~/.security-recipes ~/Library/Mobile\ Documents/com~apple~CloudDocs/security-recipes
ln -s ~/Library/Mobile\ Documents/com~apple~CloudDocs/security-recipes ~/.security-recipes
```

### Option 2: Git Repository
Version control your recipes.

```bash
cd ~/.security-recipes
git init
git add recipes.db
git commit -m "Initial recipes"
git remote add origin <your-repo-url>
git push -u origin main

# On another machine:
git clone <your-repo-url> ~/.security-recipes
```

### Option 3: Manual Sync
Copy the database file manually.

```bash
# Backup
cp ~/.security-recipes/recipes.db ~/backup/recipes-$(date +%Y%m%d).db

# Copy to USB drive
cp ~/.security-recipes/recipes.db /media/usb/recipes.db

# Copy to another machine
scp ~/.security-recipes/recipes.db user@remote:~/.security-recipes/
```

### Option 4: Network Share
Access from multiple machines on same network.

```bash
# Mount network share
sudo mount -t cifs //server/share /mnt/recipes

# Symlink database
ln -s /mnt/recipes/recipes.db ~/.security-recipes/recipes.db
```

## Benefits

### Lightweight
- **Single file**: ~40KB empty, grows slowly
- **Fast**: SQLite is faster than file I/O
- **No server**: Works offline

### Portable
- **Copy once**: Get all recipes
- **Cross-platform**: Works on Linux, Mac, Windows
- **Backup-friendly**: One file to backup

### Sync-Friendly
- **Dropbox/Drive**: Auto-sync across devices
- **Git**: Version control + collaboration
- **rsync**: Automated backups

## Database Schema

```sql
recipes (
  id INTEGER PRIMARY KEY,
  slug TEXT UNIQUE,
  title TEXT,
  category TEXT,
  brief TEXT,
  themes TEXT (JSON),
  created_at DATETIME,
  updated_at DATETIME
)
```

## Query Your Recipes

### View all recipes
```bash
sqlite3 ~/.security-recipes/recipes.db "SELECT title, category, created_at FROM recipes ORDER BY created_at DESC;"
```

### Search recipes
```bash
sqlite3 ~/.security-recipes/recipes.db "SELECT title FROM recipes WHERE brief LIKE '%malware%';"
```

### Export to JSON
```bash
sqlite3 ~/.security-recipes/recipes.db "SELECT json_object('title', title, 'brief', brief) FROM recipes;" | jq
```

### Count by category
```bash
sqlite3 ~/.security-recipes/recipes.db "SELECT category, COUNT(*) FROM recipes GROUP BY category;"
```

## Backup Strategy

### Automatic Daily Backup
```bash
# Add to crontab
crontab -e

# Backup daily at 2 AM
0 2 * * * cp ~/.security-recipes/recipes.db ~/.security-recipes/backups/recipes-$(date +\%Y\%m\%d).db
```

### Keep Last 7 Days
```bash
# Cleanup old backups
find ~/.security-recipes/backups -name "recipes-*.db" -mtime +7 -delete
```

## Migration from Files

If you have existing markdown files:

```bash
# They're still in content/recipes/
# Database is now the primary storage
# Old files can be deleted or kept as backup
```

## Troubleshooting

### Database locked
```bash
# Check for processes using the database
lsof ~/.security-recipes/recipes.db

# Kill if needed
fuser -k ~/.security-recipes/recipes.db
```

### Corrupted database
```bash
# Restore from backup
cp ~/.security-recipes/backups/recipes-latest.db ~/.security-recipes/recipes.db

# Or rebuild
rm ~/.security-recipes/recipes.db
./init-db.sh
```

### Sync conflicts
```bash
# Dropbox/Drive will create conflict copies
# Keep the newest one
ls -lt ~/.security-recipes/recipes*.db
```

## Size Estimates

- Empty database: 40 KB
- 100 recipes: ~500 KB
- 1,000 recipes: ~5 MB
- 10,000 recipes: ~50 MB

Extremely lightweight and efficient!
