"use server";

import { requireSession } from "@/lib/auth-guards";
import { notify } from "@/lib/notifications";
import { getOrderChatAccess, serializeMessage } from "@/lib/order-chat";
import { prisma } from "@/lib/prisma";

const MAX_BODY = 500;

export async function sendOrderMessageAction(orderId: string, rawBody: string) {
  const session = await requireSession();
  const access = await getOrderChatAccess(orderId, session.user.id, session.user.role);
  if (!access) return { error: "Chat not found." };
  if (!access.canSend) {
    return { error: access.cancelled ? "This order was cancelled." : "Chat opens after an agent accepts." };
  }

  const body = rawBody.trim();
  if (!body) return { error: "Type a message." };
  if (body.length > MAX_BODY) return { error: `Keep it under ${MAX_BODY} characters.` };

  const row = await prisma.orderMessage.create({
    data: {
      orderId,
      senderId: session.user.id,
      body,
    },
    include: { sender: { select: { name: true } } },
  });

  if (access.recipientUserId) {
    const link =
      session.user.role === "student"
        ? `/dashboard/runner/orders/${orderId}`
        : `/dashboard/student/orders/${orderId}`;
    const existing = await prisma.notification.findFirst({
      where: {
        userId: access.recipientUserId,
        link,
        readAt: null,
        title: "New message",
      },
    });
    if (!existing) {
      await notify({
        userId: access.recipientUserId,
        title: "New message",
        body: `New message on ${access.cafeteriaName}.`,
        link,
      });
    }
  }

  return { message: serializeMessage(row) };
}
