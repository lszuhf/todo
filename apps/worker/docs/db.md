# Database Schema Documentation

## Overview

This application uses Cloudflare D1, a serverless SQL database built on SQLite. The schema supports a todo application with user management, task organization, tagging, and priority management.

## Tables

### users

Stores user information.

| Column     | Type    | Constraints                | Description                |
| ---------- | ------- | -------------------------- | -------------------------- |
| id         | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique user identifier     |
| email      | TEXT    | NOT NULL, UNIQUE           | User's email address       |
| name       | TEXT    | NOT NULL                   | User's display name        |
| created_at | TEXT    | NOT NULL, DEFAULT now      | Timestamp of user creation |
| updated_at | TEXT    | NOT NULL, DEFAULT now      | Timestamp of last update   |

**Indices:**

- `idx_users_email` on `email` for fast lookups

**Default Data:**

- A default user with `id = 1` is seeded in the initial migration

### todos

Stores todo items with priority and completion tracking.

| Column       | Type    | Constraints                            | Description                           |
| ------------ | ------- | -------------------------------------- | ------------------------------------- |
| id           | INTEGER | PRIMARY KEY, AUTOINCREMENT             | Unique todo identifier                |
| user_id      | INTEGER | NOT NULL, FOREIGN KEY → users(id)      | Owner of the todo                     |
| title        | TEXT    | NOT NULL                               | Todo title/summary                    |
| description  | TEXT    | NULL                                   | Detailed description                  |
| priority     | TEXT    | NOT NULL, DEFAULT 'medium', CHECK enum | Priority: low, medium, high           |
| completed    | INTEGER | NOT NULL, DEFAULT 0, CHECK (0 or 1)    | Completion flag (0 = false, 1 = true) |
| completed_at | TEXT    | NULL                                   | Timestamp when completed              |
| due_date     | TEXT    | NULL                                   | Due date for the todo                 |
| created_at   | TEXT    | NOT NULL, DEFAULT now                  | Timestamp of creation                 |
| updated_at   | TEXT    | NOT NULL, DEFAULT now                  | Timestamp of last update              |

**Indices:**

- `idx_todos_user_id` on `user_id` for filtering by user
- `idx_todos_priority` on `priority` for priority-based queries
- `idx_todos_completed` on `completed` for filtering by status
- `idx_todos_title` on `title` for text search
- `idx_todos_created_at` on `created_at` for date-based sorting
- `idx_todos_due_date` on `due_date` for deadline queries

**Constraints:**

- Foreign key to `users(id)` with CASCADE delete (deleting a user deletes their todos)
- Priority must be one of: 'low', 'medium', 'high'
- Completed must be 0 or 1

### tags

Stores reusable tags that can be associated with todos.

| Column     | Type    | Constraints                | Description                |
| ---------- | ------- | -------------------------- | -------------------------- |
| id         | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique tag identifier      |
| name       | TEXT    | NOT NULL, UNIQUE           | Tag name                   |
| color      | TEXT    | NULL                       | Optional color code for UI |
| created_at | TEXT    | NOT NULL, DEFAULT now      | Timestamp of tag creation  |
| updated_at | TEXT    | NOT NULL, DEFAULT now      | Timestamp of last update   |

**Indices:**

- `idx_tags_name` on `name` for fast lookups and searches

**Constraints:**

- Tag names must be unique

### todo_tags

Junction table for many-to-many relationship between todos and tags.

| Column     | Type    | Constraints                       | Description                |
| ---------- | ------- | --------------------------------- | -------------------------- |
| id         | INTEGER | PRIMARY KEY, AUTOINCREMENT        | Unique junction identifier |
| todo_id    | INTEGER | NOT NULL, FOREIGN KEY → todos(id) | Reference to todo          |
| tag_id     | INTEGER | NOT NULL, FOREIGN KEY → tags(id)  | Reference to tag           |
| created_at | TEXT    | NOT NULL, DEFAULT now             | Timestamp of association   |

**Indices:**

- `idx_todo_tags_todo_id` on `todo_id` for efficient joins
- `idx_todo_tags_tag_id` on `tag_id` for efficient joins

**Constraints:**

- Foreign key to `todos(id)` with CASCADE delete
- Foreign key to `tags(id)` with CASCADE delete
- Unique constraint on `(todo_id, tag_id)` to prevent duplicate associations

## Relationships

```
users 1──────* todos
               │
               │
               * (through todo_tags)
               │
               │
tags  *────────┘
```

- One user can have many todos (1:N)
- One todo belongs to one user (N:1)
- Todos and tags have a many-to-many relationship (N:M) through `todo_tags`
- One todo can have multiple tags
- One tag can be associated with multiple todos

## TypeScript Types

All database schemas have corresponding TypeScript types and Zod schemas defined in `src/db/schema.ts`:

