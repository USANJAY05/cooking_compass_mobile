import apiClient from './client';
import { CartResponse } from './types';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';

export const getCart = async (days = 7): Promise<CartResponse> => {
  const { data } = await apiClient.get<CartResponse>('/api/v1/cart/', {
    params: { days },
  });
  return data;
};

export const useCart = (days = 7) => {
  return useQuery({
    queryKey: queryKeys.cart.list(days),
    queryFn: () => getCart(days),
    // Keep showing the previous days' cart data while the new
    // days' data is being fetched, instead of clearing everything
    // and showing a full-screen loading state on every day switch.
    placeholderData: keepPreviousData,
  });
};