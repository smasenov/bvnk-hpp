import { useState, useCallback } from "react";
import { getPaymentSummary } from "@/utils/api";
import { isPaymentExpired } from "@/utils/paymentExpiration";
import type { PaymentSummary } from "@/types/payment";

interface UsePaymentOptions {
  uuid: string | string[] | undefined;
  onExpired?: () => void;
  onAccepted?: () => void;
}

interface UsePaymentReturn {
  payment: PaymentSummary | null;
  isLoading: boolean;
  error: string | null;
  fetchPayment: () => Promise<void>;
  setPayment: React.Dispatch<React.SetStateAction<PaymentSummary | null>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}

/**
 * Custom hook for fetching and managing payment data with expiration checks
 * @param options - Hook options including uuid and callbacks
 * @returns Payment state and fetch function
 */
export function usePayment({
  uuid,
  onExpired,
  onAccepted,
}: UsePaymentOptions): UsePaymentReturn {
  const [payment, setPayment] = useState<PaymentSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches payment summary from API with expiration checks
   */
  const fetchPayment = useCallback(async () => {
    if (!uuid || typeof uuid !== "string") return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await getPaymentSummary(uuid);

      // Check if payment is expired and redirect
      if (isPaymentExpired(data)) {
        setIsLoading(true); // Keep loading state to prevent error flash
        if (onExpired) {
          onExpired();
        } else {
          window.location.href = `/payin/${uuid}/expired`;
        }
        return;
      }

      // Handle accepted status
      if (data.quoteStatus === "ACCEPTED" && onAccepted) {
        setIsLoading(true);
        onAccepted();
        return;
      }

      setPayment(data);
    } catch (err) {
      // Don't set error if it's an expiration-related error
      const errorCode =
        err && typeof err === "object" && "code" in err
          ? (err as { code?: string }).code
          : undefined;
      if (errorCode !== "MER-PAY-2017") {
        setError(err instanceof Error ? err.message : "Failed to load payment");
      }
    } finally {
      setIsLoading(false);
    }
  }, [uuid, onExpired, onAccepted]);

  return {
    payment,
    isLoading,
    error,
    fetchPayment,
    setPayment,
    setError,
  };
}

