import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('@/lib/hooks/use-auth', () => ({
  useAuth: () => ({ userId: 'user-1' }),
}));

const mockRpc = vi.fn(() => Promise.resolve({ error: null }));
vi.mock('@/lib/supabase/client', () => ({
  createBrowserSupabaseClient: () => ({
    rpc: (...args: unknown[]) => mockRpc(...args),
  }),
}));

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient();
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe('ConnectionForm', () => {
  beforeEach(() => {
    mockRpc.mockResolvedValue({ error: null });
  });

  it('renders form with introduction field', async () => {
    const { ConnectionForm } = await import('../components/connection-form');
    render(<ConnectionForm toUserId="u-2" toUserName="Alice" />, { wrapper });

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText(/发送连接请求/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('简单介绍自己，说明为什么想建立连接...')).toBeInTheDocument();
    expect(screen.getByText('发送请求')).toBeInTheDocument();
  });

  it('renders submit button enabled by default', async () => {
    const { ConnectionForm } = await import('../components/connection-form');
    render(<ConnectionForm toUserId="u-2" toUserName="Alice" />, { wrapper });

    expect(screen.getByText('发送请求')).toBeEnabled();
  });

  it('shows success state after submission', async () => {
    const { ConnectionForm } = await import('../components/connection-form');
    render(<ConnectionForm toUserId="u-2" toUserName="Alice" />, { wrapper });

    fireEvent.click(screen.getByText('发送请求'));

    await waitFor(() => {
      expect(screen.getByText('连接请求已发送')).toBeInTheDocument();
    });
  });

  it('shows error message on failure', async () => {
    mockRpc.mockResolvedValue({ error: { message: '已经发送过请求' } });

    const { ConnectionForm } = await import('../components/connection-form');
    render(<ConnectionForm toUserId="u-2" toUserName="Alice" />, { wrapper });

    fireEvent.click(screen.getByText('发送请求'));

    await waitFor(() => {
      expect(screen.getByText('已经发送过请求')).toBeInTheDocument();
    });
  });

  it('calls onSuccess callback on success', async () => {
    const onSuccess = vi.fn();
    const { ConnectionForm } = await import('../components/connection-form');
    render(<ConnectionForm toUserId="u-2" toUserName="Alice" onSuccess={onSuccess} />, { wrapper });

    fireEvent.click(screen.getByText('发送请求'));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });
});
