import { prisma } from "@/lib/prisma";

export async function notify(input: {
  userId: string;
  title: string;
  body: string;
  link?: string;
}) {
  return prisma.notification.create({ data: input });
}

export async function unreadCount(userId: string) {
  return prisma.notification.count({
    where: { userId, readAt: null },
  });
}
