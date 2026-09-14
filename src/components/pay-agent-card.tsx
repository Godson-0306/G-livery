"use client";

import { hasPayoutDetails } from "@/lib/payout";
import { buttonClass } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatNgn } from "@/lib/money";
import { useState } from "react";

export function PayAgentCard({
  agentName,
  bankName,
  accountName,
  accountNumber,
  amount,
}: {
  agentName: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  amount?: number;
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
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber">Pay this Agent</p>
        <h2 className="mt-1 text-lg font-semibold text-forest">{agentName}</h2>
        <p className="mt-1 text-sm text-muted">
          {amount != null ? `${formatNgn(amount)} food total. ` : ""}
          This Agent has not added transfer details yet. Pay them once they share an account.
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
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber">Pay this Agent</p>
      <h2 className="mt-1 text-lg font-semibold text-forest">{agentName}</h2>
      {amount != null ? (
        <p className="mt-1 text-lg font-semibold text-forest">{formatNgn(amount)}</p>
      ) : null}
      <p className="mt-1 text-sm text-muted">
        Transfer the food total to this Agent. They pay the cafeteria when they pick up.
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
