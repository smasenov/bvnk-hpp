import React from "react";
import styles from "./PaymentCard.module.scss";

interface PaymentCardProps {
  children: React.ReactNode;
}

/**
 * Reusable card component for payment pages
 * @param children - Card content
 */
export const PaymentCard: React.FC<PaymentCardProps> = ({ children }) => {
  return (
    <div className={styles.card}>
      <div className={styles.content}>{children}</div>
    </div>
  );
};

