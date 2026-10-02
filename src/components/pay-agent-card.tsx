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
      <Card className="bg-forest-soft/50">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber">Pay this Agent</p>
        <h2 className="mt-1 font-display text-xl font-medium text-heading">{agentName}</h2>
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
  const allDetails = `${bankName}\n${accountName}\n${accountNumber}${amount != null ? `\n${formatNgn(amount)}` : ""}`;

  return (
    <Card className="border-amber/20 bg-forest-soft/40">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber">Pay this Agent</p>
      <h2 className="mt-1 font-display text-xl font-medium text-heading">{agentName}</h2>
      {amount != null ? (
        <p className="mt-2 font-sans text-3xl font-semibold tabular-nums tracking-tight text-heading">
          {formatNgn(amount)}
        </p>
      ) : null}
      <p className="mt-1 text-sm text-muted">
        Transfer the food total now. They pay the cafeteria when they collect.
      </p>
      <ul className="mt-4 space-y-2">
        {rows.map((row) => (
          <li
            key={row.label}
            className="flex items-center justify-between gap-3 rounded-2xl bg-card px-3 py-3"
          >
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wide text-muted">{row.label}</p>
              <p className="truncate font-semibold tabular-nums text-forest">{row.value}</p>
            </div>
            <button
              type="button"
              className={buttonClass("secondary", "h-10 shrink-0 px-3")}
              onClick={() => copy(row.label, row.value)}
            >
              {copied === row.label ? "Copied" : "Copy"}
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className={buttonClass("amber", "mt-3 h-11 w-full")}
        onClick={() => copy("all", allDetails)}
      >
        {copied === "all" ? "Copied all details" : "Copy all details"}
      </button>
    </Card>
  );
}
