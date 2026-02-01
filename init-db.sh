#!/bin/bash

# Initialize recipes database
DB_PATH="$HOME/.security-recipes/recipes.db"

mkdir -p "$HOME/.security-recipes"

sqlite3 "$DB_PATH" <<EOF
CREATE TABLE IF NOT EXISTS recipes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    brief TEXT NOT NULL,
    themes TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_category ON recipes(category);
CREATE INDEX IF NOT EXISTS idx_created ON recipes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_slug ON recipes(slug);

-- Create settings table for user preferences
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

-- Insert default settings
INSERT OR IGNORE INTO settings (key, value) VALUES 
    ('sync_enabled', 'false'),
    ('sync_path', ''),
    ('theme', 'dark');
EOF

echo "✓ Database initialized at: $DB_PATH"
echo "✓ Database size: $(du -h "$DB_PATH" | cut -f1)"
