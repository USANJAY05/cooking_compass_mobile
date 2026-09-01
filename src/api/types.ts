export interface RatingComponent {
  average: number;
  count: number;
}

export interface RecipeSummaryComponent {
  id: number;
  name: string;
  thumbnail_url?: string | null;
  preparation_time?: number | null;
  cooking_time?: number | null;
  servings: number;
  rating: RatingComponent;
}

export interface RecipeListResponse {
  items: RecipeSummaryComponent[];
  page: number;
  limit: number;
  total: number;
}

export interface RoutineItemComponent {
  recipe_id: number;
  recipe_name: string;
  recipe_thumbnail_url?: string | null;
  quantity: string | number;
  quantity_unit: string;
}

export interface RoutineRecurrenceComponent {
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  interval?: number;
  days_of_week?: number[];
  start_date?: string;
  end_date?: string | null;
  occurrence_count?: number | null;
}

export interface RoutineSummaryComponent {
  id: number;
  name: string;
  description?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  /** Returned by the list endpoint so the calendar never needs N detail calls. */
  recurrence?: RoutineRecurrenceComponent | null;
}

export interface RoutineDetailResponse {
  id: number;
  name: string;
  description: string | null;
  status: string;
  recipes: RoutineItemComponent[];
  recurrence?: RoutineRecurrenceComponent | null;
}

export interface RoutineListResponse {
  items: RoutineSummaryComponent[];
  page: number;
  limit: number;
  total: number;
}

export interface CartItemComponent {
  ingredient_id: number;
  name?: string;
  ingredient_name?: string;
  quantity?: string | number;
  total_quantity: number;
  unit: string;
  category_name?: string | null;
  is_checked?: boolean;
}

export interface CartResponse {
  items: CartItemComponent[];
  days: number;
  generated_at?: string;
}

// Request Parameters
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface GetRecipesParams extends PaginationParams {
  scope?: 'mine' | 'public';
  category_id?: number | null;
  tag_id?: number | null;
  user_id?: number | null;
  sort_by?: 'created_at' | 'name' | 'rating' | 'cooking_time';
  sort_order?: 'asc' | 'desc';
}

export interface GetRoutinesParams extends PaginationParams {
  scope?: 'mine' | 'feed';
  sort_by?: string;
  sort_order?: string;
}
