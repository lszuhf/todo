import { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  Modal,
  ModalFooter,
} from '../components/ui';

export function SettingsPage() {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [testInput, setTestInput] = useState('');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Settings</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Configure your preferences and manage data export. Features coming soon!
        </p>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">
              This is a placeholder for general settings. The component structure is ready for
              implementation.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Component Showcase</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Buttons
                </h4>
                <div className="flex flex-wrap gap-2">
                  <Button variant="primary" size="sm">
                    Primary Small
                  </Button>
                  <Button variant="secondary" size="md">
                    Secondary Medium
                  </Button>
                  <Button variant="ghost" size="lg">
                    Ghost Large
                  </Button>
                  <Button variant="danger">Danger</Button>
                  <Button disabled>Disabled</Button>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Inputs
                </h4>
                <div className="space-y-3 max-w-md">
                  <Input
                    label="Name"
                    placeholder="Enter your name"
                    value={testInput}
                    onChange={(e) => setTestInput(e.target.value)}
                  />
                  <Input
                    label="Email"
                    type="email"
                    placeholder="email@example.com"
                    helperText="We'll never share your email."
                  />
                  <Input label="Error State" error="This field is required" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Export</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">Export your data in various formats.</p>
            <Button variant="secondary" onClick={() => setIsExportModalOpen(true)}>
              Open Export Dialog
            </Button>
          </CardContent>
        </Card>
      </div>

      <Modal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Export Data"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            This is a placeholder modal for data export functionality. The modal component is fully
            functional and ready for implementation.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Features like JSON/CSV export, date range selection, and filtering will be added here.
          </p>
        </div>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setIsExportModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => setIsExportModalOpen(false)}>
            Export
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
