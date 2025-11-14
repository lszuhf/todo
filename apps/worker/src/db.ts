import type { Todo, Tag, TodoWithTags } from './types';

export class TodoRepository {
  constructor(private db: D1Database) {}

  async getAllTodos(params?: {
    tagIds?: number[];
    priority?: string;
    search?: string;
    completed?: boolean;
  }): Promise<TodoWithTags[]> {
    let query = 'SELECT * FROM todos WHERE 1=1';
    const bindings: unknown[] = [];

    if (params?.priority) {
      query += ' AND priority = ?';
      bindings.push(params.priority);
    }

    if (params?.completed !== undefined) {
      query += ' AND completed = ?';
      bindings.push(params.completed ? 1 : 0);
    }

    if (params?.search) {
      query += ' AND (title LIKE ? OR content LIKE ?)';
      const searchTerm = `%${params.search}%`;
      bindings.push(searchTerm, searchTerm);
    }

    if (params?.tagIds && params.tagIds.length > 0) {
      const placeholders = params.tagIds.map(() => '?').join(',');
      query += ` AND id IN (
        SELECT DISTINCT todo_id FROM todo_tags WHERE tag_id IN (${placeholders})
      )`;
      bindings.push(...params.tagIds);
    }

    query += ' ORDER BY created_at DESC';

    const result = await this.db
      .prepare(query)
      .bind(...bindings)
      .all<Todo>();
    const todos = result.results || [];

    const todosWithTags = await Promise.all(todos.map((todo) => this.getTodoWithTags(todo)));

    return todosWithTags;
  }

  async getTodoById(id: number): Promise<TodoWithTags | null> {
    const result = await this.db.prepare('SELECT * FROM todos WHERE id = ?').bind(id).first<Todo>();

    if (!result) {
      return null;
    }

    return this.getTodoWithTags(result);
  }

  async createTodo(
    title: string,
    content: string | undefined,
    priority: string,
    completed: boolean,
    tagIds?: number[]
  ): Promise<TodoWithTags> {
    const now = new Date().toISOString();
    const result = await this.db
      .prepare(
        'INSERT INTO todos (title, content, priority, completed, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?) RETURNING *'
      )
      .bind(title, content || null, priority, completed ? 1 : 0, now, now)
      .first<Todo>();

    if (!result) {
      throw new Error('Failed to create todo');
    }

    if (tagIds && tagIds.length > 0) {
      await this.setTodoTags(result.id, tagIds);
    }

    return this.getTodoWithTags(result);
  }

  async updateTodo(
    id: number,
    updates: {
      title?: string;
      content?: string | null;
      priority?: string;
      completed?: boolean;
      tagIds?: number[];
    }
  ): Promise<TodoWithTags | null> {
    const existing = await this.getTodoById(id);
    if (!existing) {
      return null;
    }

    const fields: string[] = [];
    const bindings: unknown[] = [];

    if (updates.title !== undefined) {
      fields.push('title = ?');
      bindings.push(updates.title);
    }

    if (updates.content !== undefined) {
      fields.push('content = ?');
      bindings.push(updates.content);
    }

    if (updates.priority !== undefined) {
      fields.push('priority = ?');
      bindings.push(updates.priority);
    }

    if (updates.completed !== undefined) {
      fields.push('completed = ?');
      bindings.push(updates.completed ? 1 : 0);
    }

    if (fields.length > 0) {
      fields.push('updated_at = ?');
      bindings.push(new Date().toISOString());
      bindings.push(id);

      const query = `UPDATE todos SET ${fields.join(', ')} WHERE id = ?`;
      await this.db
        .prepare(query)
        .bind(...bindings)
        .run();
    }

    if (updates.tagIds !== undefined) {
      await this.setTodoTags(id, updates.tagIds);
    }

    return this.getTodoById(id);
  }

  async deleteTodo(id: number): Promise<boolean> {
    const result = await this.db.prepare('DELETE FROM todos WHERE id = ?').bind(id).run();
    return result.meta.changes > 0;
  }

  private async getTodoWithTags(todo: Todo): Promise<TodoWithTags> {
    const tags = await this.db
      .prepare(
        `SELECT t.* FROM tags t
         INNER JOIN todo_tags tt ON t.id = tt.tag_id
         WHERE tt.todo_id = ?
         ORDER BY t.name`
      )
      .bind(todo.id)
      .all<Tag>();

    return {
      ...todo,
      tags: tags.results || [],
    };
  }

  private async setTodoTags(todoId: number, tagIds: number[]): Promise<void> {
    await this.db.prepare('DELETE FROM todo_tags WHERE todo_id = ?').bind(todoId).run();

    if (tagIds.length > 0) {
      const placeholders = tagIds.map(() => '(?, ?)').join(', ');
      const bindings = tagIds.flatMap((tagId) => [todoId, tagId]);
      await this.db
        .prepare(`INSERT INTO todo_tags (todo_id, tag_id) VALUES ${placeholders}`)
        .bind(...bindings)
        .run();
    }
  }
}

export class TagRepository {
  constructor(private db: D1Database) {}

  async getAllTags(): Promise<Tag[]> {
    const result = await this.db.prepare('SELECT * FROM tags ORDER BY name').all<Tag>();
    return result.results || [];
  }

  async getTagById(id: number): Promise<Tag | null> {
    return this.db.prepare('SELECT * FROM tags WHERE id = ?').bind(id).first<Tag>();
  }

  async createTag(name: string): Promise<Tag> {
    const now = new Date().toISOString();
    const result = await this.db
      .prepare('INSERT INTO tags (name, created_at) VALUES (?, ?) RETURNING *')
      .bind(name, now)
      .first<Tag>();

    if (!result) {
      throw new Error('Failed to create tag');
    }

    return result;
  }

  async deleteTag(id: number): Promise<boolean> {
    const result = await this.db.prepare('DELETE FROM tags WHERE id = ?').bind(id).run();
    return result.meta.changes > 0;
  }

  async tagExists(name: string): Promise<boolean> {
    const result = await this.db
      .prepare('SELECT COUNT(*) as count FROM tags WHERE name = ?')
      .bind(name)
      .first<{ count: number }>();
    return (result?.count || 0) > 0;
  }
}
