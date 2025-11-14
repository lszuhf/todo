import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { todosApi } from '../api/todos';
import { CreateTodoInput, UpdateTodoInput, Todo } from '../types/todo';
import { toast } from 'sonner';

export const TODOS_QUERY_KEY = ['todos'];
export const TAGS_QUERY_KEY = ['tags'];

export function useTodos() {
  return useQuery({
    queryKey: TODOS_QUERY_KEY,
    queryFn: todosApi.getAll,
  });
}

export function useTags() {
  return useQuery({
    queryKey: TAGS_QUERY_KEY,
    queryFn: todosApi.getTags,
  });
}

export function useCreateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTodoInput) => todosApi.create(input),
    onMutate: async (newTodo) => {
      await queryClient.cancelQueries({ queryKey: TODOS_QUERY_KEY });
      const previousTodos = queryClient.getQueryData<Todo[]>(TODOS_QUERY_KEY);

      queryClient.setQueryData<Todo[]>(TODOS_QUERY_KEY, (old = []) => [
        {
          id: 'temp-' + Date.now(),
          ...newTodo,
          tags: newTodo.tags || [],
          completed: newTodo.completed || false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        ...old,
      ]);

      return { previousTodos };
    },
    onSuccess: () => {
      toast.success('Todo created successfully');
    },
    onError: (error, _newTodo, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(TODOS_QUERY_KEY, context.previousTodos);
      }
      toast.error('Failed to create todo');
      console.error('Create todo error:', error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TODOS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: TAGS_QUERY_KEY });
    },
  });
}

export function useUpdateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTodoInput }) =>
      todosApi.update(id, input),
    onMutate: async ({ id, input }) => {
      await queryClient.cancelQueries({ queryKey: TODOS_QUERY_KEY });
      const previousTodos = queryClient.getQueryData<Todo[]>(TODOS_QUERY_KEY);

      queryClient.setQueryData<Todo[]>(TODOS_QUERY_KEY, (old = []) =>
        old.map((todo) =>
          todo.id === id
            ? { ...todo, ...input, updatedAt: new Date().toISOString() }
            : todo
        )
      );

      return { previousTodos };
    },
    onSuccess: () => {
      toast.success('Todo updated successfully');
    },
    onError: (error, _variables, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(TODOS_QUERY_KEY, context.previousTodos);
      }
      toast.error('Failed to update todo');
      console.error('Update todo error:', error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TODOS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: TAGS_QUERY_KEY });
    },
  });
}

export function useDeleteTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => todosApi.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: TODOS_QUERY_KEY });
      const previousTodos = queryClient.getQueryData<Todo[]>(TODOS_QUERY_KEY);

      queryClient.setQueryData<Todo[]>(TODOS_QUERY_KEY, (old = []) =>
        old.filter((todo) => todo.id !== id)
      );

      return { previousTodos };
    },
    onSuccess: () => {
      toast.success('Todo deleted successfully');
    },
    onError: (error, _id, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(TODOS_QUERY_KEY, context.previousTodos);
      }
      toast.error('Failed to delete todo');
      console.error('Delete todo error:', error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TODOS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: TAGS_QUERY_KEY });
    },
  });
}

export function useToggleTodoComplete() {
  const updateTodo = useUpdateTodo();

  return useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      updateTodo.mutateAsync({ id, input: { completed } }),
  });
}
