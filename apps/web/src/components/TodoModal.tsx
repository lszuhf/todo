import { useState, useEffect } from 'react';
import { Modal, ModalFooter, Button, Input, Select, Badge } from './ui';
import { Todo, CreateTodoInput, UpdateTodoInput } from '../types';
import { useTags } from '../hooks/useTags';

interface TodoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateTodoInput | UpdateTodoInput) => Promise<void>;
  todo?: Todo;
  isLoading?: boolean;
}

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

export function TodoModal({ isOpen, onClose, onSave, todo, isLoading }: TodoModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [error, setError] = useState('');

  const { data: tags } = useTags();

  useEffect(() => {
    if (isOpen) {
      if (todo) {
        setTitle(todo.title);
        setDescription(todo.description);
        setPriority(todo.priority);
        setSelectedTagIds(todo.tagIds);
      } else {
        setTitle('');
        setDescription('');
        setPriority('medium');
        setSelectedTagIds([]);
      }
      setError('');
    }
  }, [isOpen, todo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    try {
      await onSave({
        title: title.trim(),
        description: description.trim(),
        priority,
        tagIds: selectedTagIds,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save todo');
    }
  };

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const selectedTags = tags?.filter((tag) => selectedTagIds.includes(tag.id)) || [];
  const availableTags = tags?.filter((tag) => !selectedTagIds.includes(tag.id)) || [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={todo ? 'Edit Todo' : 'Create Todo'} size="lg">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <Input
            label="Title"
            type="text"
            placeholder="Enter todo title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={error}
            fullWidth
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Description
            </label>
            <textarea
              placeholder="Enter description (optional)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 text-base bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-gray-100"
            />
          </div>

          <Select
            label="Priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
            options={priorityOptions}
            fullWidth
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tags
            </label>

            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedTags.map((tag) => (
                  <Badge key={tag.id} variant="primary" onRemove={() => toggleTag(tag.id)}>
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}

            {availableTags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    + {tag.name}
                  </button>
                ))}
              </div>
            ) : selectedTags.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No tags available. Create tags in the Tags page first.
              </p>
            ) : null}
          </div>
        </div>

        <ModalFooter>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : todo ? 'Update' : 'Create'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
