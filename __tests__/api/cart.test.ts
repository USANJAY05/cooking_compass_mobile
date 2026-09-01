import { getCart } from '../../src/api/cart';
import apiClient from '../../src/api/client';

jest.mock('../../src/api/client', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}));

const client = apiClient as any;

describe('cart API', () => {
  beforeEach(() => jest.clearAllMocks());

  it('uses seven days by default', async () => {
    const data = { items: [] };
    client.get.mockResolvedValueOnce({ data });

    await expect(getCart()).resolves.toEqual(data);

    expect(client.get).toHaveBeenCalledWith('/api/v1/cart/', {
      params: { days: 7 },
    });
  });

  it('passes a custom number of days', async () => {
    client.get.mockResolvedValueOnce({ data: { items: [] } });

    await getCart(14);

    expect(client.get).toHaveBeenCalledWith('/api/v1/cart/', {
      params: { days: 14 },
    });
  });
});
