"use server";

import { requireSession } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function revalidateAlerts() {
  revalidatePath("/dashboard", "layout");
  revalidatePath("/dashboard/notifications");
}

export async function markNotificationsReadAction() {
  const session = await requireSession();
  await prisma.notification.updateMany({
    where: { userId: session.user.id, readAt: null },
    data: { readAt: new Date() },
  });
  revalidateAlerts();
}

export async function openNotificationAction(formData: FormData) {
  const session = await requireSession();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const item = await prisma.notification.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!item) return;

  if (!item.readAt) {
    await prisma.notification.update({
      where: { id: item.id },
      data: { readAt: new Date() },
    });
  }

  revalidateAlerts();
  if (item.link) redirect(item.link);
}
