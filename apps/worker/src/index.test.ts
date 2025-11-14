/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach } from 'vitest';
import app from './index';

describe('Worker API', () => {
  let env: { DB: D1Database };

  beforeEach(async () => {
    env = await getMiniflareBindings();
    await setupTestDatabase(env.DB);
  });

  describe('Root and Health', () => {
    it('should return API information at root', async () => {
      const res = await app.request('/', {}, env);
      expect(res.status).toBe(200);
      const data = (await res.json()) as any;
      expect(data).toHaveProperty('message', 'Todo API');
      expect(data).toHaveProperty('endpoints');
    });

    it('should return health status', async () => {
      const res = await app.request('/health', {}, env);
      expect(res.status).toBe(200);
      const data = (await res.json()) as any;
      expect(data).toEqual({ status: 'ok' });
    });
  });

  describe('Tags API', () => {
    it('should create a tag', async () => {
      const res = await app.request(
        '/api/tags',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'urgent' }),
        },
        env
      );

      expect(res.status).toBe(201);
      const data = (await res.json()) as any;
      expect(data).toHaveProperty('id');
      expect(data.name).toBe('urgent');
    });

    it('should not create duplicate tags', async () => {
      await app.request(
        '/api/tags',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'urgent' }),
        },
        env
      );

      const res = await app.request(
        '/api/tags',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'urgent' }),
        },
        env
      );

      expect(res.status).toBe(409);
      const data = (await res.json()) as any;
      expect(data.error).toContain('already exists');
    });

    it('should list all tags', async () => {
      await app.request(
        '/api/tags',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'work' }),
        },
        env
      );

      await app.request(
        '/api/tags',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'personal' }),
        },
        env
      );

      const res = await app.request('/api/tags', {}, env);
      expect(res.status).toBe(200);
      const data = (await res.json()) as any;
      expect(data.tags).toHaveLength(2);
    });

    it('should delete a tag', async () => {
      const createRes = await app.request(
        '/api/tags',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'temporary' }),
        },
        env
      );

      const tag = (await createRes.json()) as any;

      const deleteRes = await app.request(`/api/tags/${tag.id}`, { method: 'DELETE' }, env);
      expect(deleteRes.status).toBe(200);

      const listRes = await app.request('/api/tags', {}, env);
      const list = (await listRes.json()) as any;
      expect(list.tags).toHaveLength(0);
    });

    it('should return 404 when deleting non-existent tag', async () => {
      const res = await app.request('/api/tags/999', { method: 'DELETE' }, env);
      expect(res.status).toBe(404);
    });

    it('should validate tag creation input', async () => {
      const res = await app.request(
        '/api/tags',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: '' }),
        },
        env
      );

      expect(res.status).toBe(400);
      const data = (await res.json()) as any;
      expect(data.error).toBe('Invalid request body');
    });
  });

  describe('Todos API', () => {
    it('should create a todo', async () => {
      const res = await app.request(
        '/api/todos',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: 'Test Todo',
            content: 'Test content',
            priority: 'high',
          }),
        },
        env
      );

      expect(res.status).toBe(201);
      const data = (await res.json()) as any;
      expect(data).toHaveProperty('id');
      expect(data.title).toBe('Test Todo');
      expect(data.priority).toBe('high');
      expect(data.completed).toBe(false);
    });

    it('should create a todo with tags', async () => {
      const tagRes = await app.request(
        '/api/tags',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'work' }),
        },
        env
      );
      const tag = (await tagRes.json()) as any;

      const res = await app.request(
        '/api/todos',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: 'Work Task',
            tagIds: [tag.id],
          }),
        },
        env
      );

      expect(res.status).toBe(201);
      const data = (await res.json()) as any;
      expect(data.tags).toHaveLength(1);
      expect(data.tags[0].name).toBe('work');
    });

    it('should list all todos', async () => {
      await app.request(
        '/api/todos',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'Todo 1' }),
        },
        env
      );

      await app.request(
        '/api/todos',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'Todo 2' }),
        },
        env
      );

      const res = await app.request('/api/todos', {}, env);
      expect(res.status).toBe(200);
      const data = (await res.json()) as any;
      expect(data.todos).toHaveLength(2);
    });

    it('should get a todo by id', async () => {
      const createRes = await app.request(
        '/api/todos',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'Specific Todo' }),
        },
        env
      );
      const created = (await createRes.json()) as any;

      const res = await app.request(`/api/todos/${created.id}`, {}, env);
      expect(res.status).toBe(200);
      const data = (await res.json()) as any;
      expect(data.title).toBe('Specific Todo');
    });

    it('should update a todo', async () => {
      const createRes = await app.request(
        '/api/todos',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'Original Title' }),
        },
        env
      );
      const created = (await createRes.json()) as any;

      const res = await app.request(
        `/api/todos/${created.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: 'Updated Title',
            completed: true,
          }),
        },
        env
      );

      expect(res.status).toBe(200);
      const data = (await res.json()) as any;
      expect(data.title).toBe('Updated Title');
      expect(data.completed).toBe(true);
    });

    it('should delete a todo', async () => {
      const createRes = await app.request(
        '/api/todos',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'To Delete' }),
        },
        env
      );
      const created = (await createRes.json()) as any;

      const deleteRes = await app.request(`/api/todos/${created.id}`, { method: 'DELETE' }, env);
      expect(deleteRes.status).toBe(200);

      const getRes = await app.request(`/api/todos/${created.id}`, {}, env);
      expect(getRes.status).toBe(404);
    });

    it('should filter todos by priority', async () => {
      await app.request(
        '/api/todos',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'High Priority', priority: 'high' }),
        },
        env
      );

      await app.request(
        '/api/todos',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'Low Priority', priority: 'low' }),
        },
        env
      );

      const res = await app.request('/api/todos?priority=high', {}, env);
      const data = (await res.json()) as any;
      expect(data.todos).toHaveLength(1);
      expect(data.todos[0].priority).toBe('high');
    });

    it('should filter todos by completed status', async () => {
      const createRes = await app.request(
        '/api/todos',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'Not Done' }),
        },
        env
      );
      const created = (await createRes.json()) as any;

      await app.request(
        `/api/todos/${created.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ completed: true }),
        },
        env
      );

      await app.request(
        '/api/todos',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'Still Not Done' }),
        },
        env
      );

      const res = await app.request('/api/todos?completed=false', {}, env);
      const data = (await res.json()) as any;
      expect(data.todos).toHaveLength(1);
      expect(data.todos[0].completed).toBe(false);
    });

    it('should filter todos by tag', async () => {
      const tagRes = await app.request(
        '/api/tags',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'urgent' }),
        },
        env
      );
      const tag = (await tagRes.json()) as any;

      await app.request(
        '/api/todos',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'Urgent Task', tagIds: [tag.id] }),
        },
        env
      );

      await app.request(
        '/api/todos',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'Normal Task' }),
        },
        env
      );

      const res = await app.request(`/api/todos?tagIds=${tag.id}`, {}, env);
      const data = (await res.json()) as any;
      expect(data.todos).toHaveLength(1);
      expect(data.todos[0].title).toBe('Urgent Task');
    });

    it('should validate todo creation input', async () => {
      const res = await app.request(
        '/api/todos',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: '' }),
        },
        env
      );

      expect(res.status).toBe(400);
      const data = (await res.json()) as any;
      expect(data.error).toBe('Invalid request body');
    });

    it('should return 404 for non-existent todo', async () => {
      const res = await app.request('/api/todos/999', {}, env);
      expect(res.status).toBe(404);
    });
  });

  describe('Search API', () => {
    beforeEach(async () => {
      await app.request(
        '/api/todos',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: 'Buy groceries',
            content: 'Milk, eggs, bread',
          }),
        },
        env
      );

      await app.request(
        '/api/todos',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: 'Fix bug',
            content: 'Authentication issue in login',
          }),
        },
        env
      );
    });

    it('should search todos by title', async () => {
      const res = await app.request('/api/search?q=groceries', {}, env);
      expect(res.status).toBe(200);
      const data = (await res.json()) as any;
      expect(data.count).toBe(1);
      expect(data.results[0].title).toContain('groceries');
    });

    it('should search todos by content', async () => {
      const res = await app.request('/api/search?q=login', {}, env);
      expect(res.status).toBe(200);
      const data = (await res.json()) as any;
      expect(data.count).toBe(1);
      expect(data.results[0].content).toContain('login');
    });

    it('should return empty results for no matches', async () => {
      const res = await app.request('/api/search?q=nonexistent', {}, env);
      expect(res.status).toBe(200);
      const data = (await res.json()) as any;
      expect(data.count).toBe(0);
      expect(data.results).toHaveLength(0);
    });

    it('should require search keyword', async () => {
      const res = await app.request('/api/search', {}, env);
      expect(res.status).toBe(400);
      const data = (await res.json()) as any;
      expect(data.error).toContain('keyword is required');
    });
  });

  describe('Export API', () => {
    beforeEach(async () => {
      const tagRes = await app.request(
        '/api/tags',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'work' }),
        },
        env
      );
      const tag = (await tagRes.json()) as any;

      await app.request(
        '/api/todos',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: 'Test Task',
            content: 'Test content',
            priority: 'high',
            tagIds: [tag.id],
          }),
        },
        env
      );
    });

    it('should export as JSON by default', async () => {
      const res = await app.request('/api/export', {}, env);
      expect(res.status).toBe(200);
      expect(res.headers.get('content-type')).toContain('application/json');

      const data = (await res.json()) as any;
      expect(data).toHaveProperty('exported_at');
      expect(data).toHaveProperty('todos');
      expect(data).toHaveProperty('tags');
      expect(data.todos).toHaveLength(1);
      expect(data.tags).toHaveLength(1);
    });

    it('should export as CSV when requested', async () => {
      const res = await app.request('/api/export?format=csv', {}, env);
      expect(res.status).toBe(200);
      expect(res.headers.get('content-type')).toBe('text/csv');

      const csv = await res.text();
      expect(csv).toContain('ID,Title,Content,Priority,Completed,Tags,Created At,Updated At');
      expect(csv).toContain('Test Task');
      expect(csv).toContain('work');
    });

    it('should escape CSV values properly', async () => {
      await app.request(
        '/api/todos',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: 'Task with, comma',
            content: 'Content with "quotes"',
          }),
        },
        env
      );

      const res = await app.request('/api/export?format=csv', {}, env);
      const csv = await res.text();
      expect(csv).toContain('"Task with, comma"');
      expect(csv).toContain('"Content with ""quotes"""');
    });

    it('should reject invalid format', async () => {
      const res = await app.request('/api/export?format=xml', {}, env);
      expect(res.status).toBe(400);
    });
  });
});

