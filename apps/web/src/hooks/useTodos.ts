import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../api/client';
import { Todo, CreateTodoInput, UpdateTodoInput } from '../types';

interface TodoFilters {
  tagIds?: string[];
  priority?: 'low' | 'medium' | 'high';
}

export function useTodos(filters?: TodoFilters) {
  const queryParams = new URLSearchParams();

  if (filters?.tagIds && filters.tagIds.length > 0) {
    queryParams.set('tagIds', filters.tagIds.join(','));
  }

  if (filters?.priority) {
    queryParams.set('priority', filters.priority);
  }

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/api/todos?${queryString}` : '/api/todos';

  return useQuery<Todo[]>({
    queryKey: ['todos', filters],
    queryFn: () => apiRequest<Todo[]>(endpoint),
  });
}

export function useCreateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTodoInput) =>
      apiRequest<Todo>('/api/todos', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });
}

export function useUpdateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTodoInput }) =>
      apiRequest<Todo>(`/api/todos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });
}

export function useDeleteTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiRequest<{ success: boolean }>(`/api/todos/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });
}
