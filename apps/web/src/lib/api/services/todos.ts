import apiClient from '../client';
import type {
  Todo,
  CreateTodoInput,
  UpdateTodoInput,
  TodoFilters,
  PaginatedResponse,
} from '../types';

export const todosApi = {
  getAll: async (filters?: TodoFilters, page = 1, pageSize = 20) => {
    const params = new URLSearchParams();

    if (filters?.tag) params.append('tag', filters.tag);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.completed !== undefined) params.append('completed', String(filters.completed));
    if (filters?.search) params.append('search', filters.search);
    params.append('page', String(page));
    params.append('pageSize', String(pageSize));

    const { data } = await apiClient.get<PaginatedResponse<Todo>>(`/todos?${params.toString()}`);
    return data;
  },

  getById: async (id: string) => {
    const { data } = await apiClient.get<Todo>(`/todos/${id}`);
    return data;
  },

  create: async (input: CreateTodoInput) => {
    const { data } = await apiClient.post<Todo>('/todos', input);
    return data;
  },

  update: async (id: string, input: UpdateTodoInput) => {
    const { data } = await apiClient.patch<Todo>(`/todos/${id}`, input);
    return data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/todos/${id}`);
  },

  toggleComplete: async (id: string) => {
    const { data } = await apiClient.patch<Todo>(`/todos/${id}/toggle`, {});
    return data;
  },
};
