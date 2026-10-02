import { requireRole } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { appUrl } from "@/lib/utils";
import { buttonClass } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import Link from "next/link";

export default async function CafeteriaQrPage() {
  const session = await requireRole("cafeteria");
  const cafeteria = await prisma.cafeteria.findFirst({ where: { ownerId: session.user.id } });
  if (!cafeteria) return <p>No cafeteria linked.</p>;

  const url = appUrl(`/cafeteria/${cafeteria.slug}`);

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Kitchen"
        title="QR e-menu"
        subtitle="Print this for the counter. Students open the live public menu — no login required to view."
      />
      <Card>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/api/cafeteria/${cafeteria.slug}/qr`}
          alt="Cafeteria menu QR code"
          className="h-64 w-64 rounded-2xl border border-line bg-white p-3"
        />
        <p className="mt-4 text-sm">
          Link:{" "}
          <Link href={`/cafeteria/${cafeteria.slug}`} className="font-medium text-forest">
            {url}
          </Link>
        </p>
        <a href={`/api/cafeteria/${cafeteria.slug}/qr`} download className={buttonClass("secondary", "mt-4")}>
          Download PNG
        </a>
      </Card>
    </div>
  );
}
