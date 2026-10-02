import { SiteHeader } from "@/components/site-header";
import { TAGLINE } from "@/components/brand";
import { buttonClass } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function HomePage() {
  const [cafeterias, runners, delivered] = await Promise.all([
    prisma.cafeteria.count({ where: { isActive: true } }),
    prisma.runner.count({ where: { subscriptionStatus: "active" } }),
    prisma.order.count({ where: { status: "delivered" } }),
  ]);

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <main className="page-wrap flex flex-1 flex-col gap-14 py-12">
        <section className="overflow-hidden rounded-[1.75rem] border border-amber/20 bg-gradient-to-br from-[#0c1210] via-[#13201a] to-[#1b5e3b]/40 px-6 py-14 text-[#f3eee4] sm:px-12 sm:py-20">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-amber">G-Livery</p>
          <h1 className="mt-4 max-w-xl font-display text-5xl font-medium leading-[1.05] tracking-tight sm:text-7xl">
            {TAGLINE}.
          </h1>
          <div className="mt-6 h-px w-24 bg-amber/70" />
          <p className="mt-6 max-w-lg text-base text-[#f3eee4]/90 sm:text-lg">
            Your favourite campus meals, delivered straight to you.
          </p>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-[#f3eee4]/65 sm:text-base">
            Order from your favourite cafeterias, stay where you are, and let a G-Livery Agent handle
            the delivery.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/cafeterias" className={buttonClass("amber", "h-11 px-5")}>
              Browse menus
            </Link>
            <Link
              href="/signup/student"
              className={buttonClass("ghost", "h-11 border border-white/20 px-5 text-[#f3eee4] hover:bg-white/10")}
            >
              Create a student account
            </Link>
          </div>
          <dl className="mt-12 grid max-w-xl grid-cols-3 gap-4 text-sm">
            <div>
              <dt className="text-[11px] uppercase tracking-[0.16em] text-amber/80">Cafeteria</dt>
              <dd className="mt-1 font-display text-3xl font-medium sm:text-4xl">{cafeterias}</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-[0.16em] text-amber/80">Agents on</dt>
              <dd className="mt-1 font-display text-3xl font-medium sm:text-4xl">{runners}</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-[0.16em] text-amber/80">Delivered</dt>
              <dd className="mt-1 font-display text-3xl font-medium sm:text-4xl">{delivered}</dd>
            </div>
          </dl>
        </section>

        <section>
          <h2 className="font-display text-2xl font-medium text-heading">Order in 3 taps</h2>
          <ol className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              { step: "1", title: "Pick a cafeteria", body: "Open a live e-menu and see what’s actually available." },
              { step: "2", title: "Add your food", body: "Tap items into a bag that already feels like checkout." },
              { step: "3", title: "Complete Your Order", body: "Place the order, pay the Agent, and track every step." },
            ].map((item) => (
              <li key={item.step}>
                <Card>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber">
                    Tap {item.step}
                  </p>
                  <h3 className="mt-3 font-display text-xl font-medium text-heading">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
                </Card>
              </li>
            ))}
          </ol>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          {[
            {
              title: "Students",
              body: "Browse, order, and transfer the food total to the delivery agent.",
              href: "/signup/student",
              cta: "Sign up to order",
            },
            {
              title: "Delivery agents",
              body: "Share your link, take pool jobs, and show students where to transfer you.",
              href: "/signup/runner",
              cta: "Become an agent",
            },
            {
              title: "Cafeterias",
              body: "Run your menu, mark sold out, and print an E-menu QR code. Accounts are admin-created.",
              href: "/login",
              cta: "Cafeteria login",
            },
          ].map((card) => (
            <article key={card.title}>
              <Card className="flex h-full flex-col">
                <h2 className="font-display text-xl font-medium text-heading">{card.title}</h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{card.body}</p>
                <Link href={card.href} className="mt-5 text-sm font-semibold text-forest">
                  {card.cta} →
                </Link>
              </Card>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
