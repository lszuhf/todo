export type Env = {
  DB: D1Database;
};

export type Todo = {
  id: number;
  title: string;
  content: string | null;
  priority: 'low' | 'medium' | 'high';
  completed: number;
  created_at: string;
  updated_at: string;
};

export type Tag = {
  id: number;
  name: string;
  created_at: string;
};

export type TodoTag = {
  todo_id: number;
  tag_id: number;
};

export type TodoWithTags = Todo & {
  tags: Tag[];
};
