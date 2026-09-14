"use server";

import { auth } from "@/auth";
import { requireRole, requireSession } from "@/lib/auth-guards";
import { notify } from "@/lib/notifications";
import { canTransition } from "@/lib/order-transitions";
import { prisma } from "@/lib/prisma";
import { isRunnerLive, syncRunnerSubscription } from "@/lib/subscription";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ActionState } from "@/actions/auth";
import { Prisma, type OrderStatus, type Role } from "@prisma/client";

type CartPayload = {
  cafeteriaId: string;
  runnerSlug?: string | null;
  deliveryLocation: string;
  notes?: string;
  items: Array<{ menuItemId: string; quantity: number }>;
};

export async function placeOrderAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireSession();
  if (session.user.role !== "student") {
    return { error: "Only student accounts can place food orders." };
  }

  const deliveryLocation = String(formData.get("deliveryLocation") ?? "").trim();
  let payload: CartPayload;
  try {
    payload = JSON.parse(String(formData.get("payload") ?? "{}")) as CartPayload;
  } catch {
    return { error: "Your cart could not be read. Try adding items again." };
  }
  payload.deliveryLocation = deliveryLocation;
  payload.notes = String(formData.get("notes") ?? "");

  if (!deliveryLocation) return { error: "Add a delivery location on campus." };
  if (!payload.items?.length) return { error: "Your cart is empty." };

  const cafeteria = await prisma.cafeteria.findUnique({
    where: { id: payload.cafeteriaId },
  });
  if (!cafeteria?.isActive) return { error: "That cafeteria is not taking orders." };

  const menuItems = await prisma.menuItem.findMany({
    where: {
      id: { in: payload.items.map((item) => item.menuItemId) },
      cafeteriaId: cafeteria.id,
    },
  });
  const byId = new Map(menuItems.map((item) => [item.id, item]));

  const lines: Array<{ menuItemId: string; quantity: number; priceAtOrder: (typeof menuItems)[number]["price"] }> =
    [];
  for (const item of payload.items) {
    const menu = byId.get(item.menuItemId);
    if (!menu || !menu.isAvailable || item.quantity < 1) {
      return { error: "One or more items are unavailable. Refresh the menu and try again." };
    }
    lines.push({
      menuItemId: menu.id,
      quantity: item.quantity,
      priceAtOrder: menu.price,
    });
  }

  const totalAmount = lines.reduce(
    (sum, line) => sum + Number(line.priceAtOrder) * line.quantity,
    0,
  );

  let runnerId: string | null = null;
  if (payload.runnerSlug) {
    const runner = await prisma.runner.findUnique({
      where: { personalSlug: payload.runnerSlug },
      include: { user: true },
    });
    if (runner && !runner.user.isDisabled) {
      await syncRunnerSubscription(runner.id);
      runnerId = runner.id;
    }
  }

  let createdId = "";
  try {
    const order = await prisma.order.create({
      data: {
        studentId: session.user.id,
        cafeteriaId: cafeteria.id,
        runnerId,
        status: "placed",
        totalAmount,
        deliveryLocation,
        notes: payload.notes?.trim() || null,
        items: { create: lines },
      },
    });
    createdId = order.id;
  } catch (error) {
    console.error("placeOrderAction failed", error);
    return { error: "Could not place that order. Refresh the menu and try again." };
  }

  await notify({
    userId: cafeteria.ownerId,
    title: "New order",
    body: `Order from ${session.user.name ?? "a student"} — ₦${totalAmount.toLocaleString()}`,
    link: `/dashboard/cafeteria/orders/${createdId}`,
  });

  if (runnerId) {
    const runner = await prisma.runner.findUnique({ where: { id: runnerId } });
    if (runner) {
      await notify({
        userId: runner.userId,
        title: "Order via your link",
        body: `A student ordered from ${cafeteria.name} through your G-Livery link.`,
        link: `/dashboard/runner/orders/${createdId}`,
      });
    }
  }

  revalidatePath("/dashboard/student");
  redirect(`/dashboard/student/orders/${createdId}`);
}

async function loadActorOrder(orderId: string, role: Role, userId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      cafeteria: true,
      runner: true,
    },
  });
  if (!order) return null;

  if (role === "student" && order.studentId !== userId) return null;
  if (role === "cafeteria" && order.cafeteria.ownerId !== userId) return null;
  if (role === "runner") {
    const runner = await prisma.runner.findUnique({ where: { userId } });
    if (!runner) return null;
    if (order.runnerId && order.runnerId !== runner.id) return null;
  }
  return order;
}

