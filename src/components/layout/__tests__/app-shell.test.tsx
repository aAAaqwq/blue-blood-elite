import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

vi.mock('@/components/layout/mobile-tab-bar', () => ({
  MobileTabBar: () => <nav data-testid="mobile-tab-bar" />,
}));

import { AppShell } from '../app-shell';

function wrapper({ children }: { children: React.ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>;
}

describe('AppShell', () => {
  it('renders desktop nav with logo and links', () => {
    render(
      <AppShell>
        <p>页面内容</p>
      </AppShell>,
      { wrapper }
    );

    expect(screen.getAllByText('蓝血菁英').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('发现')).toBeInTheDocument();
    expect(screen.getByText('成长')).toBeInTheDocument();
    expect(screen.getAllByText('任务').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('我的').length).toBeGreaterThanOrEqual(1);
  });

  it('renders login and register links', () => {
    render(
      <AppShell>
        <div />
      </AppShell>,
      { wrapper }
    );

    expect(screen.getByText('登录')).toBeInTheDocument();
    expect(screen.getByText('注册')).toBeInTheDocument();
  });

  it('renders children content', () => {
    render(
      <AppShell>
        <p>测试子内容</p>
      </AppShell>,
      { wrapper }
    );

    expect(screen.getByText('测试子内容')).toBeInTheDocument();
  });

  it('shows MobileTabBar by default', () => {
    render(
      <AppShell>
        <div />
      </AppShell>,
      { wrapper }
    );

    expect(screen.getByTestId('mobile-tab-bar')).toBeInTheDocument();
  });

  it('hides MobileTabBar when hideTabBar is true', () => {
    render(
      <AppShell hideTabBar>
        <div />
      </AppShell>,
      { wrapper }
    );

    expect(screen.queryByTestId('mobile-tab-bar')).not.toBeInTheDocument();
  });
});
