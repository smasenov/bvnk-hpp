/**
 * Formats milliseconds into HH:MM:SS format
 * @param milliseconds - Time in milliseconds
 * @returns Formatted time string
 */
export function formatTime(milliseconds: number): string {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/**
 * Calculates the time remaining until a target date
 * @param targetDate - Target date timestamp in milliseconds
 * @returns Time remaining in milliseconds
 */
export function getTimeRemaining(targetDate: number): number {
  return Math.max(0, targetDate - Date.now());
}

