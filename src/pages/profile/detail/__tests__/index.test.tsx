import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('@/lib/hooks/use-auth', () => ({
  useAuth: () => ({ userId: 'other-user' }),
}));

vi.mock('@/lib/supabase/client', () => ({
  createBrowserSupabaseClient: () => ({}),
}));

vi.mock('@/repositories/users.repository', () => ({
  getPublicProfile: vi.fn(() => Promise.resolve({
    nickname: '测试用户',
    isVerified: true,
    school: '清华',
    company: '字节跳动',
    direction: 'AI',
    level: 3,
    points: 500,
    completedBountyCount: 8,
    bio: 'AI工程师',
    skills: ['Python', 'RAG'],
    githubUrl: 'https://github.com/test',
    linkedinUrl: null,
  })),
  getUserCompletedBounties: vi.fn(() => Promise.resolve([])),
}));

vi.mock('@/repositories/connections.repository', () => ({
  getConnectionBetweenUsers: vi.fn(() => Promise.resolve(null)),
}));

vi.mock('@/components/layout/app-shell', () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

import ProfileDetailPage from '../index';

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient();
  return (
    <MemoryRouter initialEntries={['/profile/test-user-id']}>
      <Routes>
        <Route path="/profile/:id" element={children} />
      </Routes>
    </MemoryRouter>
  );
}

// Need to wrap with QueryClientProvider separately since Routes is inside MemoryRouter
function fullWrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient();
  return (
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={['/profile/test-user-id']}>
        <Routes>
          <Route path="/profile/:id" element={children} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('ProfileDetailPage', () => {
  it('renders user profile header', async () => {
    render(<ProfileDetailPage />, { wrapper: fullWrapper });

    expect(await screen.findByText('测试用户')).toBeInTheDocument();
  });

  it('renders VERIFIED badge when verified', async () => {
    render(<ProfileDetailPage />, { wrapper: fullWrapper });

    expect(await screen.findByText('VERIFIED')).toBeInTheDocument();
  });

  it('renders stats (level, points, completed)', async () => {
    render(<ProfileDetailPage />, { wrapper: fullWrapper });

    expect(await screen.findByText('Lv.3')).toBeInTheDocument();
    expect(await screen.findByText('500')).toBeInTheDocument();
    expect(await screen.findByText('8')).toBeInTheDocument();
  });

  it('renders bio and skills', async () => {
    render(<ProfileDetailPage />, { wrapper: fullWrapper });

    expect(await screen.findByText('AI工程师')).toBeInTheDocument();
    expect(await screen.findByText('Python')).toBeInTheDocument();
    expect(await screen.findByText('RAG')).toBeInTheDocument();
  });

  it('renders connect button for other users', async () => {
    render(<ProfileDetailPage />, { wrapper: fullWrapper });

    expect(await screen.findByText('发起连接')).toBeInTheDocument();
  });
});
