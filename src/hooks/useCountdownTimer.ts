import { useState, useEffect } from "react";
import { formatTime, getTimeRemaining } from "@/utils/timer";

interface UseCountdownTimerOptions {
  expiryDate: number | null | undefined;
  onExpired?: () => void;
  enabled?: boolean;
}

interface UseCountdownTimerReturn {
  timeRemaining: string;
  isExpired: boolean;
}

/**
 * Custom hook for countdown timer functionality
 * @param options - Timer options including expiry date and callbacks
 * @returns Time remaining string and expired status
 */
export function useCountdownTimer({
  expiryDate,
  onExpired,
  enabled = true,
}: UseCountdownTimerOptions): UseCountdownTimerReturn {
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [isExpired, setIsExpired] = useState<boolean>(false);

  useEffect(() => {
    if (!enabled || !expiryDate) {
      setTimeRemaining("");
      setIsExpired(false);
      return;
    }

    // Initialize timer immediately
    const initialRemaining = getTimeRemaining(expiryDate);
    setTimeRemaining(formatTime(initialRemaining));
    setIsExpired(initialRemaining <= 0);

    // Set up interval to update every second
    const interval = setInterval(() => {
      const remaining = getTimeRemaining(expiryDate);
      setTimeRemaining(formatTime(remaining));
      setIsExpired(remaining <= 0);

      if (remaining <= 0 && onExpired) {
        clearInterval(interval);
        onExpired();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiryDate, onExpired, enabled]);

  return { timeRemaining, isExpired };
}

