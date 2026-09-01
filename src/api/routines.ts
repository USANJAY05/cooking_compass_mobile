import apiClient from './client';
import { queryKeys } from './queryKeys';
import { RoutineListResponse, GetRoutinesParams, RoutineDetailResponse } from './types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface RoutineItemRequest {
  recipe_id: number;
  quantity: number;
  quantity_unit: string;
}

export interface RecurrenceComponent {
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  interval?: number;
  days_of_week?: number[];
  start_date: string;
  end_date?: string | null;
  occurrence_count?: number | null;
}

export interface CreateRoutineRequest {
  name: string;
  description?: string | null;
  status?: string;
  items: RoutineItemRequest[];
  recurrence: RecurrenceComponent;
}

export const getRoutines = async (params: GetRoutinesParams = {}): Promise<RoutineListResponse> => {
  const { data } = await apiClient.get<RoutineListResponse>('/api/v1/routines/', {
    params,
  });
  return data;
};

export const searchRoutines = async (q: string, params: Omit<GetRoutinesParams, 'q'> = {}): Promise<RoutineListResponse> => {
  const { data } = await apiClient.get<RoutineListResponse>('/api/v1/routines/search', {
    params: { q, ...params },
  });
  return data;
};

export const createRoutine = async (routine: CreateRoutineRequest): Promise<any> => {
  const { data } = await apiClient.post('/api/v1/routines/', routine);
  return data;
};

export const getRoutineDetail = async (routineId: number): Promise<RoutineDetailResponse> => {
  const { data } = await apiClient.get<RoutineDetailResponse>(`/api/v1/routines/${routineId}`);
  return data;
};

export const updateRoutine = async (params: { id: number; data: CreateRoutineRequest }): Promise<RoutineDetailResponse> => {
  const { data } = await apiClient.put<RoutineDetailResponse>(`/api/v1/routines/${params.id}`, params.data);
  return data;
};

export const deleteRoutine = async (routineId: number): Promise<void> => {
  await apiClient.delete(`/api/v1/routines/${routineId}`);
};

// React Query Hooks
export const useRoutines = (params: GetRoutinesParams = {}) => {
  return useQuery({
    queryKey: queryKeys.routines.list(params),
    queryFn: () => getRoutines(params),
    staleTime: 5 * 60_000,
  });
};

export const useSearchRoutines = (q: string, params: Omit<GetRoutinesParams, 'q'> = {}) => {
  return useQuery({
    queryKey: queryKeys.routines.search(q, params),
    queryFn: () => searchRoutines(q, params),
    enabled: q.trim().length > 0,
    staleTime: 30_000,
  });
};

export const useRoutineDetail = (routineId?: number) => {
  return useQuery({
    queryKey: queryKeys.routines.detail(routineId),
    queryFn: () => getRoutineDetail(routineId!),
    enabled: !!routineId,
    staleTime: 10 * 60_000,
  });
};

export const useCreateRoutine = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createRoutine,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.routines.all });
    },
  });
};

export const useUpdateRoutine = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateRoutine,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.routines.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.routines.detail(variables.id) });
    },
  });
};

export const useDeleteRoutine = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteRoutine,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.routines.all });
    },
  });
};
