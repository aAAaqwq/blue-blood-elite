import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DeliveryForm } from '../components/delivery-form';

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

describe('DeliveryForm', () => {
  beforeEach(() => {
    mockRpc.mockResolvedValue({ error: null });
  });

  it('renders delivery form with content and links fields', () => {
    render(<DeliveryForm bountyId="b-1" />, { wrapper });

    expect(screen.getByText('交付说明')).toBeInTheDocument();
    expect(screen.getByText(/相关链接/)).toBeInTheDocument();
    expect(screen.getByText('提交交付')).toBeInTheDocument();
  });

  it('disables submit when content is empty', () => {
    render(<DeliveryForm bountyId="b-1" />, { wrapper });

    const button = screen.getByText('提交交付');
    expect(button).toBeDisabled();
  });

  it('enables submit when content is filled', () => {
    render(<DeliveryForm bountyId="b-1" />, { wrapper });

    fireEvent.change(screen.getByPlaceholderText(/请详细描述/), { target: { value: '完成了全部功能开发' } });

    expect(screen.getByText('提交交付')).toBeEnabled();
  });

  it('shows success state after submission', async () => {
    render(<DeliveryForm bountyId="b-1" />, { wrapper });

    fireEvent.change(screen.getByPlaceholderText(/请详细描述/), { target: { value: '完成了全部功能' } });
    fireEvent.click(screen.getByText('提交交付'));

    await waitFor(() => {
      expect(screen.getByText('交付已提交成功')).toBeInTheDocument();
    });
  });

  it('shows error message on failure', async () => {
    mockRpc.mockResolvedValue({ error: { message: '任务状态不允许提交' } });

    render(<DeliveryForm bountyId="b-1" />, { wrapper });

    fireEvent.change(screen.getByPlaceholderText(/请详细描述/), { target: { value: '测试交付内容' } });
    fireEvent.click(screen.getByText('提交交付'));

    await waitFor(() => {
      expect(screen.getByText('任务状态不允许提交')).toBeInTheDocument();
    });
  });
});
