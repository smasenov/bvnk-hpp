import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { FadeLoader } from "react-spinners";
import { QRCodeSVG } from "qrcode.react";
import { PaymentCard } from "@/components/PaymentCard/PaymentCard";
import CopyButton from "@/components/buttons/CopyButton";
import { getPaymentSummary } from "@/utils/api";
import { formatTime, getTimeRemaining } from "@/utils/timer";
import type { PaymentSummary } from "@/types/payment";
import styles from "./PayQuote.module.scss";

/**
 * Pay Quote page - Payment details and QR code
 */
export default function PayQuote() {
  const router = useRouter();
  const { uuid } = router.query;
  const [payment, setPayment] = useState<PaymentSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  /**
   * Fetches payment summary from API
   */
  const fetchPayment = useCallback(async () => {
    if (!uuid || typeof uuid !== "string") return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await getPaymentSummary(uuid);

      // Check expiryDate first - if expired, redirect immediately without rendering
      if (data.expiryDate && data.expiryDate < Date.now()) {
        window.location.href = `/payin/${uuid}/expired`;
        return;
      }

      // Handle redirects based on status BEFORE setting payment state
      // This prevents flashing the payment screen
      if (data.status === "EXPIRED") {
        window.location.href = `/payin/${uuid}/expired`;
        return;
      }

      // Redirect to Accept Quote if not yet accepted
      if (data.quoteStatus !== "ACCEPTED" || !data.address) {
        window.location.href = `/payin/${uuid}/accept-quote`;
        return;
      }

      setPayment(data);

      // Update time remaining
      if (data.expiryDate) {
        const remaining = getTimeRemaining(data.expiryDate);
        setTimeRemaining(formatTime(remaining));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load payment");
    } finally {
      setIsLoading(false);
    }
  }, [uuid]);

  // Initial fetch
  useEffect(() => {
    fetchPayment();
  }, [fetchPayment]);

  // Timer for countdown using expiryDate
  useEffect(() => {
    if (!payment || !payment.expiryDate) {
      setTimeRemaining("");
      return;
    }

    // Initialize timer immediately
    const initialRemaining = getTimeRemaining(payment.expiryDate);
    setTimeRemaining(formatTime(initialRemaining));

    // Set up interval to update every second
    const interval = setInterval(() => {
      const remaining = getTimeRemaining(payment.expiryDate);
      setTimeRemaining(formatTime(remaining));

      if (remaining <= 0) {
        clearInterval(interval);
        router.push(`/payin/${uuid}/expired`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [payment, router, uuid]);

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <FadeLoader color="#1976d2" />
        </div>
      </div>
    );
  }

  // If still loading or payment data not ready, show loader (don't show error messages)
  if (isLoading || !payment || !payment.address || !payment.paidCurrency.currency) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <FadeLoader color="#1976d2" />
        </div>
      </div>
    );
  }

  // Only show error if we're not loading and have an error
  if (error && !isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Error: {error}</div>
      </div>
    );
  }

  const amountText = `${payment.paidCurrency.amount} ${payment.paidCurrency.currency}`;
  const addressText = payment.address.address;

  return (
    <>
      <Head>
        <title>Pay Quote</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>Pay Quote</h1>
        <div className={styles.cardWrapper}>
          <PaymentCard>
          <div>
            <h2 className={styles.payWithTitle}>
              Pay with {payment.paidCurrency.currency}
            </h2>
            <p className={styles.instruction}>
              To complete this payment send the amount due to the {payment.paidCurrency.currency} address provided below.
            </p>
          </div>

          <div className={styles.detailRow}>
            <div className={styles.detailLabel}>Amount due:</div>
            <div className={styles.detailValue}>
              {amountText}
              <CopyButton value={amountText} ariaLabel="Copy amount" />
            </div>
          </div>

          <div className={styles.detailRow}>
            <div className={styles.detailLabel}>
              {payment.paidCurrency.currency} address:
            </div>
            <div className={styles.detailValue}>
              <span className={styles.addressShort}>
                {addressText.substring(0, 8)}...{addressText.substring(addressText.length - 6)}
              </span>
              <CopyButton value={addressText} ariaLabel="Copy address" />
            </div>
          </div>

          <div className={styles.qrCodeContainer}>
            <QRCodeSVG value={addressText} size={180} />
          </div>

          <div className={styles.fullAddress}>{addressText}</div>

          {payment.expiryDate && (
            <div className={styles.timeLeft}>
              Time left to pay: <span className={styles.timeRemaining}>{timeRemaining || "00:00:00"}</span>
            </div>
          )}

          {error && <div className={styles.error}>{error}</div>}
          </PaymentCard>
        </div>
      </div>
    </>
  );
}

