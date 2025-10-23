import '@testing-library/jest-dom/vitest';

// Mock next/navigation for client components in tests
import { vi } from 'vitest';

vi.mock('next/navigation', async () => {
  return {
    useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
    usePathname: () => '/',
  };
});

