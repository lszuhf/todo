import { useState } from 'react';
import { Button, LoadingState } from '../components/ui';
import { TodoList, TodoModal, DeleteConfirmDialog } from '../components/todos';
import { useTodos, useTags, useCreateTodo, useUpdateTodo, useDeleteTodo } from '../hooks/useTodos';
import { Todo, CreateTodoInput } from '../types/todo';

export function TodosPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [deletingTodoId, setDeletingTodoId] = useState<string | null>(null);
  const [deletingTodoTitle, setDeletingTodoTitle] = useState<string>('');

  const { data: todos = [], isLoading, isError } = useTodos();
  const { data: tags = [] } = useTags();
  const createTodo = useCreateTodo();
  const updateTodo = useUpdateTodo();
  const deleteTodo = useDeleteTodo();

  const handleCreateNew = () => {
    setEditingTodo(null);
    setIsModalOpen(true);
  };

  const handleEdit = (todo: Todo) => {
    setEditingTodo(todo);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    const todo = todos.find((t) => t.id === id);
    setDeletingTodoId(id);
    setDeletingTodoTitle(todo?.title || '');
  };

  const handleConfirmDelete = async () => {
    if (deletingTodoId) {
      await deleteTodo.mutateAsync(deletingTodoId);
      setDeletingTodoId(null);
      setDeletingTodoTitle('');
    }
  };

  const handleToggleComplete = async (id: string, completed: boolean) => {
    await updateTodo.mutateAsync({ id, input: { completed } });
  };

  const handleSubmit = async (data: CreateTodoInput) => {
    if (editingTodo) {
      await updateTodo.mutateAsync({ id: editingTodo.id, input: data });
    } else {
      await createTodo.mutateAsync(data);
    }
    setIsModalOpen(false);
    setEditingTodo(null);
  };

  if (isLoading) {
    return <LoadingState message="Loading todos..." />;
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Todos</h2>
          <p className="text-red-600 dark:text-red-400">
            Error loading todos. Please make sure the API server is running.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Todos</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your todos and tasks efficiently
          </p>
        </div>
        <Button variant="primary" onClick={handleCreateNew}>
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          New Todo
        </Button>
      </div>

      <TodoList
        todos={todos}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleComplete={handleToggleComplete}
        onCreateNew={handleCreateNew}
      />

      <TodoModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTodo(null);
        }}
        onSubmit={handleSubmit}
        editTodo={editingTodo}
        isLoading={createTodo.isPending || updateTodo.isPending}
        availableTags={tags}
      />

      <DeleteConfirmDialog
        isOpen={deletingTodoId !== null}
        onClose={() => {
          setDeletingTodoId(null);
          setDeletingTodoTitle('');
        }}
        onConfirm={handleConfirmDelete}
        isLoading={deleteTodo.isPending}
        todoTitle={deletingTodoTitle}
      />
    </div>
  );
}
