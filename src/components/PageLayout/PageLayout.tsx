import React from "react";
import { PaymentCard } from "@/components/PaymentCard/PaymentCard";
import { LoadingSpinner } from "@/components/LoadingSpinner/LoadingSpinner";
import styles from "./PageLayout.module.scss";

interface PageLayoutProps {
  title: string;
  isLoading?: boolean;
  error?: string | null;
  children: React.ReactNode;
  maxWidth?: number;
}

/**
 * Reusable page layout component with title, loading, and error states
 * @param title - Page title
 * @param isLoading - Loading state
 * @param error - Error message
 * @param children - Page content
 * @param maxWidth - Maximum width of the card (default: 500)
 */
export const PageLayout: React.FC<PageLayoutProps> = ({
  title,
  isLoading = false,
  error = null,
  children,
  maxWidth = 500,
}) => {
  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <LoadingSpinner size="large" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Error: {error}</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>{title}</h1>
      <div className={styles.cardWrapper} style={{ maxWidth: `${maxWidth}px` }}>
        <PaymentCard>{children}</PaymentCard>
      </div>
    </div>
  );
};

