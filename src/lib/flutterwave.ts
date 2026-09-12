import { createHmac, timingSafeEqual } from "crypto";
import { appUrl } from "@/lib/utils";

const FLW_API = "https://api.flutterwave.com/v3";

export function isFlutterwaveConfigured() {
  return Boolean(process.env.FLW_SECRET_KEY && process.env.FLW_PUBLIC_KEY);
}

export async function initializeSubscriptionPayment(input: {
  txRef: string;
  amount: number;
  email: string;
  name: string;
  phone?: string | null;
  runnerId: string;
}) {
  if (!process.env.FLW_SECRET_KEY) {
    throw new Error("Flutterwave is not configured.");
  }

  const res = await fetch(`${FLW_API}/payments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tx_ref: input.txRef,
      amount: input.amount,
      currency: "NGN",
      redirect_url: appUrl("/dashboard/runner/subscribe/callback"),
      customer: {
        email: input.email,
        name: input.name,
        phonenumber: input.phone ?? undefined,
      },
      customizations: {
        title: "G-Livery delivery agent subscription",
        description: "Access the order pool and personal customer link",
      },
      meta: { runnerId: input.runnerId },
    }),
  });

  const json = (await res.json()) as {
    status: string;
    message: string;
    data?: { link: string };
  };

  if (json.status !== "success" || !json.data?.link) {
    throw new Error(json.message || "Could not start Flutterwave checkout.");
  }

  return json.data.link;
}

export async function verifyTransactionByRef(txRef: string) {
  if (!process.env.FLW_SECRET_KEY) {
    throw new Error("Flutterwave is not configured.");
  }

  const res = await fetch(
    `${FLW_API}/transactions/verify_by_reference?tx_ref=${encodeURIComponent(txRef)}`,
    {
      headers: { Authorization: `Bearer ${process.env.FLW_SECRET_KEY}` },
    },
  );

  const json = (await res.json()) as {
    status: string;
    data?: {
      status: string;
      amount: number;
      currency: string;
      tx_ref: string;
      meta?: { runnerId?: string };
    };
  };

  if (json.status !== "success" || !json.data) {
    return null;
  }

  return json.data;
}

export function verifyFlutterwaveWebhook(rawBody: string, signature: string | null) {
  const secret = process.env.FLW_SECRET_HASH;
  if (!secret || !signature) return false;

  // Classic dashboard "secret hash" header
  if (signature === secret) return true;

  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  try {
    const a = Buffer.from(expected);
    const b = Buffer.from(signature);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
