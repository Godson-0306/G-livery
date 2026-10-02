import { auth } from "@/auth";
import { getOrderChatAccess, listOrderMessages } from "@/lib/order-chat";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const access = await getOrderChatAccess(id, session.user.id, session.user.role);
  if (!access) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const url = new URL(request.url);
  const after = url.searchParams.get("after");
  const messages = await listOrderMessages(id, after);

  return NextResponse.json({
    messages,
    canSend: access.canSend,
    waitingForAgent: access.waitingForAgent,
    cancelled: access.cancelled,
    peerName: access.peerName,
  });
}
