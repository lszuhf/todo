-- Migration: Create todos table
-- Description: Stores todo items with priority, completion status, and timestamps

CREATE TABLE IF NOT EXISTS todos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high')),
  completed INTEGER NOT NULL DEFAULT 0 CHECK(completed IN (0, 1)),
  completed_at TEXT,
  due_date TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indices for frequent queries
CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todos(user_id);
CREATE INDEX IF NOT EXISTS idx_todos_priority ON todos(priority);
CREATE INDEX IF NOT EXISTS idx_todos_completed ON todos(completed);
CREATE INDEX IF NOT EXISTS idx_todos_title ON todos(title);
CREATE INDEX IF NOT EXISTS idx_todos_created_at ON todos(created_at);
CREATE INDEX IF NOT EXISTS idx_todos_due_date ON todos(due_date);
