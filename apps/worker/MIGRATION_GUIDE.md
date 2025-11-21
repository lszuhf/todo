# D1 Database Migration Guide

## Quick Start

This project uses Cloudflare D1 (SQLite-based) for data persistence. Follow these steps to get started:

### Local Development

```bash
# Navigate to worker directory
cd apps/worker

# List available migrations
pnpm db:migrations:list

# Apply migrations to local database
pnpm db:migrations:apply

# Verify setup by querying the database
pnpm db:query --command "SELECT * FROM users"
```

### Production Deployment

```bash
# Create production database (one-time setup)
pnpm wrangler d1 create todo-db

# Update wrangler.toml with the database_id from above command

# Apply migrations to production
pnpm db:migrations:apply:prod

# Verify
pnpm db:migrations:list:prod
```

## Database Schema Overview

The schema consists of 4 tables:

1. **users** - User accounts (includes default user with id=1)
2. **todos** - Todo items with priority, completion status, and timestamps
3. **tags** - Reusable tags for organizing todos
4. **todo_tags** - Junction table for many-to-many relationship

## Available Scripts

All commands should be run from `apps/worker/` directory:

```bash
# Local database operations
pnpm db:migrations:list        # List migrations
pnpm db:migrations:apply       # Apply migrations
pnpm db:query                  # Execute SQL queries

# Production database operations
pnpm db:migrations:list:prod   # List production migrations
pnpm db:migrations:apply:prod  # Apply production migrations

# Interactive helper script
pnpm db:helper                 # Run interactive CLI helper
```

## Using the Database in Code

### Import and Use Query Functions

```typescript
import { Hono } from 'hono';
import type { Env } from './types';
import { getTodosByUserId, createTodo, InsertTodoSchema } from './db';

const app = new Hono<{ Bindings: Env }>();

// Get all todos for user
app.get('/api/todos', async (c) => {
  const db = c.env.DB;
  const todos = await getTodosByUserId(db, 1);
  return c.json(todos);
});

// Create a new todo
app.post('/api/todos', async (c) => {
  const db = c.env.DB;
  const body = await c.req.json();

  // Validate with Zod
  const todo = InsertTodoSchema.parse(body);

  // Insert into database
  const id = await createTodo(db, todo);

  return c.json({ id }, 201);
});
```

### Direct Database Queries

```typescript
app.get('/api/custom', async (c) => {
  const db = c.env.DB;

  const result = await db.prepare('SELECT * FROM todos WHERE completed = ?').bind(0).all();

  return c.json(result.results);
});
```

## Migration Files

Migrations are located in `migrations/` directory:

- `0001_create_users_table.sql` - Creates users table and seeds default user
- `0002_create_todos_table.sql` - Creates todos table with indices
- `0003_create_tags_table.sql` - Creates tags table
- `0004_create_todo_tags_table.sql` - Creates junction table for todo-tag relationships

## Best Practices

1. **Never modify existing migration files** - Create new migrations for changes
2. **Test locally first** - Always test migrations with `--local` flag before production
3. **Use Zod schemas** - Validate data with the provided schemas in `src/db/schema.ts`
4. **Use query helpers** - Prefer the query functions in `src/db/queries.ts` over raw SQL
5. **Backup production** - Always backup before running production migrations

## Troubleshooting

### Migration not recognized

Ensure migration files:

- Are in the `migrations/` directory
- Follow naming convention `XXXX_description.sql`
- Are valid SQL statements

### Local database reset

To reset your local database:

```bash
rm -rf .wrangler/state/v3/d1/
pnpm db:migrations:apply
```

### Database binding not found

Ensure `wrangler.toml` has the D1 database configured:

```toml
[[d1_databases]]
binding = "DB"
database_name = "todo-db"
database_id = "your-database-id"
migrations_dir = "migrations"
```

## Additional Resources

- [Detailed Schema Documentation](./docs/db.md)
- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [Wrangler CLI Reference](https://developers.cloudflare.com/workers/wrangler/)
