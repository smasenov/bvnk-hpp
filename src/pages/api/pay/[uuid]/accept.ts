import type { NextApiRequest, NextApiResponse } from "next";
import type { PaymentSummary } from "@/types/payment";

const API_BASE_URL = "https://api.sandbox.bvnk.com/api/v1";

/**
 * Proxy API route for accepting payment summary
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PaymentSummary | { error: string }>
) {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { uuid } = req.query;

  if (!uuid || typeof uuid !== "string") {
    return res.status(400).json({ error: "Invalid UUID" });
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

    const response = await fetch(`${API_BASE_URL}/pay/${uuid}/accept/summary`, {
      method: "PUT",
      headers,
      body: JSON.stringify({
        successUrl: "no_url",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        error: `API error: ${response.statusText} - ${errorText}`,
      });
    }

    const data: PaymentSummary = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error("Error accepting payment summary:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
}

