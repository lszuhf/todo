import { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  Badge,
  Modal,
  ModalFooter,
} from '../components/ui';
import { useTags, useCreateTag, useDeleteTag } from '../hooks/useTags';

export function TagsPage() {
  const [newTagName, setNewTagName] = useState('');
  const [tagToDelete, setTagToDelete] = useState<{ id: string; name: string } | null>(null);
  const [error, setError] = useState('');

  const { data: tags, isLoading } = useTags();
  const createTag = useCreateTag();
  const deleteTag = useDeleteTag();

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newTagName.trim()) {
      setError('Tag name is required');
      return;
    }

    try {
      await createTag.mutateAsync(newTagName.trim());
      setNewTagName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create tag');
    }
  };

  const handleDeleteTag = async () => {
    if (!tagToDelete) return;

    try {
      await deleteTag.mutateAsync(tagToDelete.id);
      setTagToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete tag');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Tags</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Organize your todos with tags. Create, manage, and track tag usage.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Tag</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateTag} className="flex gap-3">
            <Input
              type="text"
              placeholder="Enter tag name..."
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              error={error}
              fullWidth
            />
            <Button type="submit" disabled={createTag.isPending}>
              {createTag.isPending ? 'Creating...' : 'Create'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Tags</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-gray-500 dark:text-gray-400">Loading tags...</p>
          ) : !tags || tags.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">
              No tags yet. Create your first tag above!
            </p>
          ) : (
            <div className="space-y-3">
              {tags.map((tag) => (
                <div
                  key={tag.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="primary">{tag.name}</Badge>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {tag.count === 0
                        ? 'Not used'
                        : tag.count === 1
                          ? '1 todo'
                          : `${tag.count} todos`}
                    </span>
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setTagToDelete({ id: tag.id, name: tag.name })}
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={!!tagToDelete}
        onClose={() => setTagToDelete(null)}
        title="Delete Tag"
        size="sm"
      >
        <p className="text-gray-700 dark:text-gray-300">
          Are you sure you want to delete the tag <strong>{tagToDelete?.name}</strong>? This will
          remove it from all todos.
        </p>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setTagToDelete(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteTag} disabled={deleteTag.isPending}>
            {deleteTag.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
