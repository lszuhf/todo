import { describe, it, expect } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useCreateTodo } from '../hooks/useCreateTodo';

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

describe('useCreateTodo', () => {
  it('should create a todo successfully', async () => {
    const { result } = renderHook(() => useCreateTodo(), {
      wrapper: createWrapper(),
    });

    const newTodo = {
      title: 'New test todo',
      description: 'This is a test',
      priority: 'medium' as const,
      tags: ['1'],
    };

    result.current.mutate(newTodo);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.title).toBe(newTodo.title);
    expect(result.current.data?.description).toBe(newTodo.description);
    expect(result.current.data?.priority).toBe(newTodo.priority);
  });

  it('should handle creation with minimal data', async () => {
    const { result } = renderHook(() => useCreateTodo(), {
      wrapper: createWrapper(),
    });

    const newTodo = {
      title: 'Minimal todo',
    };

    result.current.mutate(newTodo);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.title).toBe(newTodo.title);
    expect(result.current.data?.completed).toBe(false);
  });
});
