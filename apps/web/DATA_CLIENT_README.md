# Data Client Layer

This document describes the data client implementation for the frontend application.

## Overview

The data client layer provides a robust, type-safe interface for interacting with the Worker API. It includes:

- **TanStack Query (React Query)** for data fetching, caching, and state management
- **Axios** for HTTP requests with interceptors and error handling
- **TypeScript types** for API requests and responses
- **Custom React hooks** for easy integration with components
- **MSW (Mock Service Worker)** for testing and development
- **Global notification system** for user feedback

## Architecture

### Directory Structure

```
src/
├── lib/
│   ├── api/
│   │   ├── client.ts              # Axios client configuration
│   │   ├── types.ts               # TypeScript types and interfaces
│   │   └── services/
│   │       ├── todos.ts           # Todo API endpoints
│   │       ├── tags.ts            # Tag API endpoints
│   │       ├── search.ts          # Search API endpoints
│   │       ├── export.ts          # Export API endpoints
│   │       └── index.ts           # Service exports
│   ├── hooks/
│   │   ├── useTodos.ts            # Query hooks for todos
│   │   ├── useCreateTodo.ts       # Mutation hook for creating todos
│   │   ├── useUpdateTodo.ts       # Mutation hooks for updating todos
│   │   ├── useDeleteTodo.ts       # Mutation hook for deleting todos
│   │   ├── useTags.ts             # Hooks for tags
│   │   ├── useSearch.ts           # Hook for search
│   │   ├── useExportTodos.ts      # Hook for exporting todos
│   │   └── index.ts               # Hook exports
│   ├── query/
│   │   ├── queryClient.ts         # Query client configuration
│   │   └── QueryProvider.tsx      # React Query provider component
│   ├── context/
│   │   └── NotificationContext.tsx # Global notification system
│   └── __tests__/
│       ├── setup.ts               # Test setup with MSW
│       ├── useTodos.test.tsx      # Tests for todo hooks
│       ├── useCreateTodo.test.tsx # Tests for create mutation
│       └── useTags.test.tsx       # Tests for tag hooks
└── mocks/
    ├── handlers.ts                # MSW request handlers
    ├── browser.ts                 # MSW browser setup
    ├── server.ts                  # MSW server setup (for tests)
    └── init.ts                    # MSW initialization
```

## API Client

### Configuration

The API client is configured in `src/lib/api/client.ts`:

```typescript
import apiClient from './lib/api/client';
```

**Base URL**: Configured via `VITE_API_BASE_URL` environment variable (defaults to `http://localhost:8787`)

**Features**:

- Request/response interceptors
- Automatic error handling
- Type-safe error responses
- 30-second timeout

### TypeScript Types

All API types are defined in `src/lib/api/types.ts`:

- `Todo` - Todo item interface
- `Tag` - Tag interface
- `Priority` - Priority enum type
- `CreateTodoInput` - Input for creating todos
- `UpdateTodoInput` - Input for updating todos
- `TodoFilters` - Filter options for todos
- `PaginatedResponse<T>` - Paginated API response
- `ApiError` - Error response interface
- `ExportOptions` - Export configuration

## React Query Configuration

The Query Client is configured with sensible defaults:

- **Stale Time**: 5 minutes
- **Garbage Collection Time**: 10 minutes
- **Retry**: 1 attempt for queries, 0 for mutations
- **Refetch on Window Focus**: Disabled
- **Refetch on Mount**: Enabled

## Custom Hooks

### Query Hooks

#### `useTodos(filters?, page?, pageSize?)`

Fetches paginated todos with optional filtering.

```typescript
const { data, isLoading, error } = useTodos({ priority: 'high' });
```

**Filters**:

- `tag` - Filter by tag ID
- `priority` - Filter by priority ('low' | 'medium' | 'high')
- `completed` - Filter by completion status
- `search` - Search by title or description

#### `useTodo(id)`

Fetches a single todo by ID.

```typescript
const { data, isLoading } = useTodo('todo-id');
```

#### `useTags()`

Fetches all tags.

```typescript
const { data: tags } = useTags();
```

#### `useTag(id)`

Fetches a single tag by ID.

```typescript
const { data: tag } = useTag('tag-id');
```

#### `useSearch(options)`

Searches todos by query string.

```typescript
const { data } = useSearch({ query: 'project', limit: 10 });
```

### Mutation Hooks

#### `useCreateTodo()`

Creates a new todo.

```typescript
const createTodo = useCreateTodo();

createTodo.mutate({
  title: 'New todo',
  description: 'Description',
  priority: 'high',
  tags: ['tag-id'],
});
```

#### `useUpdateTodo()`

Updates an existing todo.

