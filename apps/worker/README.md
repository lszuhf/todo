# Cloudflare Worker - Todo API

Backend API for the todo application built with Cloudflare Workers, Hono framework, and D1 database.

## Tech Stack

- **Runtime**: Cloudflare Workers
- **Framework**: Hono (lightweight web framework)
- **Database**: Cloudflare D1 (SQLite-based serverless database)
- **Validation**: Zod
- **Language**: TypeScript

## Development

### Prerequisites

- Node.js 18+ and pnpm installed
- Cloudflare account (for production deployment)

### Setup

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Create and initialize local D1 database:

   ```bash
   pnpm wrangler d1 create todo-db --local
   pnpm wrangler d1 migrations apply todo-db --local
   ```

3. Start the development server:
   ```bash
   pnpm dev
   ```

The worker will be available at `http://localhost:8787`

### Available Scripts

**Development:**

- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build the worker
- `pnpm deploy` - Deploy to Cloudflare
- `pnpm typecheck` - Run TypeScript type checking

**Database (Local):**

- `pnpm db:migrations:list` - List local migrations
- `pnpm db:migrations:apply` - Apply local migrations
- `pnpm db:query` - Execute SQL query on local database

**Database (Production):**

- `pnpm db:migrations:list:prod` - List production migrations
- `pnpm db:migrations:apply:prod` - Apply production migrations

**Database Helper:**

- `pnpm db:helper` - Interactive database helper script (see `scripts/db-helpers.sh`)

## Database

The application uses Cloudflare D1 for data persistence. The schema includes:

- **users** - User accounts
- **todos** - Todo items with priority, completion status, and timestamps
- **tags** - Reusable tags for organizing todos
- **todo_tags** - Many-to-many relationship between todos and tags

For detailed database documentation, see [docs/db.md](./docs/db.md)

### Migration Commands

You can use either npm scripts or wrangler commands directly:

```bash
# Using npm scripts (recommended)
pnpm db:migrations:list        # List local migrations
pnpm db:migrations:apply       # Apply local migrations
pnpm db:migrations:list:prod   # List production migrations
pnpm db:migrations:apply:prod  # Apply production migrations

# Or use wrangler directly
pnpm wrangler d1 migrations list todo-db --local
pnpm wrangler d1 migrations apply todo-db --local
```

## Project Structure

```
apps/worker/
├── docs/              # Documentation
│   └── db.md          # Database schema and migration guide
├── migrations/        # D1 database migrations (versioned SQL files)
│   ├── 0001_create_users_table.sql
│   ├── 0002_create_todos_table.sql
│   ├── 0003_create_tags_table.sql
│   └── 0004_create_todo_tags_table.sql
├── scripts/           # Helper scripts
│   └── db-helpers.sh  # Interactive database management script
├── src/
│   ├── db/            # Database schemas and types
│   │   └── schema.ts  # Zod schemas and TypeScript types for all tables
│   ├── index.ts       # Main application entry point (Hono app)
│   └── types.ts       # TypeScript types for Worker bindings (Env)
├── package.json
├── tsconfig.json
└── wrangler.toml      # Cloudflare Worker configuration
```

## API Endpoints

### Health Check

```
GET /health
```

Returns API health status.

## Deployment

### Production Deployment

1. Create production D1 database:

   ```bash
   pnpm wrangler d1 create todo-db
   ```

2. Update `wrangler.toml` with the database ID returned from the previous command

3. Apply migrations:

   ```bash
   pnpm wrangler d1 migrations apply todo-db
   ```

4. Deploy the worker:
   ```bash
   pnpm deploy
   ```

## Environment Variables

Database binding is configured in `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "todo-db"
database_id = "your-database-id"
migrations_dir = "migrations"
```

## TypeScript Types

Database types are defined in `src/db/schema.ts` using Zod schemas. These provide:

- Runtime validation
- Type inference for TypeScript
- Insert/Update schemas for API requests
- Full type safety when working with database records

## Documentation

- [Database Schema & Migrations](./docs/db.md) - Complete database documentation

## Learn More

- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Cloudflare D1](https://developers.cloudflare.com/d1/)
- [Hono Framework](https://hono.dev/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)
