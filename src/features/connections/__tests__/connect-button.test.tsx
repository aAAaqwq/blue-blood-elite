import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('../components/connection-form', () => ({
  ConnectionForm: ({ onSuccess }: { onSuccess?: () => void }) => (
    <button onClick={onSuccess}>MockConnectionForm</button>
  ),
}));

import { ConnectButton } from '../components/connect-button';

describe('ConnectButton', () => {
  it('renders message link when status is accepted', () => {
    render(<ConnectButton toUserId="u-2" toUserName="Alice" initialStatus="accepted" />);

    const link = screen.getByText('发消息');
    expect(link).toBeInTheDocument();
    expect(link.closest('a')).toHaveAttribute('href', '/me/messages/u-2');
  });

  it('renders pending button with incoming text when isIncoming', () => {
    render(<ConnectButton toUserId="u-2" toUserName="Alice" initialStatus="pending" isIncoming />);

    expect(screen.getByText('等待确认')).toBeDisabled();
  });

  it('renders pending button with outgoing text when not incoming', () => {
    render(<ConnectButton toUserId="u-2" toUserName="Alice" initialStatus="pending" />);

    expect(screen.getByText('已发送')).toBeDisabled();
  });

  it('renders connect button and opens modal on click', () => {
    render(<ConnectButton toUserId="u-2" toUserName="Alice" />);

    const btn = screen.getByText('连接');
    expect(btn).toBeInTheDocument();

    fireEvent.click(btn);

    expect(screen.getByText('建立连接')).toBeInTheDocument();
    expect(screen.getByText('MockConnectionForm')).toBeInTheDocument();
  });

  it('closes modal when clicking overlay', () => {
    render(<ConnectButton toUserId="u-2" toUserName="Alice" />);

    fireEvent.click(screen.getByText('连接'));

    const overlay = screen.getByText('建立连接').closest('.fixed')!;
    fireEvent.click(overlay);

    expect(screen.queryByText('建立连接')).not.toBeInTheDocument();
  });

  it('transitions to pending when ConnectionForm onSuccess fires', () => {
    vi.useFakeTimers();
    render(<ConnectButton toUserId="u-2" toUserName="Alice" />);

    fireEvent.click(screen.getByText('连接'));
    fireEvent.click(screen.getByText('MockConnectionForm'));

    expect(screen.getByText('已发送')).toBeDisabled();

    vi.advanceTimersByTime(1500);
    vi.useRealTimers();
  });

  it('closes modal via close button (X)', () => {
    render(<ConnectButton toUserId="u-2" toUserName="Alice" />);

    fireEvent.click(screen.getByText('连接'));
    expect(screen.getByText('建立连接')).toBeInTheDocument();

    // Find and click the close button (the SVG button inside modal header)
    const modal = screen.getByText('建立连接').closest('.rounded-2xl')!;
    const closeBtn = modal.querySelector('button')!;
    fireEvent.click(closeBtn);

    expect(screen.queryByText('建立连接')).not.toBeInTheDocument();
  });
});
