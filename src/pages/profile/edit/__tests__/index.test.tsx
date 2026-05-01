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
  getUserProfile: vi.fn(() => Promise.resolve(null)),
}));

vi.mock('@/components/layout/app-shell', () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/features/profile/components/profile-edit-form', () => ({
  ProfileEditForm: () => <div>ProfileEditForm</div>,
}));

import ProfileEditPage from '../index';

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient();
  return (
    <MemoryRouter>
      <QueryClientProvider client={qc}>{children}</QueryClientProvider>
    </MemoryRouter>
  );
}

describe('ProfileEditPage', () => {
  it('renders profile edit card', () => {
    render(<ProfileEditPage />, { wrapper });

    expect(screen.getByText('完善你的精英资料')).toBeInTheDocument();
    expect(screen.getByText('ProfileEditForm')).toBeInTheDocument();
  });
});
