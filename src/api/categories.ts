import { useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import apiClient from './client';
import { queryKeys } from './queryKeys';

export interface Category {
  id: number;
  name: string;
  description?: string | null;
}

const CATEGORIES_STALE_TIME = 30 * 60_000;
const CATEGORIES_GC_TIME = 7 * 24 * 60 * 60_000;

export const getCategories = async (page = 1, pageSize = 100): Promise<Category[]> => {
  const { data } = await apiClient.get<any>('/api/v1/categories/', {
    params: { page, page_size: pageSize },
  });
  if (data && Array.isArray(data.items)) return data.items;
  if (Array.isArray(data)) return data;
  return [];
};

/** Categories change infrequently, so keep them cached and let explicit refresh invalidate them. */
export const useCategories = (page = 1, pageSize = 100) => {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: queryKeys.categories.list(page, pageSize),
    queryFn: () => getCategories(page, pageSize),
    staleTime: CATEGORIES_STALE_TIME,
    gcTime: CATEGORIES_GC_TIME,
    retry: false,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const reload = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.categories.all, refetchType: 'none' });
    return query.refetch();
  };

  return { ...query, reload };
};

export const invalidateCategories = async (queryClient: QueryClient) => {
  await queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
};