export async function updateOrderStatusAction(orderId: string, nextStatus: OrderStatus) {
  const session = await requireSession();
  const order = await loadActorOrder(orderId, session.user.role, session.user.id);
  if (!order) return { error: "Order not found." };

  if (!canTransition(session.user.role, order.status, nextStatus)) {
    return { error: "That status change is not allowed." };
  }

  if (session.user.role === "runner") {
    const runner = await prisma.runner.findUnique({ where: { userId: session.user.id } });
    if (!runner) return { error: "Delivery agent profile missing." };
    await syncRunnerSubscription(runner.id);
    const live = await prisma.runner.findUnique({ where: { id: runner.id } });
    if (!live || !isRunnerLive(live)) {
      return { error: "Your subscription must be active to manage orders." };
    }
    if (nextStatus === "accepted") {
      if (order.status !== "placed") return { error: "Order is no longer available." };
      if (order.runnerId && order.runnerId !== runner.id) {
        return { error: "Another agent already has this order." };
      }
      const updated = await prisma.order.updateMany({
        where: {
          id: orderId,
          status: "placed",
          OR: [{ runnerId: null }, { runnerId: runner.id }],
        },
        data: { status: "accepted", runnerId: runner.id },
      });
      if (updated.count === 0) return { error: "Someone else accepted this order." };
    } else {
      if (order.runnerId !== runner.id) return { error: "This is not your order." };
      await prisma.order.update({
        where: { id: orderId },
        data: { status: nextStatus },
      });
    }
  } else {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: nextStatus },
    });
  }

  const studentMessage: Partial<Record<OrderStatus, string>> = {
    accepted: "A delivery agent accepted your order.",
    preparing: `${order.cafeteria.name} is preparing your food.`,
    ready: "Your order is packed.",
    picked_up: "Your delivery agent is on the way.",
    delivered: "Your order has been delivered.",
    cancelled: "Your order was cancelled.",
  };

  if (studentMessage[nextStatus]) {
    await notify({
      userId: order.studentId,
      title: "Order update",
      body: studentMessage[nextStatus]!,
      link: `/dashboard/student/orders/${orderId}`,
    });
  }

  revalidatePath("/dashboard/student");
  revalidatePath("/dashboard/cafeteria");
  revalidatePath("/dashboard/runner");
  revalidatePath("/dashboard/admin");
  return { success: "Status updated." };
}

export async function declineOrderAction(orderId: string) {
  const session = await requireRole("runner");
  const runner = await prisma.runner.findUnique({ where: { userId: session.user.id } });
  if (!runner) return { error: "Delivery agent profile missing." };

  const updated = await prisma.order.updateMany({
    where: { id: orderId, status: "placed", runnerId: runner.id },
    data: { runnerId: null },
  });
  if (updated.count === 0) return { error: "This order cannot be declined." };

  revalidatePath("/dashboard/runner");
  return { success: "Order released to the general pool." };
}

export async function cancelMyOrderAction(orderId: string) {
  const session = await requireRole("student");
  const updated = await prisma.order.updateMany({
    where: { id: orderId, studentId: session.user.id, status: "placed" },
    data: { status: "cancelled" },
  });
  if (updated.count === 0) {
    return { error: "Only unaccepted orders can be cancelled." };
  }
  revalidatePath("/dashboard/student");
  return { success: "Order cancelled." };
}

export async function adminSetOrderStatusAction(orderId: string, status: OrderStatus) {
  await requireRole("admin");
  await prisma.order.update({ where: { id: orderId }, data: { status } });
  revalidatePath("/dashboard/admin/orders");
}

export async function rateAgentAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireRole("student");
  const orderId = String(formData.get("orderId") ?? "");
  const stars = Number(formData.get("stars"));
  if (!orderId) return { error: "Order not found." };
  if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
    return { error: "Pick 1 to 5 stars." };
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { runner: true, rating: true },
  });
  if (!order || order.studentId !== session.user.id) return { error: "Order not found." };
  if (order.status !== "delivered") return { error: "Rate this Agent after delivery." };
  if (!order.runnerId || !order.runner) return { error: "No Agent on this order." };
  if (order.rating) return { error: "You already rated this order." };

  try {
    await prisma.runnerRating.create({
      data: {
        orderId: order.id,
        studentId: session.user.id,
        runnerId: order.runnerId,
        stars,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "You already rated this order." };
    }
    console.error("rateAgentAction failed", error);
    return { error: "Could not save that rating. Try again." };
  }

  revalidatePath(`/dashboard/student/orders/${order.id}`);
  revalidatePath("/dashboard/student");
  revalidatePath("/agents");
  revalidatePath("/checkout");
  revalidatePath(`/r/${order.runner.personalSlug}`);
  return { success: "Thanks for rating this Agent." };
}

export async function getSessionUser() {
  return auth();
}
