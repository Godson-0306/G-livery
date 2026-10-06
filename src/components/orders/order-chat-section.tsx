import { OrderChat } from "@/components/orders/order-chat";
import { getOrderChatAccess, listOrderMessages } from "@/lib/order-chat";
import type { Role } from "@prisma/client";

export async function OrderChatSection({
  orderId,
  userId,
  role,
}: {
  orderId: string;
  userId: string;
  role: Role;
}) {
  const access = await getOrderChatAccess(orderId, userId, role);
  if (!access) return null;
  const messages = await listOrderMessages(orderId);

  return (
    <OrderChat
      orderId={orderId}
      currentUserId={userId}
      role={role}
      peerName={access.peerName}
      canSend={access.canSend}
      waitingForAgent={access.waitingForAgent}
      cancelled={access.cancelled}
      initialMessages={messages}
    />
  );
}
