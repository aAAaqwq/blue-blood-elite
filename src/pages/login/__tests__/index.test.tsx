import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

vi.mock('@/components/layout/app-shell', () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => <div data-testid="app-shell">{children}</div>,
}));

import LoginPage from '../index';

function wrapper({ children }: { children: React.ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>;
}

describe('LoginPage', () => {
  it('renders welcome back title', () => {
    render(<LoginPage />, { wrapper });

    expect(screen.getByText('欢迎回来')).toBeInTheDocument();
    expect(screen.getByText('登录蓝血菁英，连接精英社区')).toBeInTheDocument();
  });

  it('renders email and password fields', () => {
    render(<LoginPage />, { wrapper });

    expect(screen.getByText('邮箱地址')).toBeInTheDocument();
    expect(screen.getByText('密码')).toBeInTheDocument();
  });

  it('renders login button', () => {
    render(<LoginPage />, { wrapper });

    expect(screen.getByText('登录')).toBeInTheDocument();
  });

  it('renders Google login button', () => {
    render(<LoginPage />, { wrapper });

    expect(screen.getByText('使用 Google 登录')).toBeInTheDocument();
  });

  it('renders register link', () => {
    render(<LoginPage />, { wrapper });

    expect(screen.getByText('立即注册')).toBeInTheDocument();
  });

  it('renders forgot password link', () => {
    render(<LoginPage />, { wrapper });

    expect(screen.getByText('忘记密码？')).toBeInTheDocument();
  });
});
