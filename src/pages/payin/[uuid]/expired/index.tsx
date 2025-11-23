import type { NextPage } from "next";
import Head from "next/head";
import { PaymentCard } from "@/components/PaymentCard/PaymentCard";
import styles from "./Expired.module.scss";

/**
 * Expiry page - Displayed when payment details have expired
 * This is a static page with no client-side interactivity
 */
const Expired: NextPage = () => {
  return (
    <>
      <Head>
        <title>Payment Expired</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>Expiry</h1>
        <div className={styles.cardWrapper}>
          <PaymentCard>
            <div className={styles.content}>
              <div className={styles.icon}>
                <div className={styles.iconOuter}>
                  <div className={styles.iconInner}>!</div>
                </div>
              </div>
              <h2 className={styles.title}>Payment details expired</h2>
              <p className={styles.message}>
                The payment details for your transaction have expired.
              </p>
            </div>
          </PaymentCard>
        </div>
      </div>
    </>
  );
};

export default Expired;

