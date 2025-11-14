# Todo API Documentation

Base URL: `http://localhost:8787` (local development)

## Overview

The Todo API provides REST endpoints for managing todos with tags, search functionality, and data export capabilities.

## Authentication

Currently, no authentication is required. Authentication can be added in future versions.

## Error Handling

All endpoints return structured error responses in the following format:

```json
{
  "error": "Error message",
  "details": [] // Optional validation errors
}
```

### HTTP Status Codes

- `200 OK` - Successful GET, PUT, or DELETE
- `201 Created` - Successful POST
- `400 Bad Request` - Invalid input or missing required parameters
- `404 Not Found` - Resource not found
- `409 Conflict` - Duplicate resource (e.g., tag name already exists)
- `500 Internal Server Error` - Server error

## Endpoints

### Root

#### GET `/`

Get API information and available endpoints.

**Response:**

```json
{
  "message": "Todo API",
  "version": "1.0.0",
  "endpoints": {
    "todos": "/api/todos",
    "tags": "/api/tags",
    "search": "/api/search",
    "export": "/api/export"
  }
}
```

### Health Check

#### GET `/health`

Check API health status.

**Response:**

```json
{
  "status": "ok"
}
```

---

## Todos

### List Todos

#### GET `/api/todos`

Get all todos with optional filtering.

**Query Parameters:**

| Parameter   | Type   | Description                                    |
| ----------- | ------ | ---------------------------------------------- |
| `tagIds`    | string | Comma-separated tag IDs (e.g., `1,2,3`)        |
| `priority`  | string | Filter by priority: `low`, `medium`, or `high` |
| `search`    | string | Search in title and content                    |
| `completed` | string | Filter by completion: `true` or `false`        |

**Example Request:**

```bash
GET /api/todos?priority=high&completed=false
```

**Response:**

```json
{
  "todos": [
    {
      "id": 1,
      "title": "Complete project documentation",
      "content": "Write comprehensive API docs",
      "priority": "high",
      "completed": false,
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z",
      "tags": [
        {
          "id": 1,
          "name": "work",
          "created_at": "2024-01-15T10:00:00.000Z"
        }
      ]
    }
  ]
}
```

### Get Todo by ID

#### GET `/api/todos/:id`

Get a specific todo by ID.

**Path Parameters:**

| Parameter | Type   | Description |
| --------- | ------ | ----------- |
| `id`      | number | Todo ID     |

**Example Request:**

```bash
GET /api/todos/1
```

**Response:**

```json
{
  "id": 1,
  "title": "Complete project documentation",
  "content": "Write comprehensive API docs",
  "priority": "high",
  "completed": false,
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:30:00.000Z",
  "tags": [
    {
      "id": 1,
      "name": "work",
      "created_at": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

### Create Todo

#### POST `/api/todos`

Create a new todo.

**Request Body:**

```json
{
  "title": "Buy groceries",
  "content": "Milk, eggs, bread, cheese",
  "priority": "medium",
  "completed": false,
  "tagIds": [1, 2]
}
```

**Field Specifications:**

| Field       | Type     | Required | Default    | Description                                 |
| ----------- | -------- | -------- | ---------- | ------------------------------------------- |
| `title`     | string   | Yes      | -          | Todo title (1-255 characters)               |
| `content`   | string   | No       | -          | Todo description (max 5000 characters)      |
| `priority`  | string   | No       | `"medium"` | Priority level: `low`, `medium`, or `high`  |
| `completed` | boolean  | No       | `false`    | Completion status                           |
| `tagIds`    | number[] | No       | `[]`       | Array of tag IDs to associate with the todo |

**Example Request:**

```bash
POST /api/todos
Content-Type: application/json

