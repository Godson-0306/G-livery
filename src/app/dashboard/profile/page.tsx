import { requireSession } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { ProfileForm } from "./profile-form";
import { notFound } from "next/navigation";

export default async function ProfilePage() {
  const session = await requireSession();
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) notFound();
  const initial = user.name.trim().slice(0, 1).toUpperCase() || "?";

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div className="flex items-start gap-4">
        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-forest text-2xl font-semibold text-white"
          aria-hidden
        >
          {initial}
        </div>
        <PageHeader
          eyebrow="Account"
          title="Profile"
          subtitle="Update how you show up across G-Livery. Email stays tied to how you sign in."
        />
      </div>
      <ProfileForm
        name={user.name}
        phone={user.phone ?? ""}
        email={user.email}
        role={user.role}
        hasPassword={Boolean(user.passwordHash)}
      />
    </div>
  );
}
