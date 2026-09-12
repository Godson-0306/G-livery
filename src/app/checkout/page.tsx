import { SiteHeader } from "@/components/site-header";
import { CheckoutClient } from "./checkout-client";

export default function CheckoutPage() {
  return (
    <div className="min-h-full">
      <SiteHeader />
      <CheckoutClient />
    </div>
  );
}
