import { useQuery } from '@tanstack/react-query';
import { todosApi } from '../api/services';
import type { TodoFilters } from '../api/types';

export function useTodos(filters?: TodoFilters, page = 1, pageSize = 20) {
  return useQuery({
    queryKey: ['todos', filters, page, pageSize],
    queryFn: () => todosApi.getAll(filters, page, pageSize),
  });
}

export function useTodo(id: string) {
  return useQuery({
    queryKey: ['todos', id],
    queryFn: () => todosApi.getById(id),
    enabled: !!id,
  });
}
