import { TodoPriority } from '../../types/todo';

interface PriorityBadgeProps {
  priority: TodoPriority;
  className?: string;
}

const priorityStyles: Record<TodoPriority, string> = {
  high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
};

const priorityLabels: Record<TodoPriority, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export function PriorityBadge({ priority, className = '' }: PriorityBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityStyles[priority]} ${className}`}
    >
      {priorityLabels[priority]}
    </span>
  );
}
