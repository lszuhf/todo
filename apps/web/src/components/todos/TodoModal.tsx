import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateTodoSchema, CreateTodoInput, Todo } from '../../types/todo';
import { Modal, ModalFooter, Button, Input, Textarea, Select, TagChip } from '../ui';

interface TodoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTodoInput) => void;
  editTodo?: Todo | null;
  isLoading?: boolean;
  availableTags?: string[];
}

export function TodoModal({
  isOpen,
  onClose,
  onSubmit,
  editTodo,
  isLoading = false,
  availableTags = [],
}: TodoModalProps) {
  const [newTag, setNewTag] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<CreateTodoInput>({
    resolver: zodResolver(CreateTodoSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium',
      tags: [],
      completed: false,
      dueDate: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (editTodo) {
        reset({
          title: editTodo.title,
          description: editTodo.description || '',
          priority: editTodo.priority,
          tags: editTodo.tags,
          completed: editTodo.completed,
          dueDate: editTodo.dueDate || '',
        });
        setSelectedTags(editTodo.tags);
      } else {
        reset({
          title: '',
          description: '',
          priority: 'medium',
          tags: [],
          completed: false,
          dueDate: '',
        });
        setSelectedTags([]);
      }
      setNewTag('');
    }
  }, [isOpen, editTodo, reset]);

  useEffect(() => {
    setValue('tags', selectedTags);
  }, [selectedTags, setValue]);

  const handleAddTag = () => {
    const trimmedTag = newTag.trim();
    if (trimmedTag && !selectedTags.includes(trimmedTag)) {
      setSelectedTags([...selectedTags, trimmedTag]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter((tag) => tag !== tagToRemove));
  };

  const handleFormSubmit = (data: CreateTodoInput) => {
    onSubmit({ ...data, tags: selectedTags });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editTodo ? 'Edit Todo' : 'Create New Todo'}
      size="lg"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <Input
          label="Title *"
          placeholder="Enter todo title"
          error={errors.title?.message}
          fullWidth
          {...register('title')}
        />

        <Textarea
          label="Description"
          placeholder="Enter todo description (optional)"
          rows={3}
          error={errors.description?.message}
          fullWidth
          {...register('description')}
        />

        <Select
          label="Priority *"
          error={errors.priority?.message}
          fullWidth
          {...register('priority')}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </Select>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Tags
          </label>
          <div className="flex gap-2 mb-2">
            <Input
              placeholder="Add a tag"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              className="flex-1"
            />
            <Button type="button" variant="secondary" onClick={handleAddTag}>
              Add
            </Button>
          </div>
          {availableTags.length > 0 && (
            <div className="mb-2">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Quick add:</p>
              <div className="flex flex-wrap gap-1">
                {availableTags
                  .filter((tag) => !selectedTags.includes(tag))
                  .map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setSelectedTags([...selectedTags, tag])}
                      className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      + {tag}
                    </button>
                  ))}
              </div>
            </div>
          )}
          {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedTags.map((tag) => (
                <TagChip key={tag} tag={tag} onRemove={() => handleRemoveTag(tag)} />
              ))}
            </div>
          )}
        </div>

        <Input
          label="Due Date"
          type="date"
          error={errors.dueDate?.message}
          fullWidth
          {...register('dueDate')}
        />

        {editTodo && (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="completed"
              className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
              {...register('completed')}
            />
            <label
              htmlFor="completed"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Mark as completed
            </label>
          </div>
        )}

        <ModalFooter>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? 'Saving...' : editTodo ? 'Update Todo' : 'Create Todo'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
