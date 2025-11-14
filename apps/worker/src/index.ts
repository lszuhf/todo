import { Hono } from 'hono';
import { cors } from 'hono/cors';

interface Tag {
  id: string;
  name: string;
  createdAt: string;
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

const tags: Tag[] = [
  { id: '1', name: 'Work', createdAt: new Date().toISOString() },
  { id: '2', name: 'Personal', createdAt: new Date().toISOString() },
  { id: '3', name: 'Urgent', createdAt: new Date().toISOString() },
];

const todos: Todo[] = [
  {
    id: '1',
    title: 'Complete project documentation',
    description: 'Write comprehensive documentation for the new feature',
    completed: false,
    priority: 'high',
    tagIds: ['1', '3'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Review code changes',
    description: 'Review pull requests from the team',
    completed: false,
    priority: 'medium',
    tagIds: ['1'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Buy groceries',
    description: 'Get milk, eggs, and bread',
    completed: true,
    priority: 'low',
    tagIds: ['2'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const app = new Hono();

app.use('*', cors());

app.get('/', (c) => {
  return c.json({
    message: 'Hello from Cloudflare Worker!',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', (c) => {
  return c.json({ status: 'ok' });
});

app.get('/api/tags', (c) => {
  const tagsWithCounts = tags.map((tag) => ({
    ...tag,
    count: todos.filter((todo) => todo.tagIds.includes(tag.id)).length,
  }));
  return c.json(tagsWithCounts);
});

app.post('/api/tags', async (c) => {
  const body = await c.req.json();
  const { name } = body;

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return c.json({ error: 'Tag name is required' }, 400);
  }

  const existingTag = tags.find((t) => t.name.toLowerCase() === name.toLowerCase());
  if (existingTag) {
    return c.json({ error: 'Tag already exists' }, 400);
  }

  const newTag: Tag = {
    id: String(Date.now()),
    name: name.trim(),
    createdAt: new Date().toISOString(),
  };

  tags.push(newTag);
  return c.json(newTag, 201);
});

app.delete('/api/tags/:id', (c) => {
  const id = c.req.param('id');
  const index = tags.findIndex((t) => t.id === id);

  if (index === -1) {
    return c.json({ error: 'Tag not found' }, 404);
  }

  todos.forEach((todo) => {
    todo.tagIds = todo.tagIds.filter((tagId) => tagId !== id);
  });

  tags.splice(index, 1);
  return c.json({ success: true });
});

app.get('/api/todos', (c) => {
  const tagIds = c.req.query('tagIds');
  const priority = c.req.query('priority');

  let filteredTodos = [...todos];

  if (tagIds) {
    const tagIdArray = tagIds.split(',');
    filteredTodos = filteredTodos.filter((todo) =>
      tagIdArray.some((tagId) => todo.tagIds.includes(tagId))
    );
  }

  if (priority) {
    filteredTodos = filteredTodos.filter((todo) => todo.priority === priority);
  }

  return c.json(filteredTodos);
});

app.get('/api/todos/:id', (c) => {
  const id = c.req.param('id');
  const todo = todos.find((t) => t.id === id);

  if (!todo) {
    return c.json({ error: 'Todo not found' }, 404);
  }

  return c.json(todo);
});

app.post('/api/todos', async (c) => {
  const body = await c.req.json();
  const { title, description, priority, tagIds } = body;

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return c.json({ error: 'Title is required' }, 400);
  }

  const newTodo: Todo = {
    id: String(Date.now()),
    title: title.trim(),
    description: description || '',
    completed: false,
    priority: priority || 'medium',
    tagIds: tagIds || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  todos.push(newTodo);
  return c.json(newTodo, 201);
});

app.put('/api/todos/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const todo = todos.find((t) => t.id === id);

  if (!todo) {
    return c.json({ error: 'Todo not found' }, 404);
  }

  if (body.title !== undefined) {
    if (typeof body.title !== 'string' || body.title.trim() === '') {
      return c.json({ error: 'Title is required' }, 400);
    }
    todo.title = body.title.trim();
  }

  if (body.description !== undefined) {
    todo.description = body.description;
  }

  if (body.completed !== undefined) {
    todo.completed = body.completed;
  }

  if (body.priority !== undefined) {
    todo.priority = body.priority;
  }

  if (body.tagIds !== undefined) {
    todo.tagIds = body.tagIds;
  }

  todo.updatedAt = new Date().toISOString();

  return c.json(todo);
});

app.delete('/api/todos/:id', (c) => {
  const id = c.req.param('id');
  const index = todos.findIndex((t) => t.id === id);

  if (index === -1) {
    return c.json({ error: 'Todo not found' }, 404);
  }

  todos.splice(index, 1);
  return c.json({ success: true });
});

export default app;
