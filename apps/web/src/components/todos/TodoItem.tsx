import { Todo } from '../../types/todo';
import { PriorityBadge, TagChip, Button } from '../ui';

interface TodoItemProps {
  todo: Todo;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string, completed: boolean) => void;
}

export function TodoItem({ todo, onEdit, onDelete, onToggleComplete }: TodoItemProps) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={(e) => onToggleComplete(todo.id, e.target.checked)}
          className="mt-1 h-5 w-5 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500 dark:bg-gray-700"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3
              className={`text-base font-medium text-gray-900 dark:text-gray-100 ${
                todo.completed ? 'line-through text-gray-500 dark:text-gray-500' : ''
              }`}
            >
              {todo.title}
            </h3>
            <PriorityBadge priority={todo.priority} />
          </div>
          {todo.description && (
            <p
              className={`text-sm text-gray-600 dark:text-gray-400 mb-3 ${
                todo.completed ? 'line-through' : ''
              }`}
            >
              {todo.description}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {todo.tags.map((tag) => (
              <TagChip key={tag} tag={tag} />
            ))}
          </div>
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500 dark:text-gray-500">
              {todo.dueDate && (
                <span className="mr-3">
                  Due: {new Date(todo.dueDate).toLocaleDateString()}
                </span>
              )}
              <span>Created: {new Date(todo.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => onEdit(todo)}>
                Edit
              </Button>
              <Button variant="danger" size="sm" onClick={() => onDelete(todo.id)}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
