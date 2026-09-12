"use client";

import { hasPayoutDetails } from "@/lib/payout";
import { buttonClass } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";

export function PayAgentCard({
  agentName,
  bankName,
  accountName,
  accountNumber,
}: {
  agentName: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
}) {
  const complete = hasPayoutDetails({ bankName, accountName, accountNumber });
  const [copied, setCopied] = useState<string | null>(null);

  async function copy(label: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      window.setTimeout(() => setCopied(null), 1600);
    } catch {
      setCopied(null);
    }
  }

  if (!complete) {
    return (
      <Card>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber">Pay your agent</p>
        <h2 className="mt-1 text-lg font-semibold text-forest">{agentName}</h2>
        <p className="mt-1 text-sm text-muted">
          This agent has not added transfer details yet. Pay them off-platform once they share an account.
        </p>
      </Card>
    );
  }

  const rows = [
    { label: "Bank", value: bankName },
    { label: "Account name", value: accountName },
    { label: "Account number", value: accountNumber },
  ];

  return (
    <Card>
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber">Pay your agent</p>
      <h2 className="mt-1 text-lg font-semibold text-forest">{agentName}</h2>
      <p className="mt-1 text-sm text-muted">
        Transfer off-platform (food still goes to the cafeteria). Copy the details below.
      </p>
      <ul className="mt-4 space-y-2">
        {rows.map((row) => (
          <li key={row.label} className="flex items-center justify-between gap-3 rounded-2xl bg-forest-soft/70 px-3 py-2.5">
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wide text-muted">{row.label}</p>
              <p className="truncate font-medium">{row.value}</p>
            </div>
            <button
              type="button"
              className={buttonClass("secondary", "h-8 px-3 text-xs")}
              onClick={() => copy(row.label, row.value)}
            >
              {copied === row.label ? "Copied" : "Copy"}
            </button>
          </li>
        ))}
      </ul>
    </Card>
  );
}
