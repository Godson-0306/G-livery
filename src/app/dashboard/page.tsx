import { requireSession } from "@/lib/auth-guards";
import { DASHBOARD_HOME } from "@/auth.config";
import { redirect } from "next/navigation";

export default async function DashboardIndex() {
  const session = await requireSession();
  redirect(DASHBOARD_HOME[session.user.role]);
}
