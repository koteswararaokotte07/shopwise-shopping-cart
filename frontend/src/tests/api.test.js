import { afterEach, describe, expect, it, vi } from 'vitest';
import { shopApi } from '../api.js';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('shopApi', () => {
  it('reports an invalid successful response instead of returning empty data', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => { throw new SyntaxError('invalid JSON'); },
    })));

    await expect(shopApi.getProducts()).rejects.toThrow(
      'The shop returned an unexpected response. Please try again.',
    );
  });

  it('turns network failures into a readable message', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => {
      throw new TypeError('network unavailable');
    }));

    await expect(shopApi.getCart()).rejects.toThrow(
      'Could not reach the shop. Check that the backend is running and try again.',
    );
  });
});
