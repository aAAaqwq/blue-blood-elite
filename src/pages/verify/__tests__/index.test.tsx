import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('@/lib/hooks/use-auth', () => ({
  useAuth: () => ({ userId: 'user-1', isAuthenticated: true }),
}));

vi.mock('@/lib/supabase/client', () => ({
  createBrowserSupabaseClient: () => ({}),
}));

vi.mock('@/repositories/users.repository', () => ({
  getUserVerifyStatus: vi.fn(() => Promise.resolve({ isVerified: false, verifiedAt: null, applications: [] })),
}));

vi.mock('@/components/layout/app-shell', () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/features/verify/components/verify-application-form', () => ({
  VerifyApplicationForm: () => <div>VerifyApplicationForm</div>,
}));

import VerifyPage from '../index';

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient();
  return (
    <MemoryRouter>
      <QueryClientProvider client={qc}>{children}</QueryClientProvider>
    </MemoryRouter>
  );
}

describe('VerifyPage', () => {
  it('renders VERIFIED header', () => {
    render(<VerifyPage />, { wrapper });

    expect(screen.getByText('VERIFIED 认证')).toBeInTheDocument();
  });

  it('renders verification type descriptions', () => {
    render(<VerifyPage />, { wrapper });

    expect(screen.getByText(/GitHub 个人主页/)).toBeInTheDocument();
    expect(screen.getByText(/LinkedIn 或公司邮箱/)).toBeInTheDocument();
    expect(screen.getByText(/在平台完成 3 个/)).toBeInTheDocument();
  });

  it('renders benefits when not verified', () => {
    render(<VerifyPage />, { wrapper });

    expect(screen.getByText('认证权益')).toBeInTheDocument();
    expect(screen.getByText('发布悬赏任务')).toBeInTheDocument();
    expect(screen.getByText('优先推荐曝光')).toBeInTheDocument();
    expect(screen.getByText('专属认证标识')).toBeInTheDocument();
  });
});
