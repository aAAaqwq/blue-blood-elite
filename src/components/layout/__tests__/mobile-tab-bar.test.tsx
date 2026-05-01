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

vi.mock('@/repositories/messages.repository', () => ({
  getUnreadMessageCount: vi.fn(() => Promise.resolve(3)),
}));

import { MobileTabBar } from '../mobile-tab-bar';

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient();
  return (
    <MemoryRouter initialEntries={['/discover']}>
      <QueryClientProvider client={qc}>{children}</QueryClientProvider>
    </MemoryRouter>
  );
}

describe('MobileTabBar', () => {
  it('renders all four tab labels', () => {
    render(<MobileTabBar />, { wrapper });

    expect(screen.getByText('发现')).toBeInTheDocument();
    expect(screen.getByText('成长')).toBeInTheDocument();
    expect(screen.getByText('任务')).toBeInTheDocument();
    expect(screen.getByText('我的')).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    render(<MobileTabBar />, { wrapper });

    const links = screen.getAllByRole('link');
    const hrefs = links.map((l) => l.getAttribute('href'));
    expect(hrefs).toContain('/discover');
    expect(hrefs).toContain('/growth');
    expect(hrefs).toContain('/tasks');
    expect(hrefs).toContain('/me');
  });
});
