import type { PaymentSummary } from "@/types/payment";

/**
 * Checks if a payment has expired based on expiryDate
 * @param payment - Payment summary object
 * @returns true if payment is expired, false otherwise
 */
export function isPaymentExpired(payment: PaymentSummary | null): boolean {
  if (!payment) return false;
  
  // Check expiryDate first
  if (payment.expiryDate && payment.expiryDate < Date.now()) {
    return true;
  }
  
  // Check status fields
  if (payment.status === "EXPIRED" || payment.quoteStatus === "EXPIRED") {
    return true;
  }
  
  return false;
}


