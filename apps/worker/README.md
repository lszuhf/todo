# Todo API Worker

A Cloudflare Worker backend for a todo application with tags, search, and export functionality.

## Features

- **Todos Management**: Create, read, update, and delete todos with priorities and completion status
- **Tags System**: Organize todos with tags (many-to-many relationship)
- **Advanced Filtering**: Filter todos by priority, completion status, and tags
- **Search**: Full-text search across todo titles and content
- **Data Export**: Export all data as JSON or CSV
- **Validation**: Request/response validation using Zod schemas
- **Type-Safe**: Full TypeScript support
- **Tested**: Comprehensive test coverage using Vitest + Cloudflare's test environment

## Tech Stack

- **Runtime**: Cloudflare Workers
- **Framework**: Hono (lightweight web framework)
- **Database**: Cloudflare D1 (SQLite)
- **Validation**: Zod
- **Testing**: Vitest with @cloudflare/vitest-pool-workers
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### Installation

```bash
# Install dependencies
pnpm install
```

### Database Setup

The database schema is defined in `migrations/0001_initial_schema.sql`.

For local development, create a local D1 database:

```bash
# Create local database
wrangler d1 execute todo-db --local --file=migrations/0001_initial_schema.sql
```

For production, create a D1 database in Cloudflare Dashboard and update `wrangler.toml`:

```bash
# Create production database
wrangler d1 create todo-db

# Update database_id in wrangler.toml with the output

# Run migrations
wrangler d1 execute todo-db --file=migrations/0001_initial_schema.sql
```

### Development

```bash
# Start development server (default: http://localhost:8787)
pnpm dev

# The API will be available at http://localhost:8787
```

### Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Type check
pnpm typecheck
```

### Building

```bash
# Build TypeScript
pnpm build
```

### Deployment

```bash
# Deploy to Cloudflare Workers
pnpm deploy
```

## Project Structure

```
apps/worker/
├── src/
│   ├── index.ts              # Main application entry point
│   ├── types.ts              # TypeScript type definitions
│   ├── schemas.ts            # Zod validation schemas
│   ├── db.ts                 # Database repositories
│   ├── routes/
│   │   ├── todos.ts          # Todos CRUD endpoints
│   │   ├── tags.ts           # Tags CRUD endpoints
│   │   ├── search.ts         # Search endpoint
│   │   └── export.ts         # Export endpoint
│   ├── index.test.ts         # Comprehensive API tests
│   └── cloudflare-test.d.ts  # Type definitions for test environment
├── migrations/
│   └── 0001_initial_schema.sql # Database schema
├── wrangler.toml             # Cloudflare Workers configuration
├── vitest.config.ts          # Vitest configuration
├── package.json              # Dependencies and scripts
└── API.md                    # Detailed API documentation
```

## API Endpoints

See [API.md](./API.md) for complete API documentation with examples.

### Quick Reference

- `GET /` - API information
- `GET /health` - Health check
- `GET /api/todos` - List todos (with filtering)
- `POST /api/todos` - Create todo
- `GET /api/todos/:id` - Get todo by ID
- `PUT /api/todos/:id` - Update todo
- `DELETE /api/todos/:id` - Delete todo
- `GET /api/tags` - List tags
- `POST /api/tags` - Create tag
- `DELETE /api/tags/:id` - Delete tag
- `GET /api/search?q=keyword` - Search todos
- `GET /api/export?format=json|csv` - Export data

## Database Schema

### Tables

**todos**

- `id` (INTEGER, PRIMARY KEY)
- `title` (TEXT, NOT NULL)
- `content` (TEXT, NULLABLE)
- `priority` (TEXT, 'low' | 'medium' | 'high')
- `completed` (INTEGER, 0 | 1)
- `created_at` (TEXT, ISO 8601)
- `updated_at` (TEXT, ISO 8601)

**tags**

- `id` (INTEGER, PRIMARY KEY)
- `name` (TEXT, UNIQUE, NOT NULL)
- `created_at` (TEXT, ISO 8601)

**todo_tags**

- `todo_id` (INTEGER, FOREIGN KEY)
- `tag_id` (INTEGER, FOREIGN KEY)
- PRIMARY KEY (todo_id, tag_id)

## Development Notes

### CORS

The API includes CORS middleware to allow cross-origin requests from the frontend.

### Error Handling

All endpoints return structured error responses:

```json
{
  "error": "Error message",
  "details": [] // Optional validation errors
}
```

### Validation

Request bodies are validated using Zod schemas. Invalid requests return 400 status with detailed error messages.

### Testing

Tests use Cloudflare's Vitest pool for Workers, which provides:

- Real D1 database instance for integration testing
- Miniflare environment for testing Worker runtime
- Fast, isolated test execution

### Type Safety

The codebase is fully typed with TypeScript, providing:

- Type-safe database operations
- Validated request/response types
- Auto-completion in IDEs

## Configuration

### wrangler.toml

```toml
name = "cloudflare-worker"
main = "src/index.ts"
compatibility_date = "2024-04-05"
compatibility_flags = ["nodejs_compat"]

[[d1_databases]]
binding = "DB"
database_name = "todo-db"
database_id = "your-database-id"
migrations_dir = "migrations"
```

## Contributing

1. Make changes to the code
2. Run tests: `pnpm test`
3. Type check: `pnpm typecheck`
4. Build: `pnpm build`
5. Test locally: `pnpm dev`

## License

MIT
