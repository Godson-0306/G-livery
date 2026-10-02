import { auth } from "@/auth";
import { unreadCount } from "@/lib/notifications";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const count = await unreadCount(session.user.id);
  return NextResponse.json({ count });
}
