import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";

export type ChatMessageView = {
  id: string;
  body: string;
  senderId: string;
  senderName: string;
  createdAt: string;
};

export type OrderChatAccess = {
  orderId: string;
  canSend: boolean;
  waitingForAgent: boolean;
  cancelled: boolean;
  peerName: string | null;
  recipientUserId: string | null;
  cafeteriaName: string;
  currentUserId: string;
};

export async function getOrderChatAccess(
  orderId: string,
  userId: string,
  role: Role,
): Promise<OrderChatAccess | null> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      cafeteria: { select: { name: true } },
      student: { select: { id: true, name: true } },
      runner: { include: { user: { select: { id: true, name: true } } } },
    },
  });
  if (!order) return null;

  const isStudent = role === "student" && order.studentId === userId;
  const isAgent = role === "runner" && order.runner?.userId === userId;
  if (!isStudent && !isAgent) return null;

  const cancelled = order.status === "cancelled";
  const accepted = Boolean(order.runnerId) && order.status !== "placed";

  return {
    orderId: order.id,
    canSend: accepted && !cancelled,
    waitingForAgent: !accepted && !cancelled,
    cancelled,
    peerName: isStudent ? (order.runner?.user.name ?? null) : order.student.name,
    recipientUserId: isStudent ? (order.runner?.userId ?? null) : order.studentId,
    cafeteriaName: order.cafeteria.name,
    currentUserId: userId,
  };
}

export function serializeMessage(row: {
  id: string;
  body: string;
  senderId: string;
  createdAt: Date;
  sender: { name: string };
}): ChatMessageView {
  return {
    id: row.id,
    body: row.body,
    senderId: row.senderId,
    senderName: row.sender.name,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listOrderMessages(orderId: string, afterId?: string | null, take = 80) {
  let afterCreatedAt: Date | undefined;
  if (afterId) {
    const cursor = await prisma.orderMessage.findFirst({
      where: { id: afterId, orderId },
      select: { createdAt: true },
    });
    afterCreatedAt = cursor?.createdAt;
  }

  const rows = await prisma.orderMessage.findMany({
    where: {
      orderId,
      ...(afterCreatedAt ? { createdAt: { gt: afterCreatedAt } } : {}),
    },
    include: { sender: { select: { name: true } } },
    orderBy: { createdAt: afterCreatedAt ? "asc" : "desc" },
    take,
  });

  const chronological = afterCreatedAt ? rows : [...rows].reverse();
  return chronological.map(serializeMessage);
}
