# Tag Management Implementation Notes

This document describes the tag management and todo filtering features that have been implemented.

## Overview

The implementation adds comprehensive tag management and todo filtering capabilities to the application, including:

1. **Full CRUD operations for tags** with usage counts
2. **Todo management** with multi-tag assignment
3. **Advanced filtering** by tags and priority levels
4. **Real-time updates** using React Query cache invalidation

## Backend Implementation

### API Endpoints (`apps/worker/src/index.ts`)

#### Tags API

- `GET /api/tags` - Returns all tags with usage counts
- `POST /api/tags` - Creates a new tag (validates uniqueness)
- `DELETE /api/tags/:id` - Deletes a tag and removes it from all todos

#### Todos API

- `GET /api/todos` - Returns todos with optional filtering:
  - `?tagIds=1,2,3` - Filter by one or more tags (OR logic)
  - `?priority=high` - Filter by priority level
- `POST /api/todos` - Creates a new todo
- `PUT /api/todos/:id` - Updates an existing todo
- `DELETE /api/todos/:id` - Deletes a todo

### Data Models

```typescript
interface Tag {
  id: string;
  name: string;
  createdAt: string;
  count?: number; // Added by backend for usage tracking
}

interface Todo {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  tagIds: string[];
  createdAt: string;
  updatedAt: string;
}
```

### CORS Configuration

The backend includes CORS middleware from `hono/cors` to allow cross-origin requests from the frontend.

## Frontend Implementation

### React Query Setup (`apps/web/src/main.tsx`)

- Configured `QueryClient` with sensible defaults
- Stale time: 5 minutes
- Window focus refetch: disabled

### API Client (`apps/web/src/api/client.ts`)

- Centralized API request handler
- Configurable base URL via `VITE_API_URL` environment variable
- Error handling with JSON response parsing

### Custom Hooks

#### Tag Hooks (`apps/web/src/hooks/useTags.ts`)

- `useTags()` - Fetches all tags with counts
- `useCreateTag()` - Creates a new tag, invalidates tags cache
- `useDeleteTag()` - Deletes a tag, invalidates both tags and todos caches

#### Todo Hooks (`apps/web/src/hooks/useTodos.ts`)

- `useTodos(filters?)` - Fetches todos with optional tag/priority filtering
- `useCreateTodo()` - Creates a todo, invalidates caches
- `useUpdateTodo()` - Updates a todo, invalidates caches
- `useDeleteTodo()` - Deletes a todo, invalidates caches

### UI Components

#### New Components Created

1. **Badge** (`apps/web/src/components/ui/Badge.tsx`)
   - Displays tags with color variants
   - Optional remove button for filter badges
   - Multiple size options

2. **Checkbox** (`apps/web/src/components/ui/Checkbox.tsx`)
   - Styled checkbox with optional label
   - Dark mode support

3. **Select** (`apps/web/src/components/ui/Select.tsx`)
   - Dropdown select with label and error support
   - Used for priority selection

4. **TodoModal** (`apps/web/src/components/TodoModal.tsx`)
   - Modal for creating/editing todos
   - Tag multi-select with chip-based UI
   - Priority selection dropdown
   - Form validation

### Pages

#### TagsPage (`apps/web/src/pages/TagsPage.tsx`)

Features:

- Create new tags with inline form
- Display all tags with usage counts
- Delete tags with confirmation modal
- Real-time updates via React Query

UI Elements:

- Tag creation form at the top
- List of tags showing name, count, and delete button
- Confirmation modal for deletions

#### TodosPage (`apps/web/src/pages/TodosPage.tsx`)

Features:

- Create/Edit/Delete todos
- Toggle todo completion with checkbox
- Filter by multiple tags (multi-select)
- Filter by priority level
- Clear all filters button
- Active filter indicators with individual removal

UI Structure:

1. **Header**: Title and "Create Todo" button
2. **Filter Panel**:
   - Tag filter buttons (highlight when selected)
   - Priority filter buttons
   - Active filters display with removable badges
   - "Clear Filters" button
3. **Todo List**:
   - Checkbox for completion
   - Title with strikethrough when completed
   - Priority badge
   - Description
   - Tag badges
   - Edit and Delete buttons

## Cache Management

React Query automatically manages cache invalidation:

- Creating/updating/deleting todos → Invalidates `['todos']` and `['tags']` queries
- Creating/deleting tags → Invalidates `['tags']` and optionally `['todos']` queries

This ensures:

- Tag counts are always up-to-date
- Todo lists reflect all changes immediately
- Filter results update in real-time

## Styling

All components use Tailwind CSS with:

- Dark mode support
- Consistent color scheme using primary colors
- Responsive design
- Hover and active states
- Smooth transitions

## Type Safety

Full TypeScript coverage with:

- Interface definitions in `apps/web/src/types.ts`
- Type-safe API calls
- Typed React Query hooks
- Vite environment variable types in `apps/web/src/vite-env.d.ts`

## Configuration

The frontend connects to the backend via the `VITE_API_URL` environment variable:

```env
# apps/web/.env
VITE_API_URL=http://localhost:8787
```

Default: `http://localhost:8787`

## Testing the Implementation

### Start the Backend

```bash
pnpm --filter worker dev
```

The worker will start on http://localhost:8787

### Start the Frontend

```bash
pnpm --filter web dev
```

The frontend will start on http://localhost:3000

### Run Both Together

```bash
pnpm dev
```

### Test the Features

1. **Tag Management** (http://localhost:3000/tags):
   - Create tags like "Work", "Personal", "Urgent"
   - View usage counts
   - Delete unused tags

2. **Todo Management** (http://localhost:3000):
   - Create todos with multiple tags and priorities
   - Toggle completion
   - Edit existing todos
   - Delete todos

3. **Filtering**:
   - Click tag buttons to filter by one or more tags
   - Click priority buttons to filter by priority
   - Use "Clear Filters" to reset
   - Remove individual filters by clicking the X on active filter badges

## Acceptance Criteria Met

✅ Tag list shows existing tags with counts and supports create/delete with confirmation
✅ Todo modal allows selecting/deselecting tags; updates persist
✅ Filtering by one or more tags and priority works and updates list in real time
✅ Clearing filters restores full list
✅ All interactions use live API endpoints with proper error handling
✅ React Query caches are properly invalidated to reflect changes immediately
