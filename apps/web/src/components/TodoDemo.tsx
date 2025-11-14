import { useState } from 'react';
import { useTodos, useCreateTodo, useDeleteTodo, useToggleTodo, useTags } from '../lib/hooks';
import { useNotifications } from '../lib/context/NotificationContext';
import type { Priority } from '../lib/api/types';

export function TodoDemo() {
  const [filter, setFilter] = useState<{ priority?: Priority; tag?: string; search?: string }>({});
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const { addNotification } = useNotifications();

  const { data: todosData, isLoading: todosLoading, error: todosError } = useTodos(filter);
  const { data: tags } = useTags();
  const createTodo = useCreateTodo();
  const deleteTodo = useDeleteTodo();
  const toggleTodo = useToggleTodo();

  const handleCreateTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoTitle.trim()) return;

    try {
      await createTodo.mutateAsync({ title: newTodoTitle });
      setNewTodoTitle('');
      addNotification('success', 'Todo created successfully!');
    } catch (error) {
      addNotification('error', 'Failed to create todo');
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await toggleTodo.mutateAsync(id);
      addNotification('success', 'Todo updated!');
    } catch (error) {
      addNotification('error', 'Failed to update todo');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTodo.mutateAsync(id);
      addNotification('success', 'Todo deleted!');
    } catch (error) {
      addNotification('error', 'Failed to delete todo');
    }
  };

  if (todosLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading todos...</div>
      </div>
    );
  }

  if (todosError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">Error loading todos</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Todo App - Data Client Demo</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <form onSubmit={handleCreateTodo} className="flex gap-2">
            <input
              type="text"
              value={newTodoTitle}
              onChange={(e) => setNewTodoTitle(e.target.value)}
              placeholder="Add a new todo..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={createTodo.isPending}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {createTodo.isPending ? 'Adding...' : 'Add'}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Filters</h2>
          <div className="flex gap-4 flex-wrap">
            <select
              value={filter.priority || ''}
              onChange={(e) =>
                setFilter({ ...filter, priority: e.target.value as Priority | undefined })
              }
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>

            <select
              value={filter.tag || ''}
              onChange={(e) => setFilter({ ...filter, tag: e.target.value || undefined })}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">All Tags</option>
              {tags?.map((tag) => (
                <option key={tag.id} value={tag.id}>
                  {tag.name}
                </option>
              ))}
            </select>

            <input
              type="text"
              value={filter.search || ''}
              onChange={(e) => setFilter({ ...filter, search: e.target.value || undefined })}
              placeholder="Search..."
              className="px-4 py-2 border border-gray-300 rounded-lg"
            />

            <button
              onClick={() => setFilter({})}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Clear Filters
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Todos ({todosData?.total || 0})</h2>
          </div>

          <div className="divide-y divide-gray-200">
            {todosData?.data.map((todo) => (
              <div key={todo.id} className="p-6 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-4 flex-1">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => handleToggle(todo.id)}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                  <div className="flex-1">
                    <h3
                      className={`text-lg font-medium ${
                        todo.completed ? 'line-through text-gray-500' : 'text-gray-900'
                      }`}
                    >
                      {todo.title}
                    </h3>
                    {todo.description && (
                      <p className="text-sm text-gray-600 mt-1">{todo.description}</p>
                    )}
                    <div className="flex gap-2 mt-2">
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          todo.priority === 'high'
                            ? 'bg-red-100 text-red-800'
                            : todo.priority === 'medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {todo.priority}
                      </span>
                      {todo.tags.map((tagId) => {
                        const tag = tags?.find((t) => t.id === tagId);
                        return tag ? (
                          <span
                            key={tagId}
                            className="text-xs px-2 py-1 rounded"
                            style={{ backgroundColor: tag.color + '20', color: tag.color }}
                          >
                            {tag.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(todo.id)}
                  disabled={deleteTodo.isPending}
                  className="ml-4 px-4 py-2 text-red-600 hover:text-red-800 disabled:text-gray-400"
                >
                  Delete
                </button>
              </div>
            ))}

            {todosData?.data.length === 0 && (
              <div className="p-12 text-center text-gray-500">
                No todos found. Create one to get started!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
