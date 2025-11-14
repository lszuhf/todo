import { Hono } from 'hono';
import type { Env } from '../types';
import { TagRepository } from '../db';
import { createTagSchema } from '../schemas';

const app = new Hono<{ Bindings: Env }>();

app.get('/', async (c) => {
  try {
    const repo = new TagRepository(c.env.DB);
    const tags = await repo.getAllTags();

    return c.json({ tags });
  } catch (error) {
    console.error('Error fetching tags:', error);
    return c.json({ error: 'Failed to fetch tags' }, 500);
  }
});

app.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const validation = createTagSchema.safeParse(body);

    if (!validation.success) {
      return c.json(
        {
          error: 'Invalid request body',
          details: validation.error.errors,
        },
        400
      );
    }

    const { name } = validation.data;
    const repo = new TagRepository(c.env.DB);

    const exists = await repo.tagExists(name);
    if (exists) {
      return c.json({ error: 'Tag with this name already exists' }, 409);
    }

    const tag = await repo.createTag(name);

    return c.json(tag, 201);
  } catch (error) {
    console.error('Error creating tag:', error);
    return c.json({ error: 'Failed to create tag' }, 500);
  }
});

app.delete('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));

    if (isNaN(id)) {
      return c.json({ error: 'Invalid tag ID' }, 400);
    }

    const repo = new TagRepository(c.env.DB);
    const deleted = await repo.deleteTag(id);

    if (!deleted) {
      return c.json({ error: 'Tag not found' }, 404);
    }

    return c.json({ message: 'Tag deleted successfully' });
  } catch (error) {
    console.error('Error deleting tag:', error);
    return c.json({ error: 'Failed to delete tag' }, 500);
  }
});

export default app;