async function getMiniflareBindings(): Promise<{ DB: D1Database }> {
  const { env } = (await import('cloudflare:test')) as any;
  return env;
}

async function setupTestDatabase(db: D1Database): Promise<void> {
  await db.batch([
    db.prepare('DROP TABLE IF EXISTS todo_tags'),
    db.prepare('DROP TABLE IF EXISTS todos'),
    db.prepare('DROP TABLE IF EXISTS tags'),
    db.prepare(`
      CREATE TABLE tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `),
    db.prepare(`
      CREATE TABLE todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT,
        priority TEXT CHECK(priority IN ('low', 'medium', 'high')) NOT NULL DEFAULT 'medium',
        completed INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `),
    db.prepare(`
      CREATE TABLE todo_tags (
        todo_id INTEGER NOT NULL,
        tag_id INTEGER NOT NULL,
        PRIMARY KEY (todo_id, tag_id),
        FOREIGN KEY (todo_id) REFERENCES todos(id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
      )
    `),
    db.prepare('CREATE INDEX idx_todos_priority ON todos(priority)'),
    db.prepare('CREATE INDEX idx_todos_completed ON todos(completed)'),
    db.prepare('CREATE INDEX idx_todos_created_at ON todos(created_at)'),
    db.prepare('CREATE INDEX idx_todo_tags_todo_id ON todo_tags(todo_id)'),
    db.prepare('CREATE INDEX idx_todo_tags_tag_id ON todo_tags(tag_id)'),
  ]);
}
