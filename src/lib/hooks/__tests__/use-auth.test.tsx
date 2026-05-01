import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const mockSignUpWithEmail = vi.fn();
const mockSignInWithEmail = vi.fn();
const mockSignInWithPhone = vi.fn();
const mockSignOut = vi.fn();
const mockGetCurrentUser = vi.fn();
const mockOnAuthStateChange = vi.fn(() => ({ unsubscribe: vi.fn() }));
let mockSupabaseClient: object | null = {};

vi.mock('@/lib/supabase/client', () => ({
  createBrowserSupabaseClientSafely: () => mockSupabaseClient,
  getBrowserSupabaseClient: () => mockSupabaseClient,
}));

vi.mock('@/lib/supabase/auth', () => ({
  signUpWithEmail: (...args: unknown[]) => mockSignUpWithEmail(...args),
  signInWithEmail: (...args: unknown[]) => mockSignInWithEmail(...args),
  signInWithPhone: (...args: unknown[]) => mockSignInWithPhone(...args),
  signOut: (...args: unknown[]) => mockSignOut(...args),
  getCurrentUser: (...args: unknown[]) => mockGetCurrentUser(...args),
  onAuthStateChange: (...args: unknown[]) => mockOnAuthStateChange(...args),
}));

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabaseClient = {};
    mockGetCurrentUser.mockResolvedValue({ user: null, error: null });
    mockOnAuthStateChange.mockReturnValue({ unsubscribe: vi.fn() });
    delete import.meta.env.VITE_DEV_ACTOR_USER_ID;
  });

  it('returns initial loading state then settles', async () => {
    const { useAuth } = await import('../use-auth');
    const { result } = renderHook(() => useAuth());

    expect(result.current.isLoading).toBe(true);

    await act(() => Promise.resolve());
    expect(result.current.isLoading).toBe(false);
  });

  it('returns null user when not authenticated', async () => {
    const { useAuth } = await import('../use-auth');
    const { result } = renderHook(() => useAuth());

    await act(() => Promise.resolve());
    expect(result.current.user).toBeNull();
    expect(result.current.userId).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('signs up successfully', async () => {
    const mockUser = { id: 'user-new' };
    mockSignUpWithEmail.mockResolvedValue({ user: mockUser, error: null });

    const { useAuth } = await import('../use-auth');
    const { result } = renderHook(() => useAuth());
    await act(() => Promise.resolve());

    let res: { success: boolean };
    await act(async () => {
      res = await result.current.signUp({ email: 'a@b.com', password: '123456' });
    });

    expect(res!.success).toBe(true);
    expect(result.current.user).toEqual(mockUser);
  });

  it('handles sign up error', async () => {
    mockSignUpWithEmail.mockResolvedValue({ user: null, error: '邮箱已注册' });

    const { useAuth } = await import('../use-auth');
    const { result } = renderHook(() => useAuth());
    await act(() => Promise.resolve());

    let res: { success: boolean; error?: string };
    await act(async () => {
      res = await result.current.signUp({ email: 'a@b.com', password: '123456' });
    });

    expect(res!.success).toBe(false);
    expect(res!.error).toBe('邮箱已注册');
    expect(result.current.error).toBe('邮箱已注册');
  });

  it('signs in successfully', async () => {
    const mockUser = { id: 'user-1' };
    mockSignInWithEmail.mockResolvedValue({ user: mockUser, error: null });

    const { useAuth } = await import('../use-auth');
    const { result } = renderHook(() => useAuth());
    await act(() => Promise.resolve());

    let res: { success: boolean };
    await act(async () => {
      res = await result.current.signIn({ email: 'a@b.com', password: '123456' });
    });

    expect(res!.success).toBe(true);
    expect(result.current.user).toEqual(mockUser);
  });

  it('handles sign in error', async () => {
    mockSignInWithEmail.mockResolvedValue({ user: null, error: '密码错误' });

    const { useAuth } = await import('../use-auth');
    const { result } = renderHook(() => useAuth());
    await act(() => Promise.resolve());

    let res: { success: boolean; error?: string };
    await act(async () => {
      res = await result.current.signIn({ email: 'a@b.com', password: 'wrong' });
    });

    expect(res!.success).toBe(false);
    expect(res!.error).toBe('密码错误');
  });

  it('signs in with phone successfully', async () => {
    mockSignInWithPhone.mockResolvedValue({ user: null, error: null, requiresOtp: true });

    const { useAuth } = await import('../use-auth');
    const { result } = renderHook(() => useAuth());
    await act(() => Promise.resolve());

    let res: { success: boolean; requiresOtp?: boolean };
    await act(async () => {
      res = await result.current.signInWithPhone({ phone: '+8613800138000', otp: '123456' });
    });

    expect(res!.success).toBe(true);
    expect(res!.requiresOtp).toBe(true);
  });

  it('handles signInWithPhone error', async () => {
    mockSignInWithPhone.mockResolvedValue({ user: null, error: '手机号未注册' });

    const { useAuth } = await import('../use-auth');
    const { result } = renderHook(() => useAuth());
    await act(() => Promise.resolve());

    let res: { success: boolean; error?: string };
    await act(async () => {
      res = await result.current.signInWithPhone({ phone: '+8613800138000', otp: '123456' });
    });

    expect(res!.success).toBe(false);
    expect(res!.error).toBe('手机号未注册');
    expect(result.current.error).toBe('手机号未注册');
  });

  it('signInWithPhone returns error when supabase is null', async () => {
    mockSupabaseClient = null;
    delete import.meta.env.VITE_DEV_ACTOR_USER_ID;

    const { useAuth } = await import('../use-auth');
    const { result } = renderHook(() => useAuth());
    await act(() => Promise.resolve());

    const res = await result.current.signInWithPhone({ phone: '+8613800138000', otp: '123456' });
    expect(res.success).toBe(false);
    expect(res.error).toBe('Supabase 客户端未初始化');
  });

  it('logs out successfully', async () => {
    mockSignOut.mockResolvedValue({ success: true });

    const { useAuth } = await import('../use-auth');
    const { result } = renderHook(() => useAuth());
    await act(() => Promise.resolve());

    let res: { success: boolean };
    await act(async () => {
      res = await result.current.logout();
    });

    expect(res!.success).toBe(true);
    expect(result.current.user).toBeNull();
  });

  it('handles logout error', async () => {
    mockSignOut.mockResolvedValue({ success: false, error: '网络错误' });

    const { useAuth } = await import('../use-auth');
    const { result } = renderHook(() => useAuth());
    await act(() => Promise.resolve());

    let res: { success: boolean; error?: string };
    await act(async () => {
      res = await result.current.logout();
    });

    expect(res!.success).toBe(false);
    expect(res!.error).toBe('网络错误');
  });

  it('clears error on clearError', async () => {
    mockSignUpWithEmail.mockResolvedValue({ user: null, error: '错误' });

    const { useAuth } = await import('../use-auth');
    const { result } = renderHook(() => useAuth());
    await act(() => Promise.resolve());

    await act(async () => {
      await result.current.signUp({ email: 'a@b.com', password: 'x' });
    });
    expect(result.current.error).toBe('错误');

    act(() => {
      result.current.clearError();
    });
    expect(result.current.error).toBeNull();
  });

  it('returns not initialized error when supabase is null', async () => {
    mockSupabaseClient = null;

    const { useAuth } = await import('../use-auth');
    const { result } = renderHook(() => useAuth());
    await act(() => Promise.resolve());

    const res = await result.current.signUp({ email: 'a@b.com', password: 'x' });
    expect(res.success).toBe(false);
    expect(res.error).toBe('Supabase 客户端未初始化');
  });

  it('enters dev mode when VITE_DEV_ACTOR_USER_ID is set and supabase is null', async () => {
    mockSupabaseClient = null;
    import.meta.env.VITE_DEV_ACTOR_USER_ID = 'dev-user-123';

    const { useAuth } = await import('../use-auth');
    const { result } = renderHook(() => useAuth());
    await act(() => Promise.resolve());

    expect(result.current.isDevMode).toBe(true);
    expect(result.current.userId).toBe('dev-user-123');
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it('signInWithPhone sets user when user is returned', async () => {
    const mockUser = { id: 'phone-user' };
    mockSignInWithPhone.mockResolvedValue({ user: mockUser, error: null, requiresOtp: false });

    const { useAuth } = await import('../use-auth');
    const { result } = renderHook(() => useAuth());
    await act(() => Promise.resolve());

    let res: { success: boolean; requiresOtp?: boolean };
    await act(async () => {
      res = await result.current.signInWithPhone({ phone: '+8613800138000', otp: '123456' });
    });

    expect(res!.success).toBe(true);
    expect(res!.requiresOtp).toBe(false);
    expect(result.current.user).toEqual(mockUser);
  });

  it('logout returns error when supabase is null', async () => {
    mockSupabaseClient = null;
    delete import.meta.env.VITE_DEV_ACTOR_USER_ID;

    const { useAuth } = await import('../use-auth');
    const { result } = renderHook(() => useAuth());
    await act(() => Promise.resolve());

    const res = await result.current.logout();
    expect(res.success).toBe(false);
    expect(res.error).toBe('Supabase 客户端未初始化');
  });

  it('refreshes user on refreshUser call', async () => {
    const mockUser = { id: 'refreshed-user' };
    mockGetCurrentUser.mockResolvedValue({ user: mockUser, error: null });

    const { useAuth } = await import('../use-auth');
    const { result } = renderHook(() => useAuth());
    await act(() => Promise.resolve());

    await act(async () => {
      await result.current.refreshUser();
    });

    expect(result.current.user).toEqual(mockUser);
    expect(mockGetCurrentUser).toHaveBeenCalledTimes(2);
  });

  it('handles refreshUser error', async () => {
    mockGetCurrentUser.mockResolvedValue({ user: null, error: '会话过期' });

    const { useAuth } = await import('../use-auth');
    const { result } = renderHook(() => useAuth());
    await act(() => Promise.resolve());

    await act(async () => {
      await result.current.refreshUser();
    });

    expect(result.current.error).toBe('会话过期');
  });
});
