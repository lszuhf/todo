import type { D1Database } from '@cloudflare/workers-types';
import type { User, Todo, Tag, InsertTodo, UpdateTodo, InsertTag, TodoWithTags } from './schema';

/**
 * User queries
 */
export async function getUserById(db: D1Database, id: number): Promise<User | null> {
  const result = await db.prepare('SELECT * FROM users WHERE id = ?').bind(id).first<User>();
  return result;
}

export async function getAllUsers(db: D1Database): Promise<User[]> {
  const result = await db.prepare('SELECT * FROM users').all<User>();
  return result.results || [];
}

/**
 * Todo queries
 */
export async function getTodoById(db: D1Database, id: number): Promise<Todo | null> {
  const result = await db.prepare('SELECT * FROM todos WHERE id = ?').bind(id).first<Todo>();
  return result;
}

export async function getTodosByUserId(db: D1Database, userId: number): Promise<Todo[]> {
  const result = await db
    .prepare('SELECT * FROM todos WHERE user_id = ? ORDER BY created_at DESC')
    .bind(userId)
    .all<Todo>();
  return result.results || [];
}

export async function getTodoWithTags(db: D1Database, id: number): Promise<TodoWithTags | null> {
  // Get the todo
  const todo = await getTodoById(db, id);
  if (!todo) return null;

  // Get associated tags
  const tagsResult = await db
    .prepare(
      `
      SELECT t.* FROM tags t
      INNER JOIN todo_tags tt ON t.id = tt.tag_id
      WHERE tt.todo_id = ?
    `
    )
    .bind(id)
    .all<Tag>();

  return {
    ...todo,
    tags: tagsResult.results || [],
  };
}

export async function createTodo(db: D1Database, todo: InsertTodo): Promise<number> {
  const result = await db
    .prepare(
      `
      INSERT INTO todos (user_id, title, description, priority, completed, due_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `
    )
    .bind(
      todo.user_id,
      todo.title,
      todo.description || null,
      todo.priority,
      todo.completed,
      todo.due_date || null
    )
    .run();

  return result.meta.last_row_id;
}

export async function updateTodo(
  db: D1Database,
  id: number,
  updates: UpdateTodo
): Promise<boolean> {
  const fields: string[] = [];
  const values: unknown[] = [];

  if (updates.title !== undefined) {
    fields.push('title = ?');
    values.push(updates.title);
  }
  if (updates.description !== undefined) {
    fields.push('description = ?');
    values.push(updates.description);
  }
  if (updates.priority !== undefined) {
    fields.push('priority = ?');
    values.push(updates.priority);
  }
  if (updates.completed !== undefined) {
    fields.push('completed = ?');
    values.push(updates.completed);
    if (updates.completed === 1) {
      fields.push('completed_at = ?');
      values.push(new Date().toISOString());
    }
  }
  if (updates.due_date !== undefined) {
    fields.push('due_date = ?');
    values.push(updates.due_date);
  }

  if (fields.length === 0) return false;

  fields.push('updated_at = ?');
  values.push(new Date().toISOString());
  values.push(id);

  const sql = `UPDATE todos SET ${fields.join(', ')} WHERE id = ?`;
  const result = await db
    .prepare(sql)
    .bind(...values)
    .run();

  return result.success;
}

export async function deleteTodo(db: D1Database, id: number): Promise<boolean> {
  const result = await db.prepare('DELETE FROM todos WHERE id = ?').bind(id).run();
  return result.success;
}

export async function searchTodos(db: D1Database, userId: number, query: string): Promise<Todo[]> {
  const searchPattern = `%${query}%`;
  const result = await db
    .prepare(
      `
      SELECT * FROM todos
      WHERE user_id = ? AND (title LIKE ? OR description LIKE ?)
      ORDER BY created_at DESC
    `
    )
    .bind(userId, searchPattern, searchPattern)
    .all<Todo>();

  return result.results || [];
}

export async function getTodosByPriority(
  db: D1Database,
  userId: number,
  priority: string
): Promise<Todo[]> {
  const result = await db
    .prepare(
      `
      SELECT * FROM todos
      WHERE user_id = ? AND priority = ?
      ORDER BY due_date ASC, created_at DESC
    `
    )
    .bind(userId, priority)
    .all<Todo>();

  return result.results || [];
}

export async function getIncompleteTodos(db: D1Database, userId: number): Promise<Todo[]> {
  const result = await db
    .prepare(
      `
      SELECT * FROM todos
      WHERE user_id = ? AND completed = 0
      ORDER BY priority DESC, created_at ASC
    `
    )
    .bind(userId)
    .all<Todo>();

  return result.results || [];
}

/**
 * Tag queries
 */
export async function getAllTags(db: D1Database): Promise<Tag[]> {
  const result = await db.prepare('SELECT * FROM tags ORDER BY name ASC').all<Tag>();
  return result.results || [];
}

export async function getTagById(db: D1Database, id: number): Promise<Tag | null> {
  const result = await db.prepare('SELECT * FROM tags WHERE id = ?').bind(id).first<Tag>();
  return result;
}

export async function getTagByName(db: D1Database, name: string): Promise<Tag | null> {
  const result = await db.prepare('SELECT * FROM tags WHERE name = ?').bind(name).first<Tag>();
  return result;
}

export async function createTag(db: D1Database, tag: InsertTag): Promise<number> {
  const result = await db
    .prepare('INSERT INTO tags (name, color) VALUES (?, ?)')
    .bind(tag.name, tag.color || null)
    .run();

  return result.meta.last_row_id;
}

export async function deleteTag(db: D1Database, id: number): Promise<boolean> {
  const result = await db.prepare('DELETE FROM tags WHERE id = ?').bind(id).run();
  return result.success;
}

/**
 * Todo-Tag relationship queries
 */
export async function addTagToTodo(db: D1Database, todoId: number, tagId: number): Promise<void> {
  await db
    .prepare('INSERT OR IGNORE INTO todo_tags (todo_id, tag_id) VALUES (?, ?)')
    .bind(todoId, tagId)
    .run();
}

export async function removeTagFromTodo(
  db: D1Database,
  todoId: number,
  tagId: number
): Promise<void> {
  await db
    .prepare('DELETE FROM todo_tags WHERE todo_id = ? AND tag_id = ?')
    .bind(todoId, tagId)
    .run();
}

export async function getTagsForTodo(db: D1Database, todoId: number): Promise<Tag[]> {
  const result = await db
    .prepare(
      `
      SELECT t.* FROM tags t
      INNER JOIN todo_tags tt ON t.id = tt.tag_id
      WHERE tt.todo_id = ?
      ORDER BY t.name ASC
    `
    )
    .bind(todoId)
    .all<Tag>();

  return result.results || [];
}

export async function getTodosByTag(
  db: D1Database,
  userId: number,
  tagName: string
): Promise<Todo[]> {
  const result = await db
    .prepare(
      `
      SELECT t.* FROM todos t
      INNER JOIN todo_tags tt ON t.id = tt.todo_id
      INNER JOIN tags tag ON tt.tag_id = tag.id
      WHERE t.user_id = ? AND tag.name = ?
      ORDER BY t.created_at DESC
    `
    )
    .bind(userId, tagName)
    .all<Todo>();

  return result.results || [];
}
