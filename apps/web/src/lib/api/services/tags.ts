import apiClient from '../client';
import type { Tag } from '../types';

export const tagsApi = {
  getAll: async () => {
    const { data } = await apiClient.get<Tag[]>('/tags');
    return data;
  },

  getById: async (id: string) => {
    const { data } = await apiClient.get<Tag>(`/tags/${id}`);
    return data;
  },

  create: async (input: Omit<Tag, 'id'>) => {
    const { data } = await apiClient.post<Tag>('/tags', input);
    return data;
  },

  update: async (id: string, input: Partial<Omit<Tag, 'id'>>) => {
    const { data } = await apiClient.patch<Tag>(`/tags/${id}`, input);
    return data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/tags/${id}`);
  },
};
