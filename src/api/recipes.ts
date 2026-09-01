import apiClient from './client';
import { queryKeys } from './queryKeys';
import { RecipeListResponse, GetRecipesParams } from './types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface CreateRecipeIngredient {
  ingredient_id: number;
  name: string;
  quantity: number;
  unit: string;
  display_order: number;
}

export interface CreateRecipeInstruction {
  step_number: number;
  instruction_text: string;
  timer_seconds?: number | null;
  tip?: string | null;
  reference_recipe_id?: number | null;
  reference_image?: string | null;
}

export interface CreateRecipeRequest {
  name: string;
  description?: string | null;
  preparation_time: number;
  cooking_time: number;
  total_time: number;

  // Required recipe baseline
  servings: number;

  // Optional final cooked weight.
  // Measured after cooking, not before.
  cooked_weight_amount?: number | null;
  cooked_weight_unit?: string | null;

  visibility?: 'PRIVATE' | 'PUBLIC';
  image_urls?: string[];
  ingredients: CreateRecipeIngredient[];
  instructions: CreateRecipeInstruction[];
  category_ids?: number[];
  tag_names?: string[];
}

export interface NutritionItemComponent {
  code: string;
  name: string;
  amount: number;
  unit: string;
}

export interface NutritionComponent {
  servings: number;
  items?: NutritionItemComponent[];
}

export interface RecipeDetailResponse {
  id: number;
  name: string;
  description?: string | null;
  preparation_time?: number | null;
  cooking_time?: number | null;
  total_time?: number | null;

  servings: number;

  // Optional final cooked weight
  cooked_weight_amount?: number | null;
  cooked_weight_unit?: string | null;

  visibility: 'PRIVATE' | 'PUBLIC';
  image_urls?: string[];

  ingredients: {
    ingredient_id: number;
    quantity: number;
    unit: string;
    display_order?: number;
    name?: string;
  }[];

  instructions: {
    step_number: number;
    instruction_text: string;
    timer_seconds?: number | null;
    tip?: string | null;
    reference_recipe_id?: number | null;
    reference_image?: string | null;
  }[];

  category_ids?: number[];
  tag_ids?: number[];
  // Optional forward-compatible field; current API may only return tag_ids.
  tag_names?: string[];

  nutrition?: NutritionComponent | null;

  rating?: {
    average: number;
    count: number;
  };
}

export const getRecipes = async (
  params: GetRecipesParams = {},
): Promise<RecipeListResponse> => {
  const { data } = await apiClient.get<RecipeListResponse>(
    '/api/v1/recipes/',
    {
      params,
    },
  );

  return data;
};

export const searchRecipes = async (
  q: string,
  params: Omit<GetRecipesParams, 'q'> = {},
): Promise<RecipeListResponse> => {
  const { data } = await apiClient.get<RecipeListResponse>(
    '/api/v1/recipes/search',
    {
      params: {
        q,
        ...params,
      },
    },
  );

  return data;
};

export const getRecipeDetail = async (
  recipeId: number,
): Promise<RecipeDetailResponse> => {
  const { data } = await apiClient.get<RecipeDetailResponse>(
    `/api/v1/recipes/${recipeId}`,
  );

  return data;
};

export const createRecipe = async (
  recipe: CreateRecipeRequest,
): Promise<any> => {
  const { data } = await apiClient.post(
    '/api/v1/recipes/',
    recipe,
  );

  return data;
};

export const updateRecipe = async (params: {
  id: number;
  data: CreateRecipeRequest;
}): Promise<RecipeDetailResponse> => {
  const { data } = await apiClient.put<RecipeDetailResponse>(
    `/api/v1/recipes/${params.id}`,
    params.data,
  );

  return data;
};

export const deleteRecipe = async (
  recipeId: number,
): Promise<void> => {
  await apiClient.delete(`/api/v1/recipes/${recipeId}`);
};

export const rateRecipe = async (
  recipeId: number,
  rating: number,
): Promise<any> => {
  const { data } = await apiClient.post(
    `/api/v1/recipes/${recipeId}/rating`,
    {
      rating,
    },
  );

  return data;
};

export const deleteRating = async (
  recipeId: number,
): Promise<void> => {
  await apiClient.delete(
    `/api/v1/recipes/${recipeId}/rating`,
  );
};

/* -------------------------------------------------------------------------- */
/* React Query Hooks                                                          */
/* -------------------------------------------------------------------------- */

export const useRecipes = (
  params: GetRecipesParams = {},
) => {
  return useQuery({
    queryKey: queryKeys.recipes.list(params),
    queryFn: () => getRecipes(params),
    staleTime: 5 * 60_000,
  });
};

export const useSearchRecipes = (
  q: string,
  params: Omit<GetRecipesParams, 'q'> = {},
) => {
  return useQuery({
    queryKey: queryKeys.recipes.search(q, params),
    queryFn: () => searchRecipes(q, params),
    enabled: q.trim().length > 0,
    staleTime: 30_000,
  });
};

export const useRecipeDetail = (
  recipeId?: number,
) => {
  return useQuery({
    queryKey: queryKeys.recipes.detail(recipeId),
    queryFn: () => getRecipeDetail(recipeId!),
    enabled: !!recipeId,
    staleTime: 10 * 60_000,
  });
};

export const useCreateRecipe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRecipe,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.recipes.all,
      });
    },
  });
};

export const useUpdateRecipe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateRecipe,

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.recipes.all,
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.recipes.detail(variables.id),
      });
    },
  });
};

export const useDeleteRecipe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteRecipe,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.recipes.all,
      });
    },
  });
};

export const useRateRecipe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      recipeId,
      rating,
    }: {
      recipeId: number;
      rating: number;
    }) => rateRecipe(recipeId, rating),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.recipes.all,
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.recipes.detail(variables.recipeId),
      });
    },
  });
};

export const useDeleteRating = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (recipeId: number) =>
      deleteRating(recipeId),

    onSuccess: (_, recipeId) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.recipes.all,
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.recipes.detail(recipeId),
      });
    },
  });
};