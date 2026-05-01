import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('@/lib/hooks/use-auth', () => ({
  useAuth: () => ({ userId: 'user-1' }),
}));

vi.mock('@/lib/supabase/client', () => ({
  createBrowserSupabaseClient: () => ({}),
}));

vi.mock('@/repositories/connections.repository', () => ({
  getUserConnections: vi.fn(() => Promise.resolve([])),
}));

vi.mock('@/components/layout/app-shell', () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

import ConnectionsPage from '../index';

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient();
  return (
    <MemoryRouter>
      <QueryClientProvider client={qc}>{children}</QueryClientProvider>
    </MemoryRouter>
  );
}

describe('ConnectionsPage', () => {
  it('renders connections header', () => {
    render(<ConnectionsPage />, { wrapper });

    expect(screen.getByText('我的连接')).toBeInTheDocument();
  });

  it('renders stat cards', () => {
    render(<ConnectionsPage />, { wrapper });

    expect(screen.getByText('已连接')).toBeInTheDocument();
    expect(screen.getByText('待确认')).toBeInTheDocument();
    expect(screen.getByText('已发送')).toBeInTheDocument();
  });

  it('renders empty state when no connections', () => {
    render(<ConnectionsPage />, { wrapper });

    expect(screen.getByText('暂无连接')).toBeInTheDocument();
    expect(screen.getByText('去发现')).toBeInTheDocument();
  });
});
