import { Card, CardHeader, CardTitle, CardContent } from '../components/ui';

export function TagsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Tags</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Organize your content with tags. Features coming soon!
        </p>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Tag Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              This is a placeholder for the tags functionality. The component structure is ready for
              implementation.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
