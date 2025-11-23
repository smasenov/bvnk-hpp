import React, { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { Geist, Geist_Mono } from "next/font/google";
import styles from "@/styles/Home.module.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * Landing page - Enter payment UUID to redirect to payment flow
 */
export default function Home() {
  const router = useRouter();
  const [uuid, setUuid] = useState<string>("");

  /**
   * Handles form submission and redirects to payment page
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (uuid.trim()) {
      router.push(`/payin/${uuid.trim()}`);
    }
  };

  return (
    <>
      <Head>
        <title>BVNK Hosted Payment Page</title>
        <meta name="description" content="BVNK payment flow" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div
        className={`${styles.page} ${geistSans.variable} ${geistMono.variable}`}
      >
        <main className={styles.main}>
          <div className={styles.intro}>
            <h1>BVNK Hosted Payment Page</h1>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="uuid-input" className={styles.label}>
                Please add your ID here
              </label>
              <input
                id="uuid-input"
                type="text"
                value={uuid}
                onChange={(e) => setUuid(e.target.value)}
                placeholder="Enter quote UUID"
                className={styles.input}
                required
              />
            </div>
            <button 
              type="submit" 
              className={styles.button}
              disabled={!uuid.trim()}
            >
              Go to Quote
            </button>
          </form>
        </main>
      </div>
    </>
  );
}
