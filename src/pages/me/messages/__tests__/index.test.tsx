import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('@/lib/hooks/use-auth', () => ({
  useAuth: () => ({ userId: 'user-1' }),
}));

vi.mock('@/lib/supabase/client', () => ({
  createBrowserSupabaseClient: () => ({}),
  getBrowserSupabaseClient: () => ({
    channel: vi.fn(() => ({
      on: vi.fn(() => ({
        subscribe: vi.fn(),
      })),
    })),
    removeChannel: vi.fn(),
  }),
}));

vi.mock('@/repositories/messages.repository', () => ({
  getConversations: vi.fn(() => Promise.resolve([])),
}));

vi.mock('@/components/layout/app-shell', () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

import MessagesPage from '../index';

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient();
  return (
    <MemoryRouter>
      <QueryClientProvider client={qc}>{children}</QueryClientProvider>
    </MemoryRouter>
  );
}

describe('MessagesPage', () => {
  it('renders messages header', () => {
    render(<MessagesPage />, { wrapper });

    expect(screen.getByText('消息')).toBeInTheDocument();
  });

  it('renders empty state when no conversations', () => {
    render(<MessagesPage />, { wrapper });

    expect(screen.getByText('暂无消息')).toBeInTheDocument();
    expect(screen.getByText('查看连接')).toBeInTheDocument();
  });
});
