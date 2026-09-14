import { SiteHeader } from "@/components/site-header";
import { listLiveAgents } from "@/lib/agents";
import { CheckoutClient } from "./checkout-client";

export default async function CheckoutPage() {
  const agents = await listLiveAgents();
  return (
    <div className="min-h-full">
      <SiteHeader />
      <CheckoutClient agents={agents} />
    </div>
  );
}
