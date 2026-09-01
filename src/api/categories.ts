import apiClient from './client';
import { useQuery } from '@tanstack/react-query';

export interface Category {
  id: number;
  name: string;
  description?: string | null;
}

export const getCategories = async (page = 1, pageSize = 100): Promise<Category[]> => {
  const { data } = await apiClient.get<any>('/api/v1/categories/', {
    params: { page, page_size: pageSize },
  });
  if (data && Array.isArray(data.items)) {
    return data.items;
  }
  if (Array.isArray(data)) {
    return data;
  }
  return [];
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => getCategories(),
  });
};
