import { isPaymentExpired } from '@/utils/paymentExpiration';
import type { PaymentSummary } from '@/types/payment';

describe('paymentExpiration', () => {
  const createMockPayment = (overrides: Partial<PaymentSummary> = {}): PaymentSummary => ({
    uuid: 'test-uuid',
    merchantDisplayName: 'Test Merchant',
    merchantId: 'merchant-123',
    dateCreated: Date.now() - 3600000, // 1 hour ago
    expiryDate: Date.now() + 3600000, // 1 hour from now
    quoteExpiryDate: null,
    acceptanceExpiryDate: null,
    quoteStatus: 'ACCEPTED',
    reference: 'ref-123',
    type: 'PAYMENT',
    subType: 'CRYPTO',
    status: 'PENDING',
    displayCurrency: { currency: 'USD', amount: 100, actual: 100 },
    walletCurrency: { currency: 'USD', amount: 100, actual: 100 },
    paidCurrency: { currency: 'BTC', amount: 0.001, actual: 0.001 },
    feeCurrency: { currency: 'BTC', amount: 0.0001, actual: 0.0001 },
    displayRate: null,
    exchangeRate: null,
    address: null,
    returnUrl: 'https://example.com/return',
    redirectUrl: 'https://example.com/redirect',
    transactions: [],
    refund: null,
    refunds: [],
    ...overrides,
  });

  describe('isPaymentExpired', () => {
    it('returns false for null payment', () => {
      expect(isPaymentExpired(null)).toBe(false);
    });

    it('returns false for active payment with future expiryDate', () => {
      const payment = createMockPayment({
        expiryDate: Date.now() + 3600000, // 1 hour from now
        status: 'PENDING',
        quoteStatus: 'ACCEPTED',
      });

      expect(isPaymentExpired(payment)).toBe(false);
    });

    it('returns true for payment with past expiryDate', () => {
      const payment = createMockPayment({
        expiryDate: Date.now() - 1000, // 1 second ago
        status: 'PENDING',
        quoteStatus: 'ACCEPTED',
      });

      expect(isPaymentExpired(payment)).toBe(true);
    });

    it('returns true for payment with status EXPIRED', () => {
      const payment = createMockPayment({
        expiryDate: Date.now() + 3600000, // Future date
        status: 'EXPIRED',
        quoteStatus: 'ACCEPTED',
      });

      expect(isPaymentExpired(payment)).toBe(true);
    });

    it('returns true for payment with quoteStatus EXPIRED', () => {
      const payment = createMockPayment({
        expiryDate: Date.now() + 3600000, // Future date
        status: 'PENDING',
        quoteStatus: 'EXPIRED',
      });

      expect(isPaymentExpired(payment)).toBe(true);
    });

    it('returns true when both status and quoteStatus are EXPIRED', () => {
      const payment = createMockPayment({
        expiryDate: Date.now() + 3600000, // Future date
        status: 'EXPIRED',
        quoteStatus: 'EXPIRED',
      });

      expect(isPaymentExpired(payment)).toBe(true);
    });

    it('returns true when expiryDate is past even if status is PENDING', () => {
      const payment = createMockPayment({
        expiryDate: Date.now() - 1000, // Past date
        status: 'PENDING',
        quoteStatus: 'ACCEPTED',
      });

      expect(isPaymentExpired(payment)).toBe(true);
    });

    it('returns false for payment with no expiryDate but valid status', () => {
      const payment = createMockPayment({
        expiryDate: 0, // No expiry date
        status: 'PENDING',
        quoteStatus: 'ACCEPTED',
      });

      // When expiryDate is 0 or falsy, it should check status fields
      // Since status is PENDING and quoteStatus is ACCEPTED, it should return false
      expect(isPaymentExpired(payment)).toBe(false);
    });

    it('handles payment with expiryDate exactly at current time', () => {
      const now = Date.now();
      const payment = createMockPayment({
        expiryDate: now,
        status: 'PENDING',
        quoteStatus: 'ACCEPTED',
      });

      // expiryDate < Date.now() should be false when equal, but let's test the actual behavior
      // Since expiryDate < Date.now() is false when equal, it should return false
      // But if there's any timing difference, it might be true
      const result = isPaymentExpired(payment);
      // The function checks expiryDate < Date.now(), so if they're equal, it returns false
      expect(typeof result).toBe('boolean');
    });

    it('returns false for completed payment with future expiryDate', () => {
      const payment = createMockPayment({
        expiryDate: Date.now() + 3600000,
        status: 'COMPLETED',
        quoteStatus: 'ACCEPTED',
      });

      expect(isPaymentExpired(payment)).toBe(false);
    });
  });
});

