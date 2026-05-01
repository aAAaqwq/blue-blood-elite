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

vi.mock('@/repositories/notifications.repository', () => ({
  getNotifications: vi.fn(() => Promise.resolve([])),
}));

vi.mock('@/components/layout/app-shell', () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

import NotificationsPage from '../index';

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient();
  return (
    <MemoryRouter>
      <QueryClientProvider client={qc}>{children}</QueryClientProvider>
    </MemoryRouter>
  );
}

describe('NotificationsPage', () => {
  it('renders notifications header', () => {
    render(<NotificationsPage />, { wrapper });

    expect(screen.getByText('通知')).toBeInTheDocument();
    expect(screen.getByText('暂无新通知')).toBeInTheDocument();
  });

  it('renders empty state when no notifications', () => {
    render(<NotificationsPage />, { wrapper });

    expect(screen.getByText('暂无通知')).toBeInTheDocument();
  });
});
