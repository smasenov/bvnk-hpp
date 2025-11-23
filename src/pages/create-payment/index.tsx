import { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { PaymentCard } from "@/components/PaymentCard/PaymentCard";
import styles from "./CreatePayment.module.scss";

/**
 * Page to create a new payment UUID or use an existing one
 */
export default function CreatePayment() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [uuid, setUuid] = useState<string | null>(null);
  const [manualUuid, setManualUuid] = useState<string>("");

  /**
   * Creates a new payment
   */
  const handleCreatePayment = async () => {
    try {
      setIsCreating(true);
      setError(null);
      setUuid(null);

      const response = await fetch("/api/pay/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create payment");
      }

      if (data.uuid) {
        setUuid(data.uuid);
        // Auto-redirect after 2 seconds
        setTimeout(() => {
          router.push(`/payin/${data.uuid}`);
        }, 2000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create payment");
    } finally {
      setIsCreating(false);
    }
  };

  /**
   * Uses a manually entered UUID
   */
  const handleUseManualUuid = () => {
    if (manualUuid.trim()) {
      router.push(`/payin/${manualUuid.trim()}`);
    } else {
      setError("Please enter a payment UUID");
    }
  };

  return (
    <>
      <Head>
        <title>Create Payment</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>Start Payment Flow</h1>
        <div className={styles.cardWrapper}>
          <PaymentCard>
            <p className={styles.description}>
            You can either create a new payment (requires API credentials) or use an existing payment UUID.
          </p>

          {uuid && (
            <div className={styles.success}>
              <p>Payment created successfully!</p>
              <p className={styles.uuid}>UUID: {uuid}</p>
              <p className={styles.redirect}>Redirecting to payment page...</p>
            </div>
          )}

          {error && (
            <div className={styles.error}>
              <p>Error: {error}</p>
              <p className={styles.errorNote}>
                Note: Creating payments requires API credentials. You can use an existing UUID below instead.
              </p>
            </div>
          )}

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Option 1: Use Existing Payment UUID</h3>
            <div className={styles.inputGroup}>
              <input
                type="text"
                value={manualUuid}
                onChange={(e) => setManualUuid(e.target.value)}
                placeholder="fcbacea9-070f-4d69-96ce-db873999c95a"
                className={styles.input}
              />
              <button
                onClick={handleUseManualUuid}
                disabled={!manualUuid.trim()}
                className={styles.useButton}
              >
                Use This UUID
              </button>
            </div>
            <button
              onClick={() => {
                setManualUuid("fcbacea9-070f-4d69-96ce-db873999c95a");
              }}
              className={styles.exampleButton}
            >
              Use Example UUID
            </button>
          </div>

          <div className={styles.divider}>OR</div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Option 2: Create New Payment</h3>
            <p className={styles.note}>
              Requires API credentials in .env.local file (BVNK_API_KEY, BVNK_API_SECRET, BVNK_MERCHANT_ID)
            </p>
            {!uuid && (
              <button
                onClick={handleCreatePayment}
                disabled={isCreating}
                className={styles.createButton}
              >
                {isCreating ? "Creating..." : "Create Payment"}
              </button>
            )}
            {uuid && (
              <button
                onClick={() => router.push(`/payin/${uuid}`)}
                className={styles.goButton}
              >
                Go to Payment Page
              </button>
            )}
          </div>
          </PaymentCard>
        </div>
      </div>
    </>
  );
}

