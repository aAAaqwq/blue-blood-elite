import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('@/lib/hooks/use-auth', () => ({
  useAuth: () => ({ userId: 'user-1' }),
}));

const mockSingle = vi.fn(() => Promise.resolve({ data: { id: 'bounty-1' }, error: null }));
vi.mock('@/lib/supabase/client', () => ({
  createBrowserSupabaseClient: () => ({
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: (...args: unknown[]) => mockSingle(...args),
        })),
      })),
    })),
  }),
}));

const mockNavigate = vi.fn();
vi.mock('react-router', () => ({
  useNavigate: () => mockNavigate,
}));

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient();
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe('CreateBountyForm', () => {
  beforeEach(() => {
    mockSingle.mockResolvedValue({ data: { id: 'bounty-1' }, error: null });
    mockNavigate.mockReturnValue(undefined);
  });

  it('renders all form fields', async () => {
    const { CreateBountyForm } = await import('../components/create-bounty-form');
    render(<CreateBountyForm />, { wrapper });

    expect(screen.getByText('任务标题')).toBeInTheDocument();
    expect(screen.getByText('任务描述')).toBeInTheDocument();
    expect(screen.getByText('任务分类')).toBeInTheDocument();
    expect(screen.getByText('技术标签')).toBeInTheDocument();
    expect(screen.getByText(/悬赏金额/)).toBeInTheDocument();
    expect(screen.getByText('截止日期')).toBeInTheDocument();
    expect(screen.getByText('交付标准')).toBeInTheDocument();
    expect(screen.getByText('发布任务')).toBeInTheDocument();
  });

  it('renders category options in select', async () => {
    const { CreateBountyForm } = await import('../components/create-bounty-form');
    render(<CreateBountyForm />, { wrapper });

    expect(screen.getByText('本地化部署')).toBeInTheDocument();
    expect(screen.getByText('AI模型')).toBeInTheDocument();
    expect(screen.getByText('Agent开发')).toBeInTheDocument();
    expect(screen.getByText('Web3')).toBeInTheDocument();
    expect(screen.getByText('数据分析')).toBeInTheDocument();
    expect(screen.getByText('其他')).toBeInTheDocument();
  });

  it('shows info message when no error', async () => {
    const { CreateBountyForm } = await import('../components/create-bounty-form');
    render(<CreateBountyForm />, { wrapper });

    expect(screen.getByText(/发布任务后需要 Escrow 托管/)).toBeInTheDocument();
  });

  it('submit button is enabled initially', async () => {
    const { CreateBountyForm } = await import('../components/create-bounty-form');
    render(<CreateBountyForm />, { wrapper });

    expect(screen.getByText('发布任务')).toBeEnabled();
  });

  it('shows success state and navigates after submission', async () => {
    const { CreateBountyForm } = await import('../components/create-bounty-form');
    render(<CreateBountyForm />, { wrapper });

    fireEvent.change(screen.getByPlaceholderText(/最低 50 USDC/), { target: { value: '100' } });
    fireEvent.click(screen.getByText('发布任务'));

    await waitFor(() => {
      expect(screen.getByText('任务发布成功')).toBeInTheDocument();
    });
    expect(mockNavigate).toHaveBeenCalledWith('/tasks/bounty-1');
  });

  it('shows error message on submission failure', async () => {
    mockSingle.mockResolvedValue({ data: null, error: { message: '金额不能为空' } });

    const { CreateBountyForm } = await import('../components/create-bounty-form');
    render(<CreateBountyForm />, { wrapper });

    fireEvent.change(screen.getByPlaceholderText(/最低 50 USDC/), { target: { value: '100' } });
    fireEvent.click(screen.getByText('发布任务'));

    await waitFor(() => {
      expect(screen.getByText('金额不能为空')).toBeInTheDocument();
    });
  });

  it('updates field values on input change', async () => {
    const { CreateBountyForm } = await import('../components/create-bounty-form');
    render(<CreateBountyForm />, { wrapper });

    fireEvent.change(screen.getByPlaceholderText(/RAG 系统开发/), { target: { value: '新任务' } });
    expect(screen.getByDisplayValue('新任务')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(/Python, RAG, LangChain/), { target: { value: 'Go, K8s' } });
    expect(screen.getByDisplayValue('Go, K8s')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(/最低 50 USDC/), { target: { value: '500' } });
    expect(screen.getByDisplayValue('500')).toBeInTheDocument();
  });

  it('changes category select', async () => {
    const { CreateBountyForm } = await import('../components/create-bounty-form');
    render(<CreateBountyForm />, { wrapper });

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Web3' } });
    expect(screen.getByRole('combobox')).toHaveValue('Web3');
  });
});
