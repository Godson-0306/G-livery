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
      <main className="page-wrap flex flex-1 flex-col gap-10 py-10">
        <section className="overflow-hidden rounded-[2rem] bg-forest px-6 py-12 text-white shadow-sm sm:px-12 sm:py-16">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber">G-Livery</p>
          <h1 className="mt-3 max-w-xl text-4xl font-semibold leading-[1.1] tracking-tight sm:text-6xl">
            {TAGLINE}.
          </h1>
          <p className="mt-4 max-w-lg text-base font-bold text-white sm:text-lg">
            Your favourite campus meals, delivered straight to you.
          </p>
          <p className="mt-3 max-w-lg text-base text-emerald-100 sm:text-lg">
            Order from your favourite cafeterias, stay where you are, and let a G-Livery Agent handle
            the delivery.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/cafeterias" className={buttonClass("amber", "h-11 px-5")}>
              Browse menus
            </Link>
            <Link href="/signup/student" className={buttonClass("secondary", "h-11 px-5")}>
              Create a student account
            </Link>
          </div>
          <dl className="mt-10 grid max-w-xl grid-cols-3 gap-4 text-sm">
            <div>
              <dt className="text-emerald-200">Cafeteria</dt>
              <dd className="text-2xl font-semibold sm:text-3xl">{cafeterias}</dd>
            </div>
            <div>
              <dt className="text-emerald-200">Agents on</dt>
              <dd className="text-2xl font-semibold sm:text-3xl">{runners}</dd>
            </div>
            <div>
              <dt className="text-emerald-200">Delivered</dt>
              <dd className="text-2xl font-semibold sm:text-3xl">{delivered}</dd>
            </div>
          </dl>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-forest">Order in 3 taps</h2>
          <ol className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              { step: "1", title: "Pick a cafeteria", body: "Open a live e-menu and see what’s actually available." },
              { step: "2", title: "Add your food", body: "Tap items into a bag that already feels like checkout." },
              { step: "3", title: "Complete Your Order", body: "Place the order, pay the Agent, and track every step." },
            ].map((item) => (
              <li key={item.step}>
                <Card>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber">
                    Tap {item.step}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-forest">{item.title}</h3>
                  <p className="mt-1 text-sm text-muted">{item.body}</p>
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
                <h2 className="font-semibold text-forest">{card.title}</h2>
                <p className="mt-2 flex-1 text-sm text-muted">{card.body}</p>
                <Link href={card.href} className="mt-4 text-sm font-semibold text-forest">
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
