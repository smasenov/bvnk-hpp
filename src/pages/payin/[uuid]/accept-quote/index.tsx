import React, { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { PaymentCard } from "@/components/PaymentCard/PaymentCard";
import { PaymentHeader } from "@/components/PaymentHeader";
import { LoadingSpinner } from "@/components/LoadingSpinner/LoadingSpinner";
import { usePayment } from "@/hooks/usePayment";
import { useCountdownTimer } from "@/hooks/useCountdownTimer";
import { updatePaymentSummary, acceptPaymentSummary } from "@/utils/api";
import { getTimeRemaining } from "@/utils/timer";
import type { PaymentSummary } from "@/types/payment";
import styles from "./AcceptQuote.module.scss";

const CURRENCIES = [
  { value: "BTC", label: "Bitcoin BTC" },
  { value: "ETH", label: "Ethereum ETH" },
  { value: "LTC", label: "Litecoin LTC" },
];

const QUOTE_REFRESH_INTERVAL = 30000; // 30 seconds

/**
 * Accept Quote page - Initial stage of payment journey
 */
export default function AcceptQuote() {
  const router = useRouter();
  const { uuid } = router.query;
  const [selectedCurrency, setSelectedCurrency] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isAccepting, setIsAccepting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const paymentRef = useRef<PaymentSummary | null>(null);

  // Memoize callbacks to prevent infinite loops
  const handleExpired = useCallback(() => {
    if (uuid && typeof uuid === "string") {
      window.location.href = `/payin/${uuid}/expired`;
    }
  }, [uuid]);

  const handleAccepted = useCallback(() => {
    if (uuid && typeof uuid === "string") {
      window.location.href = `/payin/${uuid}/pay`;
    }
  }, [uuid]);

  // Use custom hook for payment fetching
  const { payment, isLoading, error: paymentError, fetchPayment, setPayment } = usePayment({
    uuid,
    onExpired: handleExpired,
    onAccepted: handleAccepted,
  });

  // Keep payment ref in sync
  useEffect(() => {
    paymentRef.current = payment;
  }, [payment]);

  // Use custom hook for countdown timer
  const { timeRemaining } = useCountdownTimer({
    expiryDate: payment?.acceptanceExpiryDate,
    enabled: !!selectedCurrency && !!payment?.acceptanceExpiryDate,
  });

  // Combine errors
  const displayError = error || paymentError;

  /**
   * Handles currency selection
   */
  const handleCurrencyChange = async (currency: string) => {
    if (!uuid || typeof uuid !== "string" || !currency) return;

    try {
      setIsUpdating(true);
      setError(null);
      const data = await updatePaymentSummary(uuid, currency);
      
      // If null is returned, payment is expired (MER-PAY-2017)
      if (!data) {
        router.push(`/payin/${uuid}/expired`);
        return;
      }
      
      // Check if payment has expired
      if (data.status === "EXPIRED" || data.quoteStatus === "EXPIRED") {
        router.push(`/payin/${uuid}/expired`);
        return;
      }
      
      setPayment(data);
      setSelectedCurrency(currency);
      // Timer hook will automatically update when payment.acceptanceExpiryDate changes
    } catch (err) {
      const errorCode = err && typeof err === "object" && "code" in err ? (err as { code?: string }).code : undefined;
      const errorMessage = err instanceof Error ? err.message : String(err);
      // Only redirect if we get the specific expired error code
      if (errorCode === "MER-PAY-2017") {
        router.push(`/payin/${uuid}/expired`);
        return;
      }
      setError(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Handles quote acceptance
   */
  const handleAccept = async () => {
    if (!uuid || typeof uuid !== "string") return;

    try {
      setIsAccepting(true);
      setError(null);
      await acceptPaymentSummary(uuid);
      router.push(`/payin/${uuid}/pay`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to accept quote");
      setIsAccepting(false);
    }
  };

  // Initial fetch - only run once when uuid is available
  useEffect(() => {
    if (uuid && typeof uuid === "string") {
      fetchPayment();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uuid]);

  // Quote refresh every ~30 seconds when currency is selected
  // When timer hits 0, make API call and reset timer - repeat until expired
  useEffect(() => {
    if (!selectedCurrency || !uuid || typeof uuid !== "string") return;

    // Check if payment is already expired before starting interval
    const currentPayment = paymentRef.current;
    if (!currentPayment?.acceptanceExpiryDate) return;
    
    if (currentPayment.status === "EXPIRED" || currentPayment.quoteStatus === "EXPIRED") {
      router.push(`/payin/${uuid}/expired`);
      return;
    }

    let lastRefreshTime = Date.now();
    let isRedirecting = false;

    const refreshInterval = setInterval(async () => {
      // Prevent multiple redirects
      if (isRedirecting) {
        clearInterval(refreshInterval);
        return;
      }
      
      // Get current payment from ref
      const current = paymentRef.current;
      if (!current?.acceptanceExpiryDate) {
        clearInterval(refreshInterval);
        return;
      }
      
      const remaining = getTimeRemaining(current.acceptanceExpiryDate);
      
      // Refresh every ~30 seconds while timer is running
      if (remaining > 0 && Date.now() - lastRefreshTime >= QUOTE_REFRESH_INTERVAL) {
        try {
          setIsRefreshing(true);
          // Call update endpoint (PUT /pay/<UUID>/update/summary) to refresh the quote
          const updatedData = await updatePaymentSummary(uuid, selectedCurrency);
          
          // If null is returned, payment is expired (MER-PAY-2017)
          if (!updatedData) {
            isRedirecting = true;
            clearInterval(refreshInterval);
            setIsRefreshing(false);
            window.location.href = `/payin/${uuid}/expired`;
            return;
          }
          
          // Check if payment has expired
          if (updatedData.status === "EXPIRED" || updatedData.quoteStatus === "EXPIRED") {
            isRedirecting = true;
            clearInterval(refreshInterval);
            setIsRefreshing(false);
            window.location.href = `/payin/${uuid}/expired`;
            return;
          }
          
          // Update payment state and ref
          paymentRef.current = updatedData;
          setPayment(updatedData);
          lastRefreshTime = Date.now();
          // Timer hook will automatically update when payment.acceptanceExpiryDate changes
        } catch (err) {
          // Only log non-expiration errors (expired payments return null, not throw)
          console.error("Failed to refresh quote:", err);
        } finally {
          setIsRefreshing(false);
        }
      }
      
      // When timer hits 0, make API call to get new quote and reset timer
      // Repeat this process until payment expires
      if (remaining <= 0) {
        try {
          setIsRefreshing(true);
          const updatedData = await updatePaymentSummary(uuid, selectedCurrency);
          
          // If null is returned, payment is expired (MER-PAY-2017)
          if (!updatedData) {
            isRedirecting = true;
            clearInterval(refreshInterval);
            setIsRefreshing(false);
            window.location.href = `/payin/${uuid}/expired`;
            return;
          }
          
          // Check if payment has expired - only redirect if truly expired
          if (updatedData.status === "EXPIRED" || updatedData.quoteStatus === "EXPIRED") {
            isRedirecting = true;
            clearInterval(refreshInterval);
            setIsRefreshing(false);
            window.location.href = `/payin/${uuid}/expired`;
            return;
          }
          
          // Update payment state and ref with new data
          paymentRef.current = updatedData;
          setPayment(updatedData);
          lastRefreshTime = Date.now();
          // Timer hook will automatically update when payment.acceptanceExpiryDate changes
        } catch (err) {
          // Only log non-expiration errors (expired payments return null, not throw)
          console.error("Failed to refresh quote when timer expired:", err);
        } finally {
          setIsRefreshing(false);
        }
      }
    }, 1000); // Check every second

    return () => {
      clearInterval(refreshInterval);
    };
    // Only depend on selectedCurrency and uuid, not payment (use ref instead)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCurrency, uuid]);

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <LoadingSpinner size="large" />
        </div>
      </div>
    );
  }

  // Don't show error if we're still loading (might be redirecting)
  if (error && !payment && !isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Error: {error}</div>
      </div>
    );
  }

  if (!payment) {
    return null;
  }

  const showPaymentDetails =
    selectedCurrency && payment.paidCurrency.currency && payment.paidCurrency.amount > 0;

  return (
    <>
      <Head>
        <title>Accept Quote</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>Accept Quote</h1>
        
        <div className={styles.cardWrapper}>
          <PaymentCard>
            <PaymentHeader payment={payment} />

            <div className={styles.payWith}>
              <label htmlFor="currency-select" className={styles.label}>Pay with</label>
              <select
                id="currency-select"
                value={selectedCurrency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                disabled={isUpdating}
                className={styles.select}
              >
                <option value="">Select Currency</option>
                {CURRENCIES.map((currency) => (
                  <option key={currency.value} value={currency.value}>
                    {currency.label}
                  </option>
                ))}
              </select>
            </div>

          {showPaymentDetails && (
            <>
              <div className={styles.divider}></div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Amount due</span>
                <span className={styles.detailValue}>
                  {(isUpdating || isRefreshing) ? (
                    <LoadingSpinner className={styles.loadingSpinner} height={15} width={3} size="small" />
                  ) : (
                    `${payment.paidCurrency.amount} ${payment.paidCurrency.currency}`
                  )}
                </span>
              </div>
              {payment.acceptanceExpiryDate && (
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Quoted price expires in</span>
                  <span className={styles.detailValue}>
                    {(isUpdating || isRefreshing) ? (
                      <LoadingSpinner className={styles.loadingSpinner} height={15} width={3} size="small" />
                    ) : (
                      <>
                        {timeRemaining || "00:00:00"}
                        {isRefreshing && (
                          <span className={styles.refreshingIndicator}> (Refreshing...)</span>
                        )}
                      </>
                    )}
                  </span>
                </div>
              )}
              <button
                onClick={handleAccept}
                disabled={isAccepting || isUpdating}
                className={styles.confirmButton}
              >
                {isAccepting ? "Processing..." : "Confirm"}
              </button>
            </>
          )}

          {displayError && !isLoading && <div className={styles.error}>{displayError}</div>}
          </PaymentCard>
        </div>
      </div>
    </>
  );
}

