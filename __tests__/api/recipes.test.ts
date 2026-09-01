import {
  getRecipes,
  searchRecipes,
  getRecipeDetail,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  rateRecipe,
  deleteRating,
} from '../../src/api/recipes';
import apiClient from '../../src/api/client';

jest.mock('../../src/api/client', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

const client = apiClient as any;

describe('recipes API', () => {
  beforeEach(() => jest.clearAllMocks());

  it('gets recipes with query params', async () => {
    const response = { items: [], total: 0 };
    client.get.mockResolvedValueOnce({ data: response });

    await expect(getRecipes({ q: 'pasta' } as any)).resolves.toEqual(response);
    expect(client.get).toHaveBeenCalledWith('/api/v1/recipes/', {
      params: { q: 'pasta' },
    });
  });

  it('searches recipes', async () => {
    client.get.mockResolvedValueOnce({ data: { items: [] } });

    await searchRecipes('pasta', { page: 2 } as any);

    expect(client.get).toHaveBeenCalledWith('/api/v1/recipes/search', {
      params: { q: 'pasta', page: 2 },
    });
  });

  it('gets recipe details', async () => {
    const recipe = { id: 42, name: 'Pasta', servings: 2, visibility: 'PUBLIC' };
    client.get.mockResolvedValueOnce({ data: recipe });

    await expect(getRecipeDetail(42)).resolves.toEqual(recipe);
    expect(client.get).toHaveBeenCalledWith('/api/v1/recipes/42');
  });

  it('creates a recipe', async () => {
    client.post.mockResolvedValueOnce({ data: { id: 1 } });
    const payload = { name: 'Soup', servings: 2 } as any;

    await expect(createRecipe(payload)).resolves.toEqual({ id: 1 });
    expect(client.post).toHaveBeenCalledWith('/api/v1/recipes/', payload);
  });

  it('updates a recipe', async () => {
    client.put.mockResolvedValueOnce({ data: { id: 1, name: 'Updated' } });

    await updateRecipe({ id: 1, data: { name: 'Updated' } as any });

    expect(client.put).toHaveBeenCalledWith('/api/v1/recipes/1', {
      name: 'Updated',
    });
  });

  it('deletes a recipe', async () => {
    client.delete.mockResolvedValueOnce({});
    await expect(deleteRecipe(7)).resolves.toBeUndefined();
    expect(client.delete).toHaveBeenCalledWith('/api/v1/recipes/7');
  });

  it('rates a recipe', async () => {
    client.post.mockResolvedValueOnce({ data: { rating: 5 } });
    await rateRecipe(7, 5);
    expect(client.post).toHaveBeenCalledWith('/api/v1/recipes/7/rating', {
      rating: 5,
    });
  });

  it('deletes a rating', async () => {
    client.delete.mockResolvedValueOnce({});
    await deleteRating(7);
    expect(client.delete).toHaveBeenCalledWith('/api/v1/recipes/7/rating');
  });
});
