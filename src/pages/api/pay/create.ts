import type { NextApiRequest, NextApiResponse } from "next";

const API_BASE_URL = process.env.BVNK_API_BASE_URL || "https://api.sandbox.bvnk.com/api/v1";

interface CreatePaymentResponse {
  uuid?: string;
  error?: string;
}

/**
 * Proxy API route for creating a payment
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CreatePaymentResponse>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Add authentication headers if provided via environment variables
    if (process.env.BVNK_API_KEY) {
      headers["Authorization"] = `Bearer ${process.env.BVNK_API_KEY}`;
    }
    if (process.env.BVNK_API_SECRET) {
      headers["X-API-SECRET"] = process.env.BVNK_API_SECRET;
    }

    // Default payment creation payload
    const payload = req.body || {
      merchantId: process.env.BVNK_MERCHANT_ID || "",
      amount: 200,
      currency: "EUR",
      reference: `REF${Date.now()}`,
    };

    const requestUrl = `${API_BASE_URL}/pay/summary`;
    console.log("Creating payment at:", requestUrl);
    console.log("Payload:", payload);

    const response = await fetch(requestUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        error: `API error: ${response.statusText} - ${errorText}`,
      });
    }

    const data = await response.json();
    return res.status(200).json({ uuid: data.uuid });
  } catch (error) {
    console.error("Error creating payment:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
}

