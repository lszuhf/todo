import apiClient from '../client';
import type { Todo } from '../types';

export interface SearchOptions {
  query: string;
  limit?: number;
}

export const searchApi = {
  search: async (options: SearchOptions) => {
    const params = new URLSearchParams();
    params.append('q', options.query);
    if (options.limit) params.append('limit', String(options.limit));

    const { data } = await apiClient.get<Todo[]>(`/search?${params.toString()}`);
    return data;
  },
};
