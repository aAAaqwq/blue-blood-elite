import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('@/lib/hooks/use-auth', () => ({
  useAuth: () => ({ userId: 'user-1' }),
}));

vi.mock('@/lib/supabase/client', () => ({
  createBrowserSupabaseClientSafely: () => ({}),
}));

vi.mock('@/repositories/discover.repository', () => ({
  listDiscoverUsers: vi.fn(() => Promise.resolve([])),
}));

vi.mock('@/repositories/connections.repository', () => ({
  getUserConnections: vi.fn(() => Promise.resolve([])),
}));

vi.mock('@/features/discover/components/discover-page-shell', () => ({
  DiscoverPageShell: ({ users }: { users: unknown[] }) => (
    <div data-testid="discover-shell">Shell with {users.length} users</div>
  ),
}));

import DiscoverPage from '../index';

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient();
  return (
    <MemoryRouter>
      <QueryClientProvider client={qc}>{children}</QueryClientProvider>
    </MemoryRouter>
  );
}

describe('DiscoverPage', () => {
  it('renders discover shell', () => {
    render(<DiscoverPage />, { wrapper });

    expect(screen.getByTestId('discover-shell')).toBeInTheDocument();
  });
});
