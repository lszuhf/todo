import { useQuery } from '@tanstack/react-query';
import { searchApi, type SearchOptions } from '../api/services/search';

export function useSearch(options: SearchOptions) {
  return useQuery({
    queryKey: ['search', options.query, options.limit],
    queryFn: () => searchApi.search(options),
    enabled: options.query.length > 0,
  });
}
