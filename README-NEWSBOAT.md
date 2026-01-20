# Newsboat Setup for Security Recipes

## Installation

### Install Newsboat
```bash
# Ubuntu/Debian
sudo apt install newsboat

# macOS
brew install newsboat

# Arch Linux
sudo pacman -S newsboat
```

## Configuration

### Setup newsboat with the provided config:

```bash
# Create newsboat config directory
mkdir -p ~/.newsboat

# Copy the URLs file
cp newsboat-urls ~/.newsboat/urls

# Copy the config file
cp newsboat-config ~/.newsboat/config
```

## Usage

### Run newsboat:
```bash
newsboat
```

### Key Commands:
- `r` - Reload all feeds
- `R` - Reload current feed
- `j/k` - Navigate up/down
- `Enter` - Open article
- `q` - Quit
- `A` - Mark all as read

## Feed Categories

The feeds are organized by the app's topics:

1. **Cloud Security** (23 feeds) - AWS, Azure, GCP security blogs
2. **Hardware Security** (15 feeds) - Hardware vulnerabilities, firmware
3. **Infrastructure** (31 feeds) - Network security, general infosec
4. **Malware Research** (18 feeds) - Threat intelligence, malware analysis
5. **Government Alerts** (7 feeds) - CISA, US-CERT advisories

## Tags

Feeds are also tagged with popular topics:
- Zero Trust
- Container Security
- TPM/HSM
- DevSecOps
- Compliance

## Filtering by Tag

In newsboat, you can filter by tag:
```
# View only Cloud Security feeds
:set feedlist-filter "tags # \"Cloud Security\""

# View only Zero Trust tagged feeds
:set feedlist-filter "tags # \"Zero Trust\""
```

## Next Steps

To integrate with the Security Recipes app, the app needs to:
1. Read from `~/.newsboat/cache.db` (newsboat's SQLite database)
2. Parse RSS feed data based on selected topic
3. Generate dynamic content from actual articles
