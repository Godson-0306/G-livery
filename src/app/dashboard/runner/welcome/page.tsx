import { requireRole } from "@/lib/auth-guards";
import { OpenWhatsAppGroup } from "@/components/agents/open-whatsapp-group";
import { buttonClass } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { AGENT_WHATSAPP_GROUP_URL } from "@/lib/agent-community";
import Link from "next/link";

export default async function RunnerWelcomePage() {
  await requireRole("runner");

  return (
    <div className="mx-auto max-w-lg space-y-5">
      <OpenWhatsAppGroup />
      <PageHeader
        eyebrow="Delivery agent"
        title="You’re in"
        subtitle="Join the Delivery Agents WhatsApp group so you don’t miss jobs, payouts, and campus updates."
      />
      <Card>
        <p className="text-sm text-muted">
          WhatsApp should open in a moment. If it doesn’t, tap the button below.
        </p>
        <a
          href={AGENT_WHATSAPP_GROUP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClass("amber", "mt-4 h-11 w-full")}
        >
          Join WhatsApp group
        </a>
        <Link href="/dashboard/runner" className={buttonClass("secondary", "mt-3 h-11 w-full")}>
          Continue to your desk
        </Link>
      </Card>
    </div>
  );
}
