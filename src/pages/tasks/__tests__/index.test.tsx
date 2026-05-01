import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('@/lib/supabase/client', () => ({
  createBrowserSupabaseClientSafely: () => ({}),
}));

vi.mock('@/repositories/bounties.repository', () => ({
  listBounties: vi.fn(() => Promise.resolve([])),
}));

vi.mock('@/components/layout/app-shell', () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

import TasksPage from '../index';

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient();
  return (
    <MemoryRouter>
      <QueryClientProvider client={qc}>{children}</QueryClientProvider>
    </MemoryRouter>
  );
}

describe('TasksPage', () => {
  it('renders task pool header', () => {
    render(<TasksPage />, { wrapper });

    expect(screen.getByText('任务池')).toBeInTheDocument();
    expect(screen.getByText('技能变现 · 实战落地')).toBeInTheDocument();
  });

  it('renders filter pills', () => {
    render(<TasksPage />, { wrapper });

    expect(screen.getByText('全部')).toBeInTheDocument();
    expect(screen.getByText('本地化部署')).toBeInTheDocument();
    expect(screen.getByText('高悬赏')).toBeInTheDocument();
    expect(screen.getByText('短期实战')).toBeInTheDocument();
    expect(screen.getByText('智能合约')).toBeInTheDocument();
  });

  it('renders empty state when no bounties', () => {
    render(<TasksPage />, { wrapper });

    expect(screen.getByText('暂无任务')).toBeInTheDocument();
    expect(screen.getByText('发布任务')).toBeInTheDocument();
  });
});
