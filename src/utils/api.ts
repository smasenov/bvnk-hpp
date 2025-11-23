import type { PaymentSummary } from "@/types/payment";

/**
 * Fetches payment summary for a given UUID
 * @param uuid - Payment UUID
 * @returns Payment summary data
 */
export async function getPaymentSummary(
  uuid: string
): Promise<PaymentSummary> {
  const response = await fetch(`/api/pay/${uuid}/summary`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.message || errorData.error || `Failed to fetch payment summary: ${response.statusText}`;
    const error = new Error(errorMessage);
    // Attach error code and data for better error handling
    (error as any).code = errorData.code;
    (error as any).data = errorData;
    throw error;
  }

  return response.json();
}

/**
 * Updates payment summary with selected currency
 * @param uuid - Payment UUID
 * @param currency - Selected currency code (BTC, ETH, LTC)
 * @returns Updated payment summary or null if expired/error (status >= 400)
 */
export async function updatePaymentSummary(
  uuid: string,
  currency: string
): Promise<PaymentSummary | null> {
  const response = await fetch(`/api/pay/${uuid}/update`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      currency,
    }),
  });

  if (!response.ok) {
    // If status code is 400 or above, treat as expired and return null
    // This prevents Next.js from showing runtime errors
    if (response.status >= 400) {
      return null;
    }
    
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.message || errorData.error || `Failed to update payment summary: ${response.statusText}`;
    const error = new Error(errorMessage);
    // Attach error code and data for better error handling
    (error as any).code = errorData.code;
    (error as any).data = errorData;
    throw error;
  }

  return response.json();
}

/**
 * Accepts the payment summary
 * @param uuid - Payment UUID
 * @returns Accepted payment summary
 */
export async function acceptPaymentSummary(
  uuid: string
): Promise<PaymentSummary> {
  const response = await fetch(`/api/pay/${uuid}/accept`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || `Failed to accept payment summary: ${response.statusText}`
    );
  }

  return response.json();
}

