import { http, HttpResponse } from 'msw';
import type { Todo, Tag, PaginatedResponse } from '../lib/api/types';

const BASE_URL = 'http://localhost:8787';

const mockTags: Tag[] = [
  { id: '1', name: 'Work', color: '#3b82f6' },
  { id: '2', name: 'Personal', color: '#10b981' },
  { id: '3', name: 'Urgent', color: '#ef4444' },
];

const mockTodos: Todo[] = [
  {
    id: '1',
    title: 'Complete project documentation',
    description: 'Write comprehensive docs for the new feature',
    completed: false,
    priority: 'high',
    tags: ['1', '3'],
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z',
  },
  {
    id: '2',
    title: 'Review pull requests',
    description: 'Review and merge pending PRs',
    completed: true,
    priority: 'medium',
    tags: ['1'],
    createdAt: '2024-01-02T10:00:00Z',
    updatedAt: '2024-01-02T15:00:00Z',
  },
  {
    id: '3',
    title: 'Buy groceries',
    description: 'Milk, eggs, bread',
    completed: false,
    priority: 'low',
    tags: ['2'],
    createdAt: '2024-01-03T10:00:00Z',
    updatedAt: '2024-01-03T10:00:00Z',
  },
];

export const handlers = [
  http.get(`${BASE_URL}/todos`, ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '20');
    const tag = url.searchParams.get('tag');
    const priority = url.searchParams.get('priority');
    const completed = url.searchParams.get('completed');
    const search = url.searchParams.get('search');

    let filtered = [...mockTodos];

    if (tag) {
      filtered = filtered.filter((todo) => todo.tags.includes(tag));
    }
    if (priority) {
      filtered = filtered.filter((todo) => todo.priority === priority);
    }
    if (completed !== null) {
      filtered = filtered.filter((todo) => todo.completed === (completed === 'true'));
    }
    if (search) {
      filtered = filtered.filter(
        (todo) =>
          todo.title.toLowerCase().includes(search.toLowerCase()) ||
          todo.description?.toLowerCase().includes(search.toLowerCase())
      );
    }

    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedData = filtered.slice(start, end);

    const response: PaginatedResponse<Todo> = {
      data: paginatedData,
      total: filtered.length,
      page,
      pageSize,
    };

    return HttpResponse.json(response);
  }),

  http.get(`${BASE_URL}/todos/:id`, ({ params }) => {
    const { id } = params;
    const todo = mockTodos.find((t) => t.id === id);
    if (!todo) {
      return HttpResponse.json({ message: 'Todo not found' }, { status: 404 });
    }
    return HttpResponse.json(todo);
  }),

  http.post(`${BASE_URL}/todos`, async ({ request }) => {
    const input = (await request.json()) as {
      title: string;
      description?: string;
      priority?: 'low' | 'medium' | 'high';
      tags?: string[];
    };
    const newTodo: Todo = {
      id: String(mockTodos.length + 1),
      title: input.title,
      description: input.description,
      completed: false,
      priority: input.priority || 'medium',
      tags: input.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockTodos.push(newTodo);
    return HttpResponse.json(newTodo, { status: 201 });
  }),

  http.patch(`${BASE_URL}/todos/:id`, async ({ params, request }) => {
    const { id } = params;
    const input = (await request.json()) as Partial<Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>>;
    const todoIndex = mockTodos.findIndex((t) => t.id === id);
    if (todoIndex === -1) {
      return HttpResponse.json({ message: 'Todo not found' }, { status: 404 });
    }
    const existingTodo = mockTodos[todoIndex];
    if (!existingTodo) {
      return HttpResponse.json({ message: 'Todo not found' }, { status: 404 });
    }
    const updatedTodo: Todo = {
      ...existingTodo,
      ...input,
      updatedAt: new Date().toISOString(),
    };
    mockTodos[todoIndex] = updatedTodo;
    return HttpResponse.json(updatedTodo);
  }),

  http.patch(`${BASE_URL}/todos/:id/toggle`, ({ params }) => {
    const { id } = params;
    const todoIndex = mockTodos.findIndex((t) => t.id === id);
    if (todoIndex === -1) {
      return HttpResponse.json({ message: 'Todo not found' }, { status: 404 });
    }
    const todo = mockTodos[todoIndex];
    if (!todo) {
      return HttpResponse.json({ message: 'Todo not found' }, { status: 404 });
    }
    const updatedTodo: Todo = {
      ...todo,
      completed: !todo.completed,
      updatedAt: new Date().toISOString(),
    };
    mockTodos[todoIndex] = updatedTodo;
    return HttpResponse.json(updatedTodo);
  }),

  http.delete(`${BASE_URL}/todos/:id`, ({ params }) => {
    const { id } = params;
    const todoIndex = mockTodos.findIndex((t) => t.id === id);
    if (todoIndex === -1) {
      return HttpResponse.json({ message: 'Todo not found' }, { status: 404 });
    }
    mockTodos.splice(todoIndex, 1);
    return HttpResponse.json(null, { status: 204 });
  }),

  http.get(`${BASE_URL}/tags`, () => {
    return HttpResponse.json(mockTags);
  }),

  http.get(`${BASE_URL}/tags/:id`, ({ params }) => {
    const { id } = params;
    const tag = mockTags.find((t) => t.id === id);
    if (!tag) {
      return HttpResponse.json({ message: 'Tag not found' }, { status: 404 });
    }
    return HttpResponse.json(tag);
  }),

  http.post(`${BASE_URL}/tags`, async ({ request }) => {
    const input = (await request.json()) as { name: string; color: string };
    const newTag: Tag = {
      id: String(mockTags.length + 1),
      name: input.name,
      color: input.color,
    };
    mockTags.push(newTag);
    return HttpResponse.json(newTag, { status: 201 });
  }),

  http.patch(`${BASE_URL}/tags/:id`, async ({ params, request }) => {
    const { id } = params;
    const input = (await request.json()) as Partial<Omit<Tag, 'id'>>;
    const tagIndex = mockTags.findIndex((t) => t.id === id);
    if (tagIndex === -1) {
      return HttpResponse.json({ message: 'Tag not found' }, { status: 404 });
    }
    const existingTag = mockTags[tagIndex];
    if (!existingTag) {
      return HttpResponse.json({ message: 'Tag not found' }, { status: 404 });
    }
    const updatedTag: Tag = {
      ...existingTag,
      ...input,
    };
    mockTags[tagIndex] = updatedTag;
    return HttpResponse.json(updatedTag);
  }),

  http.delete(`${BASE_URL}/tags/:id`, ({ params }) => {
    const { id } = params;
    const tagIndex = mockTags.findIndex((t) => t.id === id);
    if (tagIndex === -1) {
      return HttpResponse.json({ message: 'Tag not found' }, { status: 404 });
    }
    mockTags.splice(tagIndex, 1);
    return HttpResponse.json(null, { status: 204 });
  }),

  http.get(`${BASE_URL}/search`, ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('q') || '';
    const limit = parseInt(url.searchParams.get('limit') || '10');

    const filtered = mockTodos
      .filter(
        (todo) =>
          todo.title.toLowerCase().includes(query.toLowerCase()) ||
          todo.description?.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, limit);

    return HttpResponse.json(filtered);
  }),

  http.get(`${BASE_URL}/export`, ({ request }) => {
    const url = new URL(request.url);
    const format = url.searchParams.get('format') || 'json';

    if (format === 'csv') {
      const csv = [
        'id,title,description,completed,priority,tags,createdAt,updatedAt',
        ...mockTodos.map((todo) =>
          [
            todo.id,
            todo.title,
            todo.description || '',
            todo.completed,
            todo.priority,
            todo.tags.join(';'),
            todo.createdAt,
            todo.updatedAt,
          ].join(',')
        ),
      ].join('\n');
      return HttpResponse.text(csv);
    }

    return HttpResponse.json(mockTodos);
  }),
];
