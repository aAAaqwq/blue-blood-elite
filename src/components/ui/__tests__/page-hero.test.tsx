import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PageHero } from '../page-hero';

describe('PageHero', () => {
  it('renders eyebrow, title and description', () => {
    render(
      <PageHero eyebrow="章节标签" title="页面标题" description="页面描述文字" />
    );

    expect(screen.getByText('章节标签')).toBeInTheDocument();
    expect(screen.getByText('页面标题')).toBeInTheDocument();
    expect(screen.getByText('页面描述文字')).toBeInTheDocument();
  });

  it('renders title as h1 element', () => {
    render(
      <PageHero eyebrow="E" title="标题" description="D" />
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('标题');
  });
});