{
  "title": "Buy groceries",
  "content": "Milk, eggs, bread",
  "priority": "high",
  "tagIds": [1]
}
```

**Response (201 Created):**

```json
{
  "id": 2,
  "title": "Buy groceries",
  "content": "Milk, eggs, bread",
  "priority": "high",
  "completed": false,
  "created_at": "2024-01-15T11:00:00.000Z",
  "updated_at": "2024-01-15T11:00:00.000Z",
  "tags": [
    {
      "id": 1,
      "name": "personal",
      "created_at": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

### Update Todo

#### PUT `/api/todos/:id`

Update an existing todo. All fields are optional.

**Path Parameters:**

| Parameter | Type   | Description |
| --------- | ------ | ----------- |
| `id`      | number | Todo ID     |

**Request Body:**

```json
{
  "title": "Buy groceries and supplies",
  "content": "Milk, eggs, bread, cleaning supplies",
  "priority": "medium",
  "completed": true,
  "tagIds": [1, 3]
}
```

**Field Specifications:**

| Field       | Type     | Description                                         |
| ----------- | -------- | --------------------------------------------------- |
| `title`     | string   | Todo title (1-255 characters)                       |
| `content`   | string   | Todo description (max 5000 characters), can be null |
| `priority`  | string   | Priority level: `low`, `medium`, or `high`          |
| `completed` | boolean  | Completion status                                   |
| `tagIds`    | number[] | Array of tag IDs (replaces existing tags)           |

**Example Request:**

```bash
PUT /api/todos/2
Content-Type: application/json

{
  "completed": true
}
```

**Response (200 OK):**

```json
{
  "id": 2,
  "title": "Buy groceries",
  "content": "Milk, eggs, bread",
  "priority": "high",
  "completed": true,
  "created_at": "2024-01-15T11:00:00.000Z",
  "updated_at": "2024-01-15T11:30:00.000Z",
  "tags": [
    {
      "id": 1,
      "name": "personal",
      "created_at": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

### Delete Todo

#### DELETE `/api/todos/:id`

Delete a todo and all its tag associations.

**Path Parameters:**

| Parameter | Type   | Description |
| --------- | ------ | ----------- |
| `id`      | number | Todo ID     |

**Example Request:**

```bash
DELETE /api/todos/2
```

**Response (200 OK):**

```json
{
  "message": "Todo deleted successfully"
}
```

---

## Tags

### List Tags

#### GET `/api/tags`

Get all tags.

**Response:**

```json
{
  "tags": [
    {
      "id": 1,
      "name": "work",
      "created_at": "2024-01-15T10:00:00.000Z"
    },
    {
      "id": 2,
      "name": "personal",
      "created_at": "2024-01-15T10:05:00.000Z"
    }
  ]
}
```

### Create Tag

#### POST `/api/tags`

Create a new tag.

**Request Body:**

```json
{
  "name": "urgent"
}
```

**Field Specifications:**

| Field  | Type   | Required | Description                                |
| ------ | ------ | -------- | ------------------------------------------ |
| `name` | string | Yes      | Tag name (1-50 characters, must be unique) |

**Example Request:**

```bash
POST /api/tags
Content-Type: application/json

{
  "name": "urgent"
}
```

**Response (201 Created):**

```json
{
  "id": 3,
  "name": "urgent",
  "created_at": "2024-01-15T11:00:00.000Z"
}
```

**Error Response (409 Conflict):**

```json
{
  "error": "Tag with this name already exists"
}
```

### Delete Tag

#### DELETE `/api/tags/:id`

Delete a tag. This will also remove the tag from all associated todos.

**Path Parameters:**

| Parameter | Type   | Description |
| --------- | ------ | ----------- |
| `id`      | number | Tag ID      |

**Example Request:**

```bash
DELETE /api/tags/3
```

**Response (200 OK):**

```json
{
  "message": "Tag deleted successfully"
}
```

---

## Search

### Search Todos

#### GET `/api/search`

Search todos by keyword in title and content.

**Query Parameters:**

| Parameter        | Type   | Required | Description |
| ---------------- | ------ | -------- | ----------- |
| `q` or `keyword` | string | Yes      | Search term |

**Example Request:**

```bash
GET /api/search?q=groceries
```

**Response:**

```json
{
  "query": "groceries",
  "results": [
    {
      "id": 2,
      "title": "Buy groceries",
      "content": "Milk, eggs, bread",
      "priority": "high",
      "completed": false,
      "created_at": "2024-01-15T11:00:00.000Z",
      "updated_at": "2024-01-15T11:00:00.000Z",
      "tags": [
        {
          "id": 2,
          "name": "personal",
          "created_at": "2024-01-15T10:05:00.000Z"
        }
      ]
    }
  ],
  "count": 1
}
```

---

## Export

### Export Data

#### GET `/api/export`

Export all todos and tags in JSON or CSV format.

**Query Parameters:**

| Parameter | Type   | Default  | Description                    |
| --------- | ------ | -------- | ------------------------------ |
| `format`  | string | `"json"` | Export format: `json` or `csv` |

### Export as JSON

**Example Request:**

```bash
GET /api/export
# or
GET /api/export?format=json
```

**Response:**

```json
{
  "exported_at": "2024-01-15T12:00:00.000Z",
  "todos": [
    {
      "id": 1,
      "title": "Complete project documentation",
      "content": "Write comprehensive API docs",
      "priority": "high",
      "completed": false,
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z",
      "tags": [
        {
          "id": 1,
          "name": "work",
          "created_at": "2024-01-15T10:00:00.000Z"
        }
      ]
    }
  ],
  "tags": [
    {
      "id": 1,
      "name": "work",
      "created_at": "2024-01-15T10:00:00.000Z"
    },
    {
      "id": 2,
      "name": "personal",
      "created_at": "2024-01-15T10:05:00.000Z"
    }
  ]
}
```

### Export as CSV

**Example Request:**

```bash
GET /api/export?format=csv
```

**Response:**

```csv
ID,Title,Content,Priority,Completed,Tags,Created At,Updated At
1,"Complete project documentation","Write comprehensive API docs",high,false,work,2024-01-15T10:30:00.000Z,2024-01-15T10:30:00.000Z
2,"Buy groceries","Milk, eggs, bread",high,false,personal,2024-01-15T11:00:00.000Z,2024-01-15T11:00:00.000Z
```

**Response Headers:**

```
Content-Type: text/csv
Content-Disposition: attachment; filename="todos-2024-01-15.csv"
```

---

## Data Models

### Todo

```typescript
{
  id: number;
  title: string;
  content: string | null;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  created_at: string; // ISO 8601 timestamp
  updated_at: string; // ISO 8601 timestamp
  tags: Tag[];
}
```

### Tag

```typescript
{
  id: number;
  name: string;
  created_at: string; // ISO 8601 timestamp
}
```

---

## Examples

### Complete Workflow Example

```bash
# 1. Create tags
curl -X POST http://localhost:8787/api/tags \
  -H "Content-Type: application/json" \
  -d '{"name": "work"}'

curl -X POST http://localhost:8787/api/tags \
  -H "Content-Type: application/json" \
  -d '{"name": "urgent"}'

# 2. Create a todo with tags
curl -X POST http://localhost:8787/api/todos \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Finish quarterly report",
    "content": "Complete Q4 financial summary",
    "priority": "high",
    "tagIds": [1, 2]
  }'

# 3. List todos with filters
curl "http://localhost:8787/api/todos?priority=high&completed=false"

# 4. Search todos
curl "http://localhost:8787/api/search?q=report"

# 5. Update todo
curl -X PUT http://localhost:8787/api/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'

# 6. Export data as CSV
curl "http://localhost:8787/api/export?format=csv" -o todos.csv

# 7. Delete todo
curl -X DELETE http://localhost:8787/api/todos/1
```

---

## Database Schema

### Tables

#### `todos`

| Column       | Type    | Constraints                                                    |
| ------------ | ------- | -------------------------------------------------------------- |
| `id`         | INTEGER | PRIMARY KEY AUTOINCREMENT                                      |
| `title`      | TEXT    | NOT NULL                                                       |
| `content`    | TEXT    | NULL                                                           |
| `priority`   | TEXT    | CHECK(priority IN ('low', 'medium', 'high')), DEFAULT 'medium' |
| `completed`  | INTEGER | NOT NULL, DEFAULT 0                                            |
| `created_at` | TEXT    | NOT NULL, DEFAULT (datetime('now'))                            |
| `updated_at` | TEXT    | NOT NULL, DEFAULT (datetime('now'))                            |

#### `tags`

| Column       | Type    | Constraints                         |
| ------------ | ------- | ----------------------------------- |
| `id`         | INTEGER | PRIMARY KEY AUTOINCREMENT           |
| `name`       | TEXT    | NOT NULL UNIQUE                     |
| `created_at` | TEXT    | NOT NULL, DEFAULT (datetime('now')) |

#### `todo_tags`

| Column    | Type    | Constraints                                        |
| --------- | ------- | -------------------------------------------------- |
| `todo_id` | INTEGER | NOT NULL, FOREIGN KEY (todos.id) ON DELETE CASCADE |
| `tag_id`  | INTEGER | NOT NULL, FOREIGN KEY (tags.id) ON DELETE CASCADE  |
|           |         | PRIMARY KEY (todo_id, tag_id)                      |

### Indexes

- `idx_todos_priority` on `todos(priority)`
- `idx_todos_completed` on `todos(completed)`
- `idx_todos_created_at` on `todos(created_at)`
- `idx_todo_tags_todo_id` on `todo_tags(todo_id)`
- `idx_todo_tags_tag_id` on `todo_tags(tag_id)`

---

## Development

### Running Locally

```bash
# Install dependencies
pnpm install

# Run database migrations
wrangler d1 execute todo-db-local --local --file=migrations/0001_initial_schema.sql

# Start development server
pnpm --filter worker dev
```

### Running Tests

```bash
# Run all tests
pnpm --filter worker test

# Run tests in watch mode
pnpm --filter worker test:watch
```

### Type Checking

```bash
pnpm --filter worker typecheck
```

---

## Notes

- All timestamps are stored and returned in ISO 8601 format
- The `completed` field is stored as an integer (0 or 1) in the database but returned as a boolean in API responses
- Tag associations are managed through the `todo_tags` junction table
- Deleting a todo automatically removes all its tag associations (CASCADE)
- Deleting a tag removes it from all associated todos (CASCADE)
- CSV export properly escapes values containing commas, quotes, or newlines
- Search is case-insensitive and uses SQL LIKE with wildcards
