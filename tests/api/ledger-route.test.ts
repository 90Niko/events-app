import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/prisma', () => {
  return {
    prisma: {
      eventLedger: {
        create: vi.fn(async ({ data }) => ({ id: 2, ...data })),
        findMany: vi.fn(async () => []),
      },
      $executeRaw: vi.fn(),
      $queryRaw: vi.fn(),
    },
  };
});

import { POST as ledgerPOST } from '@/app/api/events/[id]/ledger/route.js';

describe('POST /api/events/:id/ledger', () => {
  it('rejects negative amount', async () => {
    const req = new Request('http://localhost/api/events/1/ledger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entry_type: 'expense', amount: -5 }),
    });
    const res = await ledgerPOST(req as any, { params: Promise.resolve({ id: '1' }) } as any);
    expect(res.status).toBe(400);
  });

  it('creates entry when amount is valid', async () => {
    const req = new Request('http://localhost/api/events/1/ledger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entry_type: 'income', amount: 12.34, currency: 'EUR' }),
    });
    const res = await ledgerPOST(req as any, { params: Promise.resolve({ id: '1' }) } as any);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.amount).toBe(12.34);
  });
});

