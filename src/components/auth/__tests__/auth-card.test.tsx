import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthCard } from '../auth-card';

describe('AuthCard', () => {
  it('renders title and description', () => {
    render(
      <AuthCard title="测试标题" description="测试描述">
        <div>child content</div>
      </AuthCard>
    );

    expect(screen.getByText('测试标题')).toBeInTheDocument();
    expect(screen.getByText('测试描述')).toBeInTheDocument();
  });

  it('renders children', () => {
    render(
      <AuthCard title="T" description="D">
        <p>子内容</p>
      </AuthCard>
    );

    expect(screen.getByText('子内容')).toBeInTheDocument();
  });
});
