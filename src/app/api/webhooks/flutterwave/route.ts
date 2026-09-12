import { verifyFlutterwaveWebhook } from "@/lib/flutterwave";
import { fulfillSubscriptionByTxRef } from "@/actions/runner";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature =
    request.headers.get("flutterwave-signature") ??
    request.headers.get("verif-hash");

  if (!verifyFlutterwaveWebhook(rawBody, signature)) {
    return new NextResponse("invalid signature", { status: 401 });
  }

  let event: { event?: string; data?: { tx_ref?: string; status?: string } };
  try {
    event = JSON.parse(rawBody) as typeof event;
  } catch {
    return new NextResponse("invalid json", { status: 400 });
  }

  const txRef = event.data?.tx_ref;
  if (txRef && (event.event === "charge.completed" || event.data?.status === "successful")) {
    await fulfillSubscriptionByTxRef(txRef);
  }

  return new NextResponse(null, { status: 200 });
}