- `User`, `InsertUser`, `UpdateUser`
- `Todo`, `InsertTodo`, `UpdateTodo`
- `Tag`, `InsertTag`, `UpdateTag`
- `TodoTag`, `InsertTodoTag`
- `TodoWithTags` (for API responses with joined data)

All schemas include validation with Zod, making them suitable for both runtime validation and type inference.

## Migration Workflow

### Local Development

1. **Create the local D1 database:**

   ```bash
   cd apps/worker
   pnpm wrangler d1 create todo-db --local
   ```

2. **List migrations:**

   ```bash
   pnpm wrangler d1 migrations list todo-db --local
   ```

3. **Apply migrations:**

   ```bash
   pnpm wrangler d1 migrations apply todo-db --local
   ```

4. **Execute custom SQL queries (for testing):**
   ```bash
   pnpm wrangler d1 execute todo-db --local --command "SELECT * FROM users"
   ```

### Production

1. **Create the production D1 database:**

   ```bash
   cd apps/worker
   pnpm wrangler d1 create todo-db
   ```

   This will output a `database_id`. Update `wrangler.toml` with the actual database ID.

2. **List migrations:**

   ```bash
   pnpm wrangler d1 migrations list todo-db
   ```

3. **Apply migrations:**

   ```bash
   pnpm wrangler d1 migrations apply todo-db
   ```

4. **Execute queries:**
   ```bash
   pnpm wrangler d1 execute todo-db --command "SELECT * FROM users"
   ```

### Creating New Migrations

Migrations are stored in `migrations/` directory and should follow the naming convention:

```
XXXX_description_of_migration.sql
```

Where `XXXX` is a sequential number (e.g., `0001`, `0002`, etc.).

To create a new migration:

1. Create a new SQL file in the `migrations/` directory with the next sequential number
2. Write your SQL statements (CREATE, ALTER, INSERT, etc.)
3. Test locally first using `--local` flag
4. Apply to production once verified

**Best Practices:**

- Always use `IF NOT EXISTS` for CREATE statements to make migrations idempotent
- Add descriptive comments at the top of each migration
- Test migrations locally before applying to production
- Never modify existing migration files after they've been applied
- Use transactions if you need multiple statements to succeed or fail together

## Query Examples

### Get all todos for a user with tags

```sql
SELECT
  t.*,
  GROUP_CONCAT(tag.name) as tag_names,
  GROUP_CONCAT(tag.id) as tag_ids
FROM todos t
LEFT JOIN todo_tags tt ON t.id = tt.todo_id
LEFT JOIN tags tag ON tt.tag_id = tag.id
WHERE t.user_id = 1
GROUP BY t.id
ORDER BY t.created_at DESC;
```

### Search todos by title or description

```sql
SELECT * FROM todos
WHERE user_id = 1
  AND (
    title LIKE '%search term%'
    OR description LIKE '%search term%'
  )
ORDER BY created_at DESC;
```

### Get todos by priority

```sql
SELECT * FROM todos
WHERE user_id = 1 AND priority = 'high'
ORDER BY due_date ASC;
```

### Get all incomplete todos

```sql
SELECT * FROM todos
WHERE user_id = 1 AND completed = 0
ORDER BY priority DESC, created_at ASC;
```

### Get todos by tag

```sql
SELECT t.* FROM todos t
INNER JOIN todo_tags tt ON t.id = tt.todo_id
INNER JOIN tags tag ON tt.tag_id = tag.id
WHERE t.user_id = 1 AND tag.name = 'important'
ORDER BY t.created_at DESC;
```

### Get tag usage statistics

```sql
SELECT
  t.id,
  t.name,
  COUNT(tt.todo_id) as usage_count
FROM tags t
LEFT JOIN todo_tags tt ON t.id = tt.tag_id
GROUP BY t.id
ORDER BY usage_count DESC;
```

## Accessing the Database in Code

The D1 database is available via the `DB` binding in your worker:

```typescript
import type { Env } from './types';

// In your Hono route handler
app.get('/todos', async (c) => {
  const db = c.env.DB;

  const result = await db.prepare('SELECT * FROM todos WHERE user_id = ?').bind(1).all();

  return c.json(result.results);
});
```

Use the Zod schemas from `src/db/schema.ts` to validate and type your queries:

```typescript
import { TodoSchema } from './db/schema';

const result = await db.prepare('SELECT * FROM todos WHERE id = ?').bind(1).first();
const todo = TodoSchema.parse(result);
```

## Notes

- D1 uses SQLite's datetime format. Timestamps are stored as ISO 8601 strings.
- Boolean values are stored as integers (0 or 1) since SQLite doesn't have a native boolean type.
- All foreign keys are configured with `ON DELETE CASCADE` for automatic cleanup.
- Indices are created on columns frequently used in WHERE clauses and JOIN conditions for optimal query performance.
