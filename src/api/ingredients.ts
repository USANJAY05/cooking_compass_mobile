import apiClient from './client';
import { useQuery } from '@tanstack/react-query';

export interface Ingredient {
  id: number;
  name: string;
  description?: string | null;
  source?: string;
  default_unit: string;
}

export const getIngredients = async (page = 1, pageSize = 50): Promise<Ingredient[]> => {
  const { data } = await apiClient.get<any>('/api/v1/ingredients/', {
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

export const searchIngredients = async (q: string, page = 1, pageSize = 20): Promise<Ingredient[]> => {
  const { data } = await apiClient.get<any>('/api/v1/ingredients/search', {
    params: { q, page, page_size: pageSize },
  });
  if (data && Array.isArray(data.items)) {
    return data.items;
  }
  if (Array.isArray(data)) {
    return data;
  }
  return [];
};

export const useIngredients = (page = 1, pageSize = 50) => {
  return useQuery({
    queryKey: ['ingredients', page, pageSize],
    queryFn: () => getIngredients(page, pageSize),
  });
};

export const useSearchIngredients = (q: string) => {
  return useQuery({
    queryKey: ['ingredients', 'search', q],
    queryFn: () => searchIngredients(q),
    enabled: q.trim().length > 0,
  });
};
