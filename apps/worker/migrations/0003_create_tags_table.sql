-- Migration: Create tags table
-- Description: Stores reusable tags that can be associated with todos

CREATE TABLE IF NOT EXISTS tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  color TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Create index on name for fast lookups and searches
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);
