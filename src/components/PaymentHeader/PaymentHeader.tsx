import React from "react";
import type { PaymentSummary } from "@/types/payment";
import styles from "./PaymentHeader.module.scss";

interface PaymentHeaderProps {
  payment: PaymentSummary;
}

/**
 * Reusable component for displaying payment header information
 * @param payment - Payment summary object
 */
export const PaymentHeader: React.FC<PaymentHeaderProps> = ({ payment }) => {
  return (
    <div className={styles.header}>
      <div className={styles.merchantName}>{payment.merchantDisplayName}</div>
      <div className={styles.amount}>
        {payment.displayCurrency.amount.toFixed(2)} <span className={styles.currency}>{payment.displayCurrency.currency}</span>
      </div>
      <div className={styles.reference}>
        For reference number: <span className={styles.referenceNumber}>{payment.reference}</span>
      </div>
    </div>
  );
};

