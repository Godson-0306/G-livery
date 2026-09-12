"use server";

import { requireRole } from "@/lib/auth-guards";
import {
  initializeSubscriptionPayment,
  isFlutterwaveConfigured,
  verifyTransactionByRef,
} from "@/lib/flutterwave";
import { prisma } from "@/lib/prisma";
import { subscriptionAmount, subscriptionDays } from "@/lib/money";
import { parsePayoutDetails } from "@/lib/payout";
import { slugify } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ActionState } from "@/actions/auth";

export async function toggleAcceptingOrdersAction() {
  const session = await requireRole("runner");
  const runner = await prisma.runner.findUnique({ where: { userId: session.user.id } });
  if (!runner) return;
  await prisma.runner.update({
    where: { id: runner.id },
    data: { isAcceptingOrders: !runner.isAcceptingOrders },
  });
  revalidatePath("/dashboard/runner");
}

export async function updateRunnerSlugAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireRole("runner");
  const runner = await prisma.runner.findUnique({ where: { userId: session.user.id } });
  if (!runner) return { error: "Delivery agent profile missing." };

  const next = slugify(String(formData.get("personalSlug") ?? ""));
  if (next.length < 3) return { error: "Choose a slug with at least 3 letters or numbers." };

  const taken = await prisma.runner.findFirst({
    where: { personalSlug: next, NOT: { id: runner.id } },
  });
  if (taken) return { error: "That link is already taken." };

  await prisma.runner.update({
    where: { id: runner.id },
    data: { personalSlug: next },
  });
  revalidatePath("/dashboard/runner");
  return { success: "Your personal link was updated." };
}

export async function updateRunnerPayoutAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireRole("runner");
  const runner = await prisma.runner.findUnique({ where: { userId: session.user.id } });
  if (!runner) return { error: "Delivery agent profile missing." };

  const payout = parsePayoutDetails(formData);
  if ("error" in payout) return { error: payout.error };

  await prisma.$executeRaw`
    UPDATE "Runner"
    SET "bankName" = ${payout.bankName},
        "accountName" = ${payout.accountName},
        "accountNumber" = ${payout.accountNumber}
    WHERE id = ${runner.id}
  `;
  revalidatePath("/dashboard/runner");
  revalidatePath("/dashboard/admin/runners");
  return { success: "Payout account saved." };
}

export async function startSubscriptionPaymentAction(): Promise<ActionState> {
  const session = await requireRole("runner");
  const runner = await prisma.runner.findUnique({
    where: { userId: session.user.id },
    include: { user: true },
  });
  if (!runner) return { error: "Delivery agent profile missing." };

  if (!isFlutterwaveConfigured()) {
    return {
      error:
        "Flutterwave is not configured. Ask an admin to activate your subscription after off-platform payment.",
    };
  }

  const txRef = `sub_${runner.id}_${Date.now()}`;
  const amount = subscriptionAmount();
  const days = subscriptionDays();
  const startDate = new Date();
  const endDate = new Date(startDate.getTime() + days * 24 * 60 * 60 * 1000);

  await prisma.subscription.create({
    data: {
      runnerId: runner.id,
      startDate,
      endDate,
      amountPaid: amount,
      status: "pending",
      flutterwaveTxRef: txRef,
    },
  });

  const link = await initializeSubscriptionPayment({
    txRef,
    amount,
    email: runner.user.email,
    name: runner.user.name,
    phone: runner.user.phone,
    runnerId: runner.id,
  });

  redirect(link);
}

export async function fulfillSubscriptionByTxRef(txRef: string) {
  const existing = await prisma.subscription.findUnique({
    where: { flutterwaveTxRef: txRef },
    include: { runner: true },
  });
  if (!existing) return { error: "Unknown transaction." };
  if (existing.status === "paid") return { success: "Already activated." };

  const verified = await verifyTransactionByRef(txRef);
  if (!verified || verified.status !== "successful") {
    return { error: "Payment is not confirmed yet." };
  }

  const days = subscriptionDays();
  const startDate = new Date();
  const endDate = new Date(startDate.getTime() + days * 24 * 60 * 60 * 1000);

  await prisma.$transaction([
    prisma.subscription.update({
      where: { id: existing.id },
      data: {
        status: "paid",
        startDate,
        endDate,
        amountPaid: verified.amount,
      },
    }),
    prisma.runner.update({
      where: { id: existing.runnerId },
      data: {
        subscriptionStatus: "active",
        subscriptionExpiresAt: endDate,
      },
    }),
  ]);

  revalidatePath("/dashboard/runner");
  return { success: "Subscription activated." };
}
