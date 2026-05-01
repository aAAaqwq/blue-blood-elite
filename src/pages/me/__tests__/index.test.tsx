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
          single: vi.fn(() => Promise.resolve({ data: null })),
        })),
      })),
    })),
  }),
}));

vi.mock('@/repositories/notifications.repository', () => ({
  getUnreadNotificationCount: vi.fn(() => Promise.resolve(0)),
}));

vi.mock('@/repositories/messages.repository', () => ({
  getUnreadMessageCount: vi.fn(() => Promise.resolve(0)),
}));

vi.mock('@/repositories/connections.repository', () => ({
  getPendingConnections: vi.fn(() => Promise.resolve([])),
}));

vi.mock('@/components/layout/app-shell', () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

import MePage from '../index';

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient();
  return (
    <MemoryRouter>
      <QueryClientProvider client={qc}>{children}</QueryClientProvider>
    </MemoryRouter>
  );
}

describe('MePage', () => {
  it('renders profile section', () => {
    render(<MePage />, { wrapper });

    expect(screen.getByText('编辑资料')).toBeInTheDocument();
  });

  it('renders menu items', () => {
    render(<MePage />, { wrapper });

    expect(screen.getByText('我的连接')).toBeInTheDocument();
    expect(screen.getByText('我的消息')).toBeInTheDocument();
    expect(screen.getByText('我的任务')).toBeInTheDocument();
    expect(screen.getByText('我的通知')).toBeInTheDocument();
    expect(screen.getByText('VERIFIED 认证')).toBeInTheDocument();
  });

  it('renders wallet and level cards', () => {
    render(<MePage />, { wrapper });

    expect(screen.getByText('我的钱包')).toBeInTheDocument();
    expect(screen.getByText('成长等级')).toBeInTheDocument();
  });

  it('renders settings link', () => {
    render(<MePage />, { wrapper });

    expect(screen.getByText('设置')).toBeInTheDocument();
  });
});
