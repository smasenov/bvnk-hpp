export const copyToClipboard = async (value: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(value);
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
  }
};


