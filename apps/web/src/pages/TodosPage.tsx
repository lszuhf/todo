import { useState } from 'react';
import { Card, Button, Badge, Checkbox } from '../components/ui';
import { TodoModal } from '../components/TodoModal';
import { useTodos, useCreateTodo, useUpdateTodo, useDeleteTodo } from '../hooks/useTodos';
import { useTags } from '../hooks/useTags';
import { Todo, CreateTodoInput, UpdateTodoInput } from '../types';

const priorityColors = {
  low: 'default' as const,
  medium: 'warning' as const,
  high: 'danger' as const,
};

export function TodosPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | undefined>();
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [selectedPriority, setSelectedPriority] = useState<'low' | 'medium' | 'high' | null>(null);

  const filters = {
    tagIds: selectedTagIds.length > 0 ? selectedTagIds : undefined,
    priority: selectedPriority || undefined,
  };

  const { data: todos, isLoading } = useTodos(filters);
  const { data: tags } = useTags();
  const createTodo = useCreateTodo();
  const updateTodo = useUpdateTodo();
  const deleteTodo = useDeleteTodo();

  const handleOpenCreate = () => {
    setEditingTodo(undefined);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (todo: Todo) => {
    setEditingTodo(todo);
    setIsModalOpen(true);
  };

  const handleSave = async (data: CreateTodoInput | UpdateTodoInput) => {
    if (editingTodo) {
      await updateTodo.mutateAsync({ id: editingTodo.id, data: data as UpdateTodoInput });
    } else {
      await createTodo.mutateAsync(data as CreateTodoInput);
    }
  };

  const handleToggleComplete = async (todo: Todo) => {
    await updateTodo.mutateAsync({
      id: todo.id,
      data: { completed: !todo.completed },
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this todo?')) {
      await deleteTodo.mutateAsync(id);
    }
  };

  const toggleTagFilter = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const togglePriorityFilter = (priority: 'low' | 'medium' | 'high') => {
    setSelectedPriority((prev) => (prev === priority ? null : priority));
  };

  const clearFilters = () => {
    setSelectedTagIds([]);
    setSelectedPriority(null);
  };

  const hasActiveFilters = selectedTagIds.length > 0 || selectedPriority !== null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Todos</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your tasks and organize them with tags.
          </p>
        </div>
        <Button onClick={handleOpenCreate}>Create Todo</Button>
      </div>

      <Card>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Filters</h3>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filter by Tags
              </h4>
              <div className="flex flex-wrap gap-2">
                {tags && tags.length > 0 ? (
                  tags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => toggleTagFilter(tag.id)}
                      className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                        selectedTagIds.includes(tag.id)
                          ? 'bg-primary-600 text-white dark:bg-primary-500'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {tag.name}
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No tags available</p>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filter by Priority
              </h4>
              <div className="flex gap-2">
                {(['low', 'medium', 'high'] as const).map((priority) => (
                  <button
                    key={priority}
                    onClick={() => togglePriorityFilter(priority)}
                    className={`px-3 py-1.5 text-sm rounded-lg capitalize transition-colors ${
                      selectedPriority === priority
                        ? 'bg-primary-600 text-white dark:bg-primary-500'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {priority}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Active filters:</span>
              {selectedTagIds.map((tagId) => {
                const tag = tags?.find((t) => t.id === tagId);
                return tag ? (
                  <Badge key={tagId} variant="primary" onRemove={() => toggleTagFilter(tagId)}>
                    {tag.name}
                  </Badge>
                ) : null;
              })}
              {selectedPriority && (
                <Badge
                  variant={priorityColors[selectedPriority]}
                  onRemove={() => setSelectedPriority(null)}
                >
                  {selectedPriority}
                </Badge>
              )}
            </div>
          )}
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {isLoading ? (
            <div className="p-6">
              <p className="text-gray-500 dark:text-gray-400">Loading todos...</p>
            </div>
          ) : !todos || todos.length === 0 ? (
            <div className="p-6">
              <p className="text-gray-500 dark:text-gray-400">
                {hasActiveFilters
                  ? 'No todos match the selected filters.'
                  : 'No todos yet. Create your first todo!'}
              </p>
            </div>
          ) : (
            todos.map((todo) => (
              <div key={todo.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={todo.completed}
                    onChange={() => handleToggleComplete(todo)}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4
                        className={`text-base font-medium ${
                          todo.completed
                            ? 'line-through text-gray-400 dark:text-gray-500'
                            : 'text-gray-900 dark:text-gray-100'
                        }`}
                      >
                        {todo.title}
                      </h4>
                      <Badge variant={priorityColors[todo.priority]} size="sm">
                        {todo.priority}
                      </Badge>
                    </div>
                    {todo.description && (
                      <p
                        className={`text-sm mb-2 ${
                          todo.completed
                            ? 'text-gray-400 dark:text-gray-500'
                            : 'text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {todo.description}
                      </p>
                    )}
                    {todo.tagIds.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {todo.tagIds.map((tagId) => {
                          const tag = tags?.find((t) => t.id === tagId);
                          return tag ? (
                            <Badge key={tagId} variant="default" size="sm">
                              {tag.name}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(todo)}>
                      Edit
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(todo.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <TodoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        todo={editingTodo}
        isLoading={createTodo.isPending || updateTodo.isPending}
      />
    </div>
  );
}
