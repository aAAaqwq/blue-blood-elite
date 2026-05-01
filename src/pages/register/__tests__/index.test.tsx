import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

vi.mock('@/components/layout/app-shell', () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => <div data-testid="app-shell">{children}</div>,
}));

import RegisterPage from '../index';

function wrapper({ children }: { children: React.ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>;
}

describe('RegisterPage', () => {
  it('renders create account title', () => {
    render(<RegisterPage />, { wrapper });

    expect(screen.getByText('创建你的精英身份')).toBeInTheDocument();
  });

  it('renders benefits list', () => {
    render(<RegisterPage />, { wrapper });

    expect(screen.getByText('浏览并连接 AI 精英')).toBeInTheDocument();
    expect(screen.getByText('发布悬赏任务赚取收益')).toBeInTheDocument();
    expect(screen.getByText('获取 VERIFIED 认证标识')).toBeInTheDocument();
    expect(screen.getByText('参与成长课程和黑客松')).toBeInTheDocument();
  });

  it('renders form fields', () => {
    render(<RegisterPage />, { wrapper });

    expect(screen.getByText('昵称')).toBeInTheDocument();
    expect(screen.getByText('邮箱地址')).toBeInTheDocument();
    expect(screen.getByText('设置密码')).toBeInTheDocument();
  });

  it('renders create account button', () => {
    render(<RegisterPage />, { wrapper });

    expect(screen.getByText('创建账户')).toBeInTheDocument();
  });

  it('renders login link', () => {
    render(<RegisterPage />, { wrapper });

    expect(screen.getByText('立即登录')).toBeInTheDocument();
  });

  it('renders terms and privacy links', () => {
    render(<RegisterPage />, { wrapper });

    expect(screen.getByText('服务条款')).toBeInTheDocument();
    expect(screen.getByText('隐私政策')).toBeInTheDocument();
  });
});
