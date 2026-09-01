import {
  getIngredients,
  searchIngredients,
} from '../../src/api/ingredients';
import apiClient from '../../src/api/client';

jest.mock('../../src/api/client', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

const client = apiClient as any;

describe('ingredients API', () => {
  beforeEach(() => jest.clearAllMocks());

  it('unwraps paginated ingredient responses', async () => {
    client.get.mockResolvedValueOnce({
      data: { items: [{ id: 1, name: 'Tomato', default_unit: 'g' }] },
    });

    await expect(getIngredients()).resolves.toEqual([
      { id: 1, name: 'Tomato', default_unit: 'g' },
    ]);

    expect(client.get).toHaveBeenCalledWith('/api/v1/ingredients/', {
      params: { page: 1, page_size: 50 },
    });
  });

  it('accepts a plain array response', async () => {
    client.get.mockResolvedValueOnce({
      data: [{ id: 1, name: 'Tomato', default_unit: 'g' }],
    });

    await expect(getIngredients(2, 10)).resolves.toEqual([
      { id: 1, name: 'Tomato', default_unit: 'g' },
    ]);
  });

  it('returns an empty array for unexpected response data', async () => {
    client.get.mockResolvedValueOnce({ data: { error: true } });
    await expect(getIngredients()).resolves.toEqual([]);
  });

  it('searches ingredients and passes pagination', async () => {
    client.get.mockResolvedValueOnce({ data: { items: [] } });

    await searchIngredients('tomato', 2, 20);

    expect(client.get).toHaveBeenCalledWith('/api/v1/ingredients/search', {
      params: { q: 'tomato', page: 2, page_size: 20 },
    });
  });
});
