import { Hono } from 'hono';
import type { Env } from '../types';
import { TodoRepository } from '../db';
import { createTodoSchema, updateTodoSchema, todoQuerySchema } from '../schemas';

const app = new Hono<{ Bindings: Env }>();

app.get('/', async (c) => {
  try {
    const queryResult = todoQuerySchema.safeParse({
      tagIds: c.req.query('tagIds'),
      priority: c.req.query('priority'),
      search: c.req.query('search'),
      completed: c.req.query('completed'),
    });

    if (!queryResult.success) {
      return c.json(
        {
          error: 'Invalid query parameters',
          details: queryResult.error.errors,
        },
        400
      );
    }

    const repo = new TodoRepository(c.env.DB);
    const todos = await repo.getAllTodos(queryResult.data);

    return c.json({
      todos: todos.map((todo) => ({
        ...todo,
        completed: Boolean(todo.completed),
      })),
    });
  } catch (error) {
    console.error('Error fetching todos:', error);
    return c.json({ error: 'Failed to fetch todos' }, 500);
  }
});

app.get('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));

    if (isNaN(id)) {
      return c.json({ error: 'Invalid todo ID' }, 400);
    }

    const repo = new TodoRepository(c.env.DB);
    const todo = await repo.getTodoById(id);

    if (!todo) {
      return c.json({ error: 'Todo not found' }, 404);
    }

    return c.json({
      ...todo,
      completed: Boolean(todo.completed),
    });
  } catch (error) {
    console.error('Error fetching todo:', error);
    return c.json({ error: 'Failed to fetch todo' }, 500);
  }
});

app.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const validation = createTodoSchema.safeParse(body);

    if (!validation.success) {
      return c.json(
        {
          error: 'Invalid request body',
          details: validation.error.errors,
        },
        400
      );
    }

    const { title, content, priority, completed, tagIds } = validation.data;

    const repo = new TodoRepository(c.env.DB);
    const todo = await repo.createTodo(title, content, priority, completed, tagIds);

    return c.json(
      {
        ...todo,
        completed: Boolean(todo.completed),
      },
      201
    );
  } catch (error) {
    console.error('Error creating todo:', error);
    return c.json({ error: 'Failed to create todo' }, 500);
  }
});

app.put('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));

    if (isNaN(id)) {
      return c.json({ error: 'Invalid todo ID' }, 400);
    }

    const body = await c.req.json();
    const validation = updateTodoSchema.safeParse(body);

    if (!validation.success) {
      return c.json(
        {
          error: 'Invalid request body',
          details: validation.error.errors,
        },
        400
      );
    }

    const repo = new TodoRepository(c.env.DB);
    const todo = await repo.updateTodo(id, validation.data);

    if (!todo) {
      return c.json({ error: 'Todo not found' }, 404);
    }

    return c.json({
      ...todo,
      completed: Boolean(todo.completed),
    });
  } catch (error) {
    console.error('Error updating todo:', error);
    return c.json({ error: 'Failed to update todo' }, 500);
  }
});

app.delete('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));

    if (isNaN(id)) {
      return c.json({ error: 'Invalid todo ID' }, 400);
    }

    const repo = new TodoRepository(c.env.DB);
    const deleted = await repo.deleteTodo(id);

    if (!deleted) {
      return c.json({ error: 'Todo not found' }, 404);
    }

    return c.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    console.error('Error deleting todo:', error);
    return c.json({ error: 'Failed to delete todo' }, 500);
  }
});

export default app;
