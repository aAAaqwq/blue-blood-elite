import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InterestGroupCard } from '../components/interest-group-card';
import type { InterestGroup } from '../types';

const mockGroup: InterestGroup = {
  id: '1',
  name: 'AI开发',
  icon: 'Brain',
  memberCount: 1280,
  description: 'AI应用开发交流',
};

describe('InterestGroupCard', () => {
  it('renders group information', () => {
    render(<InterestGroupCard group={mockGroup} onClick={vi.fn()} />);

    expect(screen.getByText('AI开发')).toBeInTheDocument();
    expect(screen.getByText('1,280人')).toBeInTheDocument();
    expect(screen.getByText('AI应用开发交流')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<InterestGroupCard group={mockGroup} onClick={handleClick} />);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledWith(mockGroup.id);
  });

  it('shows selected state', () => {
    render(<InterestGroupCard group={mockGroup} onClick={vi.fn()} isSelected />);
    expect(screen.getByRole('button')).toHaveClass('border-gold-500');
  });

  it('renders with different sizes', () => {
    const { rerender } = render(
      <InterestGroupCard group={mockGroup} onClick={vi.fn()} size="sm" />
    );
    expect(screen.getByRole('button')).toHaveClass('p-3');

    rerender(<InterestGroupCard group={mockGroup} onClick={vi.fn()} size="lg" />);
    expect(screen.getByRole('button')).toHaveClass('p-6');
  });
});
