import { useMutation, useQueryClient } from '@tanstack/react-query';
import { todosApi } from '../api/services';
import type { CreateTodoInput } from '../api/types';

export function useCreateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTodoInput) => todosApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}
