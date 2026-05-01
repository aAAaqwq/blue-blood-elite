import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SmartMatchCard } from '../components/smart-match-card';
import type { UserMatch } from '../types';

const mockMatch: UserMatch = {
  id: '1',
  name: '张三',
  avatar: 'https://example.com/avatar.jpg',
  matchScore: 98,
  field: 'AI应用开发',
  skills: ['Python', 'LangChain', 'OpenAI'],
};

describe('SmartMatchCard', () => {
  it('renders user information', () => {
    render(<SmartMatchCard user={mockMatch} onConnect={vi.fn()} />);

    expect(screen.getByText('张三')).toBeInTheDocument();
    expect(screen.getByText('AI应用开发')).toBeInTheDocument();
    expect(screen.getByText('98%匹配')).toBeInTheDocument();
  });

  it('renders skill tags', () => {
    render(<SmartMatchCard user={mockMatch} onConnect={vi.fn()} />);

    expect(screen.getByText('Python')).toBeInTheDocument();
    expect(screen.getByText('LangChain')).toBeInTheDocument();
    expect(screen.getByText('OpenAI')).toBeInTheDocument();
  });

  it('calls onConnect when connect button clicked', () => {
    const handleConnect = vi.fn();
    render(<SmartMatchCard user={mockMatch} onConnect={handleConnect} />);

    fireEvent.click(screen.getByText('建立联系'));
    expect(handleConnect).toHaveBeenCalledWith(mockMatch.id);
  });

  it('shows high match score with special styling', () => {
    render(<SmartMatchCard user={mockMatch} onConnect={vi.fn()} />);

    const scoreElement = screen.getByText('98%匹配');
    expect(scoreElement).toHaveClass('text-gold-500');
  });

  it('limits displayed skills to 3', () => {
    const userWithManySkills = {
      ...mockMatch,
      skills: ['Python', 'LangChain', 'OpenAI', 'React', 'Node.js'],
    };

    render(<SmartMatchCard user={userWithManySkills} onConnect={vi.fn()} />);

    expect(screen.getByText('Python')).toBeInTheDocument();
    expect(screen.getByText('+2')).toBeInTheDocument();
    expect(screen.queryByText('Node.js')).not.toBeInTheDocument();
  });

  it('renders avatar fallback when no avatar URL', () => {
    const noAvatar = { ...mockMatch, avatar: '' };
    render(<SmartMatchCard user={noAvatar} onConnect={vi.fn()} />);

    expect(screen.queryByRole('img')).toBeNull();
    expect(screen.getByText('张三')).toBeInTheDocument();
  });

  it('shows regular styling when match score is 90 or below', () => {
    const lowMatch = { ...mockMatch, matchScore: 75 };
    render(<SmartMatchCard user={lowMatch} onConnect={vi.fn()} />);

    const scoreElement = screen.getByText('75%匹配');
    expect(scoreElement).toHaveClass('text-blue-300');
  });
});
