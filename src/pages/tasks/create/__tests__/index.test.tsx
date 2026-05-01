import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

vi.mock('@/lib/hooks/use-auth', () => ({
  useAuth: () => ({ userId: 'user-1', isAuthenticated: true }),
}));

vi.mock('@/components/layout/app-shell', () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/features/tasks/components/create-bounty-form', () => ({
  CreateBountyForm: () => <div>CreateBountyForm</div>,
}));

import CreateBountyPage from '../index';

function wrapper({ children }: { children: React.ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>;
}

describe('CreateBountyPage', () => {
  it('renders publish task header', () => {
    render(<CreateBountyPage />, { wrapper });

    expect(screen.getByText('发布悬赏任务')).toBeInTheDocument();
    expect(screen.getByText('创建悬赏，吸引顶尖人才')).toBeInTheDocument();
  });

  it('renders task info card with form', () => {
    render(<CreateBountyPage />, { wrapper });

    expect(screen.getByText('任务信息')).toBeInTheDocument();
    expect(screen.getByText('CreateBountyForm')).toBeInTheDocument();
  });
});
