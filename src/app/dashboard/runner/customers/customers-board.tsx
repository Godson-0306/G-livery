"use client";

import { Card, StatCard } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { fieldClass } from "@/components/ui/field";
import { buttonClass } from "@/components/ui/button";
import { formatNgn } from "@/lib/money";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { CustomerAvatar } from "./customer-avatar";
import { formatWhen, type CustomerRow } from "./customer-types";

type SortKey = "recent" | "orders" | "volume";

export function CustomersBoard({ customers }: { customers: CustomerRow[] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("recent");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const rows = needle
      ? customers.filter((customer) => {
          const hay = [
            customer.name,
            customer.email,
            customer.phone ?? "",
            customer.lastLocation,
            customer.lastCafeteria,
          ]
            .join(" ")
            .toLowerCase();
          return hay.includes(needle);
        })
      : [...customers];

    rows.sort((a, b) => {
      if (sort === "orders") return b.orders - a.orders;
      if (sort === "volume") return b.volume - a.volume;
      return new Date(b.lastOrderAt).getTime() - new Date(a.lastOrderAt).getTime();
    });
    return rows;
  }, [customers, query, sort]);

  const totals = useMemo(
    () => ({
      customers: customers.length,
      orders: customers.reduce((sum, row) => sum + row.orders, 0),
      delivered: customers.reduce((sum, row) => sum + row.delivered, 0),
      volume: customers.reduce((sum, row) => sum + row.volume, 0),
    }),
    [customers],
  );

  const resultLabel =
    filtered.length === customers.length
      ? `${customers.length} ${customers.length === 1 ? "student" : "students"}`
      : `${filtered.length} of ${customers.length}`;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-1 rounded-[1.4rem] border border-line bg-card px-2 py-3 text-center md:hidden">
        <MiniStat label="People" value={totals.customers} />
        <MiniStat label="Orders" value={totals.orders} />
        <MiniStat label="Done" value={totals.delivered} />
        <MiniStat label="Volume" value={formatNgn(totals.volume)} />
      </div>
      <div className="hidden grid-cols-2 gap-3 md:grid lg:grid-cols-4">
        <StatCard label="Customers" value={totals.customers} />
        <StatCard label="Orders" value={totals.orders} />
        <StatCard label="Delivered" value={totals.delivered} />
        <StatCard label="Volume" value={formatNgn(totals.volume)} />
      </div>

      <div className="sticky top-[4.5rem] z-20 -mx-4 space-y-2.5 border-b border-line/80 bg-background/95 px-4 py-3 backdrop-blur md:static md:z-auto md:mx-0 md:rounded-[1.4rem] md:border md:border-line md:bg-card md:px-5 md:py-4 md:backdrop-blur-none">
        <div className="md:flex md:items-center md:gap-3">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, phone, hostel…"
            aria-label="Search customers"
            className={fieldClass("mt-0 md:flex-1")}
          />
          {!query.trim() ? (
            <p className="hidden shrink-0 text-xs font-medium text-muted md:block">{resultLabel}</p>
          ) : null}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-0.5">
          {(
            [
              ["recent", "Recent"],
              ["orders", "Most orders"],
              ["volume", "Highest volume"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setSort(key)}
              className={cn(
                "h-10 shrink-0 rounded-full px-4 text-sm font-semibold",
                sort === key
                  ? "bg-forest text-white"
                  : "border border-line bg-card text-forest md:bg-background",
              )}
            >
              {label}
            </button>
          ))}
        </div>
        {query.trim() ? <p className="text-xs font-medium text-muted">{resultLabel}</p> : null}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No match"
          body="Try another name, phone, or hostel. Your full list is still here."
        />
      ) : (
        <>
          <ul className="space-y-3 md:hidden">
            {filtered.map((customer) => (
              <li key={customer.id}>
                <CustomerCard customer={customer} />
              </li>
            ))}
          </ul>
          <div className="hidden overflow-hidden rounded-[1.4rem] border border-line bg-card md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[44rem] text-left text-sm">
                <thead className="bg-forest-soft/70 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                  <tr>
                    <th className="px-5 py-3">Customer</th>
                    <th className="px-5 py-3">Contact</th>
                    <th className="px-5 py-3">Orders</th>
                    <th className="px-5 py-3">Volume</th>
                    <th className="px-5 py-3">Last job</th>
                    <th className="px-5 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {filtered.map((customer) => (
                    <tr key={customer.id} className="align-top transition hover:bg-forest-soft/40">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <CustomerAvatar name={customer.name} size="sm" />
                          <div className="min-w-0">
                            <Link
                              href={`/dashboard/runner/customers/${customer.id}`}
                              className="font-semibold text-forest hover:underline"
                            >
                              {customer.name}
                            </Link>
                            <p className="truncate text-xs text-muted">{customer.lastLocation}</p>
                            {customer.active > 0 ? (
                              <p className="mt-1 inline-flex rounded-full bg-amber/20 px-2 py-0.5 text-[11px] font-semibold text-stone-900">
                                {customer.active} open
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-muted">
                        <p className="tabular-nums">{customer.phone ?? "No phone"}</p>
                        <p className="truncate text-xs">{customer.email}</p>
                      </td>
                      <td className="px-5 py-4 tabular-nums">
                        {customer.orders}
                        <span className="block text-xs text-muted">{customer.delivered} delivered</span>
                      </td>
                      <td className="px-5 py-4 font-semibold tabular-nums text-forest">
                        {formatNgn(customer.volume)}
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-forest">{customer.lastCafeteria}</p>
                        <p className="text-xs text-muted">{formatWhen(customer.lastOrderAt)}</p>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {customer.phone ? (
                            <a
                              href={`tel:${customer.phone}`}
                              className={buttonClass("secondary", "h-10 px-3")}
                            >
                              Call
                            </a>
                          ) : null}
                          <Link
                            href={`/dashboard/runner/customers/${customer.id}`}
                            className={buttonClass("primary", "h-10 px-3")}
                          >
                            Open
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">{label}</p>
      <p className="mt-0.5 truncate text-sm font-semibold tabular-nums text-forest">{value}</p>
    </div>
  );
}

function CustomerCard({ customer }: { customer: CustomerRow }) {
  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <CustomerAvatar name={customer.name} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate font-semibold text-forest">{customer.name}</p>
              <p className="mt-0.5 text-sm tabular-nums text-muted">
                {customer.phone ?? "No phone on file"}
              </p>
            </div>
            {customer.active > 0 ? (
              <span className="shrink-0 rounded-full bg-amber/20 px-2 py-0.5 text-[11px] font-semibold text-stone-900">
                {customer.active} open
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <dl className="mt-3 grid grid-cols-3 gap-2 rounded-2xl bg-forest-soft/60 px-3 py-2.5">
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">Orders</dt>
          <dd className="mt-0.5 text-base font-semibold tabular-nums text-forest">{customer.orders}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">Done</dt>
          <dd className="mt-0.5 text-base font-semibold tabular-nums text-forest">{customer.delivered}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">Volume</dt>
          <dd className="mt-0.5 truncate text-base font-semibold tabular-nums text-forest">
            {formatNgn(customer.volume)}
          </dd>
        </div>
      </dl>

      <p className="mt-3 text-sm text-muted">
        Last: {customer.lastCafeteria} · {formatWhen(customer.lastOrderAt)}
      </p>
      <p className="mt-0.5 truncate text-sm text-forest">{customer.lastLocation}</p>

      <div
        className={cn(
          "mt-3 grid scroll-mb-24 gap-2",
          customer.phone ? "grid-cols-2" : "grid-cols-1",
        )}
      >
        {customer.phone ? (
          <a href={`tel:${customer.phone}`} className={buttonClass("amber", "h-11 w-full")}>
            Call
          </a>
        ) : null}
        <Link
          href={`/dashboard/runner/customers/${customer.id}`}
          className={buttonClass("primary", "h-11 w-full")}
        >
          View jobs
        </Link>
      </div>
    </Card>
  );
}
