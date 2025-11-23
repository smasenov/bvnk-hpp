/**
 * Currency information structure
 */
export interface Currency {
  currency: string | null;
  amount: number;
  actual: number;
}

/**
 * Exchange rate information
 */
export interface ExchangeRate {
  base: string;
  counter: string;
  rate: number;
}

/**
 * Crypto address information
 */
export interface Address {
  address: string;
  tag: string | null;
  protocol: string;
  uri: string;
  alternatives: string[];
}

/**
 * Payment summary response from API
 */
export interface PaymentSummary {
  uuid: string;
  merchantDisplayName: string;
  merchantId: string;
  dateCreated: number;
  expiryDate: number;
  quoteExpiryDate: number | null;
  acceptanceExpiryDate: number | null;
  quoteStatus: "TEMPLATE" | "ACCEPTED" | "EXPIRED";
  reference: string;
  type: string;
  subType: string;
  status: "PENDING" | "EXPIRED" | "COMPLETED";
  displayCurrency: Currency;
  walletCurrency: Currency;
  paidCurrency: Currency;
  feeCurrency: Currency;
  displayRate: ExchangeRate | null;
  exchangeRate: ExchangeRate | null;
  address: Address | null;
  returnUrl: string;
  redirectUrl: string;
  transactions: unknown[];
  refund: unknown | null;
  refunds: unknown[];
}

/**
 * Currency option for dropdown
 */
export interface CurrencyOption {
  value: string;
  label: string;
}

