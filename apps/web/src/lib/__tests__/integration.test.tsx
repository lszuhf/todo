import { describe, it, expect } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useTodos, useCreateTodo, useToggleTodo, useDeleteTodo, useTags } from '../hooks';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'TestWrapper';
  return Wrapper;
}

describe('Integration Tests', () => {
  it('should create, toggle, and delete a todo', async () => {
    const wrapper = createWrapper();

    const { result: todosResult } = renderHook(() => useTodos(), { wrapper });
    const { result: createResult } = renderHook(() => useCreateTodo(), { wrapper });
    const { result: toggleResult } = renderHook(() => useToggleTodo(), { wrapper });
    const { result: deleteResult } = renderHook(() => useDeleteTodo(), { wrapper });

    await waitFor(() => {
      expect(todosResult.current.isSuccess).toBe(true);
    });

    const initialCount = todosResult.current.data?.total || 0;

    createResult.current.mutate({ title: 'Integration test todo' });

    await waitFor(() => {
      expect(createResult.current.isSuccess).toBe(true);
    });

    const newTodo = createResult.current.data;
    expect(newTodo?.title).toBe('Integration test todo');
    expect(newTodo?.completed).toBe(false);

    if (newTodo?.id) {
      toggleResult.current.mutate(newTodo.id);

      await waitFor(() => {
        expect(toggleResult.current.isSuccess).toBe(true);
      });

      const toggledTodo = toggleResult.current.data;
      expect(toggledTodo?.completed).toBe(true);

      deleteResult.current.mutate(newTodo.id);

      await waitFor(() => {
        expect(deleteResult.current.isSuccess).toBe(true);
      });
    }

    await waitFor(() => {
      todosResult.current.refetch();
    });

    expect(todosResult.current.data?.total).toBe(initialCount);
  });

  it('should fetch both todos and tags', async () => {
    const wrapper = createWrapper();

    const { result: todosResult } = renderHook(() => useTodos(), { wrapper });
    const { result: tagsResult } = renderHook(() => useTags(), { wrapper });

    await waitFor(() => {
      expect(todosResult.current.isSuccess).toBe(true);
      expect(tagsResult.current.isSuccess).toBe(true);
    });

    expect(todosResult.current.data?.data).toBeDefined();
    expect(tagsResult.current.data).toBeDefined();
    expect(tagsResult.current.data?.length).toBeGreaterThan(0);
  });

  it('should handle filters correctly', async () => {
    const wrapper = createWrapper();

    const { result: allTodos } = renderHook(() => useTodos(), { wrapper });
    const { result: highPriorityTodos } = renderHook(() => useTodos({ priority: 'high' }), {
      wrapper,
    });
    const { result: completedTodos } = renderHook(() => useTodos({ completed: true }), {
      wrapper,
    });

    await waitFor(() => {
      expect(allTodos.current.isSuccess).toBe(true);
      expect(highPriorityTodos.current.isSuccess).toBe(true);
      expect(completedTodos.current.isSuccess).toBe(true);
    });

    const allCount = allTodos.current.data?.total || 0;
    const highPriorityCount = highPriorityTodos.current.data?.total || 0;
    const completedCount = completedTodos.current.data?.total || 0;

    expect(highPriorityCount).toBeLessThanOrEqual(allCount);
    expect(completedCount).toBeLessThanOrEqual(allCount);

    highPriorityTodos.current.data?.data.forEach((todo) => {
      expect(todo.priority).toBe('high');
    });

    completedTodos.current.data?.data.forEach((todo) => {
      expect(todo.completed).toBe(true);
    });
  });
});
