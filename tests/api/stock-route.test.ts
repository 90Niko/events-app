import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/prisma', () => {
  return {
    prisma: {
      stock: {
        create: vi.fn(async ({ data }) => ({ id: 1, ...data })),
      },
      $executeRaw: vi.fn(),
      $queryRaw: vi.fn(),
    },
  };
});

import { POST as stockPOST } from '@/app/api/stock/route.js';

describe('POST /api/stock', () => {
  it('rejects negative price and non-positive weight', async () => {
    const req = new Request('http://localhost/api/stock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ price_per_kg: -1, weight_kg: 0, purchase_date: '2025-01-01', purchased_by: 'a', payment_method: 'cash' }),
    });
    const res = await stockPOST(req as any);
    expect(res.status).toBe(400);
  });

  it('creates stock with valid payload', async () => {
    const req = new Request('http://localhost/api/stock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ price_per_kg: 10, weight_kg: 2.5, purchase_date: '2025-01-01', purchased_by: 'a', payment_method: 'cash' }),
    });
    const res = await stockPOST(req as any);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.price_per_kg).toBe(10);
    expect(json.weight_kg).toBe(2.5);
  });
});

