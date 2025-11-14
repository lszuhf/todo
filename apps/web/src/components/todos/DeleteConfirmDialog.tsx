import { Dialog } from '../ui';

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  todoTitle?: string;
}

export function DeleteConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  todoTitle,
}: DeleteConfirmDialogProps) {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Delete Todo"
      description={
        todoTitle
          ? `Are you sure you want to delete "${todoTitle}"? This action cannot be undone.`
          : 'Are you sure you want to delete this todo? This action cannot be undone.'
      }
      confirmText="Delete"
      cancelText="Cancel"
      variant="danger"
      isLoading={isLoading}
    />
  );
}
