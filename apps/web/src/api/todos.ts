import { apiRequest } from './client';
import { Todo, CreateTodoInput, UpdateTodoInput } from '../types/todo';

export const todosApi = {
  getAll: (): Promise<Todo[]> => {
    return apiRequest('/api/todos');
  },

  getById: (id: string): Promise<Todo> => {
    return apiRequest(`/api/todos/${id}`);
  },

  create: (input: CreateTodoInput): Promise<Todo> => {
    return apiRequest('/api/todos', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  update: (id: string, input: UpdateTodoInput): Promise<Todo> => {
    return apiRequest(`/api/todos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
  },

  delete: (id: string): Promise<{ success: boolean }> => {
    return apiRequest(`/api/todos/${id}`, {
      method: 'DELETE',
    });
  },

  getTags: (): Promise<string[]> => {
    return apiRequest('/api/tags');
  },
};
