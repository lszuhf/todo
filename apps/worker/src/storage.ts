import { Todo, CreateTodoInput, UpdateTodoInput } from './schema';

let todos: Todo[] = [
  {
    id: '1',
    title: 'Complete project documentation',
    description: 'Write comprehensive documentation for the new todo feature',
    priority: 'high',
    tags: ['documentation', 'urgent'],
    completed: false,
    dueDate: '2024-12-31',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Review pull requests',
    description: '',
    priority: 'medium',
    tags: ['code-review'],
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Update dependencies',
    description: 'Check and update all npm packages',
    priority: 'low',
    tags: ['maintenance'],
    completed: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

let nextId = 4;

export const todoStorage = {
  getAll(): Todo[] {
    return [...todos];
  },

  getById(id: string): Todo | undefined {
    return todos.find((todo) => todo.id === id);
  },

  create(input: CreateTodoInput): Todo {
    const now = new Date().toISOString();
    const todo: Todo = {
      id: String(nextId++),
      title: input.title,
      description: input.description || '',
      priority: input.priority,
      tags: input.tags || [],
      completed: input.completed || false,
      dueDate: input.dueDate,
      createdAt: now,
      updatedAt: now,
    };
    todos.push(todo);
    return todo;
  },

  update(id: string, input: UpdateTodoInput): Todo | undefined {
    const index = todos.findIndex((todo) => todo.id === id);
    if (index === -1) return undefined;

    const current = todos[index];
    if (!current) return undefined;

    const updated: Todo = {
      id: current.id,
      title: input.title ?? current.title,
      description: input.description !== undefined ? input.description : current.description,
      priority: input.priority ?? current.priority,
      tags: input.tags ?? current.tags,
      completed: input.completed ?? current.completed,
      dueDate: input.dueDate !== undefined ? input.dueDate : current.dueDate,
      createdAt: current.createdAt,
      updatedAt: new Date().toISOString(),
    };
    todos[index] = updated;
    return updated;
  },

  delete(id: string): boolean {
    const index = todos.findIndex((todo) => todo.id === id);
    if (index === -1) return false;
    todos.splice(index, 1);
    return true;
  },

  getAllTags(): string[] {
    const tagSet = new Set<string>();
    todos.forEach((todo) => {
      todo.tags.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  },
};
