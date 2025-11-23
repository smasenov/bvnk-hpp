import { copyToClipboard } from '@/utils/clipboard';

describe('clipboard', () => {
  const originalClipboard = navigator.clipboard;
  const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset clipboard mock
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: jest.fn(() => Promise.resolve()),
      },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: originalClipboard,
      writable: true,
      configurable: true,
    });
    consoleErrorSpy.mockClear();
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('copyToClipboard', () => {
    it('successfully copies text to clipboard', async () => {
      const testValue = 'test-value-123';
      
      await copyToClipboard(testValue);

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(testValue);
      expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('handles empty string', async () => {
      const testValue = '';
      
      await copyToClipboard(testValue);

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('handles special characters', async () => {
      const testValue = 'test@example.com\nline2\twith\ttabs';
      
      await copyToClipboard(testValue);

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(testValue);
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('handles long strings', async () => {
      const testValue = 'a'.repeat(10000);
      
      await copyToClipboard(testValue);

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(testValue);
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('handles clipboard API errors gracefully', async () => {
      const testValue = 'test-value';
      const error = new Error('Clipboard API not available');
      
      (navigator.clipboard.writeText as jest.Mock).mockRejectedValueOnce(error);

      await copyToClipboard(testValue);

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(testValue);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to copy to clipboard:', error);
    });

    it('handles permission denied errors', async () => {
      const testValue = 'test-value';
      const error = new DOMException('Permission denied', 'NotAllowedError');
      
      (navigator.clipboard.writeText as jest.Mock).mockRejectedValueOnce(error);

      await copyToClipboard(testValue);

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(testValue);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to copy to clipboard:', error);
    });

    it('does not throw when clipboard API fails', async () => {
      const testValue = 'test-value';
      const error = new Error('Clipboard error');
      
      (navigator.clipboard.writeText as jest.Mock).mockRejectedValueOnce(error);

      await expect(copyToClipboard(testValue)).resolves.not.toThrow();
    });
  });
});

