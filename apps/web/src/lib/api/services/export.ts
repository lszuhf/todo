import apiClient from '../client';
import type { ExportOptions } from '../types';

export const exportApi = {
  exportTodos: async (options: ExportOptions) => {
    const params = new URLSearchParams();
    params.append('format', options.format);

    if (options.filters?.tag) params.append('tag', options.filters.tag);
    if (options.filters?.priority) params.append('priority', options.filters.priority);
    if (options.filters?.completed !== undefined) {
      params.append('completed', String(options.filters.completed));
    }
    if (options.filters?.search) params.append('search', options.filters.search);

    const { data } = await apiClient.get(`/export?${params.toString()}`, {
      responseType: options.format === 'csv' ? 'blob' : 'json',
    });
    return data;
  },
};
