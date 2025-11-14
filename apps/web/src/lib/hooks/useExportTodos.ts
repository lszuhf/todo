import { useMutation } from '@tanstack/react-query';
import { exportApi } from '../api/services';
import type { ExportOptions } from '../api/types';

export function useExportTodos() {
  return useMutation({
    mutationFn: (options: ExportOptions) => exportApi.exportTodos(options),
    onSuccess: (data, variables) => {
      if (variables.format === 'csv') {
        const blob = data as Blob;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `todos-${new Date().toISOString()}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `todos-${new Date().toISOString()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    },
  });
}