```typescript
const updateTodo = useUpdateTodo();

updateTodo.mutate({
  id: 'todo-id',
  input: { title: 'Updated title' },
});
```

#### `useToggleTodo()`

Toggles the completion status of a todo.

```typescript
const toggleTodo = useToggleTodo();

toggleTodo.mutate('todo-id');
```

#### `useDeleteTodo()`

Deletes a todo.

```typescript
const deleteTodo = useDeleteTodo();

deleteTodo.mutate('todo-id');
```

#### `useCreateTag()`, `useUpdateTag()`, `useDeleteTag()`

Similar mutation hooks for managing tags.

#### `useExportTodos()`

Exports todos in JSON or CSV format and triggers a download.

```typescript
const exportTodos = useExportTodos();

exportTodos.mutate({
  format: 'csv',
  filters: { priority: 'high' },
});
```

## Notifications

The notification system provides toast notifications for user feedback.

### Usage

```typescript
import { useNotifications } from './lib/context/NotificationContext';

function MyComponent() {
  const { addNotification } = useNotifications();

  const handleAction = async () => {
    try {
      await someAction();
      addNotification('success', 'Action completed!');
    } catch (error) {
      addNotification('error', 'Action failed');
    }
  };
}
```

**Notification Types**:

- `success` - Green notification
- `error` - Red notification
- `info` - Blue notification

Notifications automatically dismiss after 5 seconds.

## Mock Service Worker (MSW)

MSW is used for development and testing to intercept network requests.

### Development

MSW is automatically enabled in development mode. Set `VITE_ENABLE_MSW=false` to disable.

The mock API includes:

- 3 sample todos with different priorities and tags
- 3 sample tags (Work, Personal, Urgent)
- Full CRUD operations
- Filtering, searching, and pagination
- Export functionality

### Testing

MSW is configured for tests in `src/lib/__tests__/setup.ts`. All tests automatically use the mock API.

## Testing

### Running Tests

```bash
# Run tests in watch mode
pnpm --filter web test

# Run tests once
pnpm --filter web test:run

# Run tests with UI
pnpm --filter web test:ui
```

### Writing Tests

Tests use the Testing Library and Vitest:

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useTodos } from '../hooks/useTodos';

describe('useTodos', () => {
  it('should fetch todos', async () => {
    const { result } = renderHook(() => useTodos(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.data).toHaveLength(3);
  });
});
```

## Integration Examples

### Basic Todo List

```typescript
import { useTodos, useToggleTodo } from './lib/hooks';

function TodoList() {
  const { data, isLoading } = useTodos();
  const toggleTodo = useToggleTodo();

  if (isLoading) return <div>Loading...</div>;

  return (
    <ul>
      {data?.data.map((todo) => (
        <li key={todo.id}>
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => toggleTodo.mutate(todo.id)}
          />
          {todo.title}
        </li>
      ))}
    </ul>
  );
}
```

### Filtered Todo List

```typescript
import { useState } from 'react';
import { useTodos } from './lib/hooks';

function FilteredTodoList() {
  const [priority, setPriority] = useState<Priority>('high');
  const { data } = useTodos({ priority });

  return (
    <div>
      <select value={priority} onChange={(e) => setPriority(e.target.value)}>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
      {/* Render todos */}
    </div>
  );
}
```

### Creating Todos with Error Handling

```typescript
import { useCreateTodo } from './lib/hooks';
import { useNotifications } from './lib/context/NotificationContext';

function CreateTodoForm() {
  const createTodo = useCreateTodo();
  const { addNotification } = useNotifications();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createTodo.mutateAsync({ title: 'New todo' });
      addNotification('success', 'Todo created!');
    } catch (error) {
      addNotification('error', 'Failed to create todo');
    }
  };

  return <form onSubmit={handleSubmit}>{/* Form fields */}</form>;
}
```

## Environment Variables

Create a `.env` file based on `.env.example`:

```env
# API Base URL
VITE_API_BASE_URL=http://localhost:8787

# Enable MSW for development
VITE_ENABLE_MSW=true
```

## Best Practices

1. **Always use hooks in components** - Don't call API services directly
2. **Handle loading and error states** - Provide good UX feedback
3. **Use optimistic updates** when appropriate for instant UI feedback
4. **Invalidate queries** after mutations to keep data fresh
5. **Use TypeScript types** to ensure type safety
6. **Add notifications** for user actions to provide feedback
7. **Write tests** for custom hooks to ensure reliability

## Future Enhancements

Potential improvements:

- [ ] Optimistic updates for better UX
- [ ] Infinite scrolling for large todo lists
- [ ] Offline support with persistence
- [ ] Request debouncing for search
- [ ] React Query DevTools integration
- [ ] Advanced caching strategies
- [ ] Prefetching for better performance
