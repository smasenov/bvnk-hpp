import '@testing-library/jest-dom';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CopyButton from '@/components/buttons/CopyButton';
import { copyToClipboard } from '@/utils/clipboard';

// Mock the clipboard utility
jest.mock('@/utils/clipboard', () => ({
  copyToClipboard: jest.fn(() => Promise.resolve()),
}));

// Mock Radix UI components
jest.mock('@radix-ui/themes', () => ({
  IconButton: ({ children, onClick, className, 'aria-label': ariaLabel, ...props }: any) => (
    <button
      onClick={onClick}
      className={className}
      aria-label={ariaLabel}
      {...props}
    >
      {children}
    </button>
  ),
}));

jest.mock('@radix-ui/react-icons', () => ({
  CopyIcon: ({ className }: { className?: string }) => (
    <svg data-testid="copy-icon" className={className} />
  ),
  CheckIcon: ({ className }: { className?: string }) => (
    <svg data-testid="check-icon" className={className} />
  ),
}));

describe('CopyButton', () => {
  const mockCopyToClipboard = copyToClipboard as jest.MockedFunction<typeof copyToClipboard>;
  const testValue = 'test-value-123';

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    // Run all pending timers to prevent unhandled rejections
    act(() => {
      jest.runOnlyPendingTimers();
    });
    
    // Clear any remaining timers
    jest.clearAllTimers();
    
    // Switch back to real timers
    jest.useRealTimers();
  });

  describe('Rendering', () => {
    it('renders the copy button', () => {
      render(<CopyButton value={testValue} />);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('renders with default aria-label', () => {
      render(<CopyButton value={testValue} />);
      const button = screen.getByRole('button', { name: 'Copy' });
      expect(button).toBeInTheDocument();
    });

    it('renders with custom aria-label', () => {
      const customLabel = 'Copy to clipboard';
      render(<CopyButton value={testValue} ariaLabel={customLabel} />);
      const button = screen.getByRole('button', { name: customLabel });
      expect(button).toBeInTheDocument();
    });

    it('renders copy icon initially', () => {
      render(<CopyButton value={testValue} />);
      const copyIcon = screen.getByTestId('copy-icon');
      expect(copyIcon).toBeInTheDocument();
    });
  });

  describe('Copy functionality', () => {
    it('calls copyToClipboard when button is clicked', async () => {
      const user = userEvent.setup({ delay: null });
      render(<CopyButton value={testValue} />);
      
      const button = screen.getByRole('button');
      await user.click(button);

      expect(mockCopyToClipboard).toHaveBeenCalledWith(testValue);
      expect(mockCopyToClipboard).toHaveBeenCalledTimes(1);
    });

    it('stops event propagation on click', async () => {
      const user = userEvent.setup({ delay: null });
      const handleParentClick = jest.fn();
      
      render(
        <div onClick={handleParentClick}>
          <CopyButton value={testValue} />
        </div>
      );
      
      const button = screen.getByRole('button');
      await user.click(button);

      expect(handleParentClick).not.toHaveBeenCalled();
    });
  });

  describe('Icon state changes', () => {
    it('shows check icon after copying', async () => {
      const user = userEvent.setup({ delay: null });
      render(<CopyButton value={testValue} />);
      
      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        const checkIcon = screen.getByTestId('check-icon');
        expect(checkIcon).toBeInTheDocument();
      });
    });

    it('hides copy icon after copying', async () => {
      const user = userEvent.setup({ delay: null });
      render(<CopyButton value={testValue} />);
      
      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        const copyIcon = screen.getByTestId('copy-icon');
        expect(copyIcon).toHaveClass('hide');
      });
    });

    it('reverts to copy icon after 1 second', async () => {
      const user = userEvent.setup({ delay: null });
      render(<CopyButton value={testValue} />);
      
      const button = screen.getByRole('button');
      await user.click(button);

      // Wait for check icon to appear
      await waitFor(() => {
        expect(screen.getByTestId('check-icon')).toBeInTheDocument();
      });

      // Fast-forward 1 second
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Wait for copy icon to reappear
      await waitFor(() => {
        const copyIcon = screen.getByTestId('copy-icon');
        expect(copyIcon).toHaveClass('show');
      });
    });
  });

  describe('Trigger prop', () => {
    it('copies when trigger prop changes', async () => {
      const { rerender } = render(<CopyButton value={testValue} trigger={0} />);
      
      expect(mockCopyToClipboard).not.toHaveBeenCalled();

      rerender(<CopyButton value={testValue} trigger={1} />);

      await waitFor(() => {
        expect(mockCopyToClipboard).toHaveBeenCalledWith(testValue);
      });
    });

    it('copies again when trigger increments', async () => {
      const { rerender } = render(<CopyButton value={testValue} trigger={1} />);
      
      await waitFor(() => {
        expect(mockCopyToClipboard).toHaveBeenCalledTimes(1);
      });

      rerender(<CopyButton value={testValue} trigger={2} />);

      await waitFor(() => {
        expect(mockCopyToClipboard).toHaveBeenCalledTimes(2);
      });
    });

    it('does not copy when trigger is 0 or negative', () => {
      render(<CopyButton value={testValue} trigger={0} />);
      expect(mockCopyToClipboard).not.toHaveBeenCalled();

      const { rerender } = render(<CopyButton value={testValue} trigger={-1} />);
      rerender(<CopyButton value={testValue} trigger={-1} />);
      expect(mockCopyToClipboard).not.toHaveBeenCalled();
    });
  });

  describe('Cleanup', () => {
    it('clears timeout on unmount', async () => {
      const user = userEvent.setup({ delay: null });
      const { unmount } = render(<CopyButton value={testValue} />);
      
      const button = screen.getByRole('button');
      await user.click(button);

      // Unmount before timeout completes
      unmount();

      // Fast-forward time - should not cause errors
      expect(() => {
        act(() => {
          jest.advanceTimersByTime(1000);
        });
      }).not.toThrow();
    });

    it('clears previous timeout when copying multiple times quickly', async () => {
      const user = userEvent.setup({ delay: null });
      render(<CopyButton value={testValue} />);
      
      const button = screen.getByRole('button');
      
      // Click multiple times quickly
      await user.click(button);
      await user.click(button);
      await user.click(button);

      // Should only have one active timeout
      expect(mockCopyToClipboard).toHaveBeenCalledTimes(3);
      
      // Fast-forward 1 second - should only revert once
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        const copyIcon = screen.getByTestId('copy-icon');
        expect(copyIcon).toHaveClass('show');
      });
    });
  });

  describe('Error handling', () => {
    it('handles clipboard errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockCopyToClipboard.mockRejectedValueOnce(new Error('Clipboard error'));
      
      const user = userEvent.setup({ delay: null });
      render(<CopyButton value={testValue} />);
      
      const button = screen.getByRole('button');
      await user.click(button);

      // Should not throw, but error should be logged
      await waitFor(() => {
        expect(mockCopyToClipboard).toHaveBeenCalled();
      });

      consoleErrorSpy.mockRestore();
    });
  });
});

