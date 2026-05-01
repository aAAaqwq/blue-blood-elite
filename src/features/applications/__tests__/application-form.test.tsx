import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router';
import { ApplicationForm } from '../components/application-form';

vi.mock('@/lib/hooks/use-auth', () => ({
  useAuth: () => ({ userId: 'user-1' }),
}));

const mockInsert = vi.fn(() => ({ error: null }));
vi.mock('@/lib/supabase/client', () => ({
  createBrowserSupabaseClient: () => ({
    from: vi.fn(() => ({
      insert: (...args: unknown[]) => mockInsert(...args),
    })),
  }),
}));

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient();
  return (
    <BrowserRouter>
      <QueryClientProvider client={qc}>{children}</QueryClientProvider>
    </BrowserRouter>
  );
}

describe('ApplicationForm', () => {
  beforeEach(() => {
    mockInsert.mockReturnValue({ error: null });
  });

  it('shows verification required message when not verified', () => {
    render(<ApplicationForm bountyId="b-1" isVerified={false} />, { wrapper });

    expect(screen.getByText('需要 VERIFIED 认证才能申请')).toBeInTheDocument();
    expect(screen.getByText('前往认证')).toBeInTheDocument();
  });

  it('shows application form when verified', () => {
    render(<ApplicationForm bountyId="b-1" isVerified={true} />, { wrapper });

    expect(screen.getByText('申请说明')).toBeInTheDocument();
    expect(screen.getByText('提交申请')).toBeInTheDocument();
  });

  it('disables submit button when message is empty', () => {
    render(<ApplicationForm bountyId="b-1" isVerified={true} />, { wrapper });

    const button = screen.getByText('提交申请');
    expect(button).toBeDisabled();
  });

  it('enables submit button when message is filled', () => {
    render(<ApplicationForm bountyId="b-1" isVerified={true} />, { wrapper });

    fireEvent.change(screen.getByPlaceholderText(/请详细描述/), { target: { value: '我有三年经验' } });

    expect(screen.getByText('提交申请')).toBeEnabled();
  });

  it('shows success state after submission', async () => {
    render(<ApplicationForm bountyId="b-1" isVerified={true} />, { wrapper });

    fireEvent.change(screen.getByPlaceholderText(/请详细描述/), { target: { value: '我有丰富经验' } });
    fireEvent.click(screen.getByText('提交申请'));

    await waitFor(() => {
      expect(screen.getByText('申请已提交成功')).toBeInTheDocument();
    });
  });

  it('shows error message on submission failure', async () => {
    mockInsert.mockReturnValue({ error: { message: '已经申请过' } });

    render(<ApplicationForm bountyId="b-1" isVerified={true} />, { wrapper });

    fireEvent.change(screen.getByPlaceholderText(/请详细描述/), { target: { value: '测试' } });
    fireEvent.click(screen.getByText('提交申请'));

    await waitFor(() => {
      expect(screen.getByText('已经申请过')).toBeInTheDocument();
    });
  });
});
