import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('@/lib/hooks/use-auth', () => ({
  useAuth: () => ({ userId: 'user-1' }),
}));

vi.mock('@/lib/supabase/client', () => ({
  createBrowserSupabaseClient: () => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: [] })),
        })),
      })),
    })),
  }),
}));

vi.mock('@/components/layout/app-shell', () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

import MyBountiesPage from '../index';

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient();
  return (
    <MemoryRouter>
      <QueryClientProvider client={qc}>{children}</QueryClientProvider>
    </MemoryRouter>
  );
}

describe('MyBountiesPage', () => {
  it('renders my bounties header', () => {
    render(<MyBountiesPage />, { wrapper });

    expect(screen.getByText('我的任务')).toBeInTheDocument();
  });

  it('renders stat cards', () => {
    render(<MyBountiesPage />, { wrapper });

    expect(screen.getByText('我发布的')).toBeInTheDocument();
    expect(screen.getByText('我认领的')).toBeInTheDocument();
  });

  it('renders empty state when no bounties', () => {
    render(<MyBountiesPage />, { wrapper });

    expect(screen.getByText('暂无任务')).toBeInTheDocument();
    expect(screen.getByText('去任务池看看')).toBeInTheDocument();
  });
});
