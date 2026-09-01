import { getCategories } from '../../src/api/categories';
import apiClient from '../../src/api/client';

jest.mock('../../src/api/client', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}));

const client = apiClient as any;

describe('categories API', () => {
  beforeEach(() => jest.clearAllMocks());

  it('unwraps paginated category responses', async () => {
    client.get.mockResolvedValueOnce({
      data: { items: [{ id: 1, name: 'Breakfast' }] },
    });

    await expect(getCategories()).resolves.toEqual([
      { id: 1, name: 'Breakfast' },
    ]);

    expect(client.get).toHaveBeenCalledWith('/api/v1/categories/', {
      params: { page: 1, page_size: 100 },
    });
  });

  it('accepts a plain array response', async () => {
    client.get.mockResolvedValueOnce({
      data: [{ id: 2, name: 'Dinner' }],
    });

    await expect(getCategories(2, 20)).resolves.toEqual([
      { id: 2, name: 'Dinner' },
    ]);
  });

  it('returns an empty array for an unexpected response shape', async () => {
    client.get.mockResolvedValueOnce({ data: null });
    await expect(getCategories()).resolves.toEqual([]);
  });
});
