export const queryKeys = {
  recipes: {
    all: ['recipes'] as const,
    list: (params: unknown) => ['recipes', params] as const,
    search: (query: string, params: unknown) => ['recipes', 'search', query, params] as const,
    detail: (id?: number) => ['recipe', id] as const,
  },
  categories: {
    all: ['categories'] as const,
    list: (page: number, pageSize: number) => ['categories', page, pageSize] as const,
  },
  cart: {
    all: ['cart'] as const,
    list: (days: number) => ['cart', days] as const,
  },
  routines: {
    all: ['routines'] as const,
    list: (params: unknown) => ['routines', params] as const,
    search: (query: string, params: unknown) => ['routines', 'search', query, params] as const,
    detail: (id?: number) => ['routine', id] as const,
  },
} as const;
