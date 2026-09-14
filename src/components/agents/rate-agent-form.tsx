"use client";

import { rateAgentAction } from "@/actions/orders";
import { StarGlyphs } from "@/components/agents/agent-rating";
import { useActionState } from "react";

export function RateAgentForm({
  orderId,
  agentName,
  existingStars,
}: {
  orderId: string;
  agentName: string;
  existingStars: number | null;
}) {
  const [state, formAction, pending] = useActionState(rateAgentAction, undefined);

  if (existingStars != null) {
    return (
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber">Your rating</p>
        <h2 className="mt-1 text-lg font-semibold text-forest">Thanks for rating {agentName}</h2>
        <p className="mt-2 flex items-center gap-2 text-sm text-muted">
          <StarGlyphs value={existingStars} className="text-lg" />
          {existingStars} out of 5
        </p>
      </div>
    );
  }

  return (
    <form action={formAction}>
      <input type="hidden" name="orderId" value={orderId} />
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber">Rate this Agent</p>
      <h2 className="mt-1 text-lg font-semibold text-forest">How was {agentName}?</h2>
      <p className="mt-1 text-sm text-muted">Tap 1 to 5 stars. You can only do this once.</p>
      <div className="mt-3 flex gap-2">
        {[1, 2, 3, 4, 5].map((stars) => (
          <button
            key={stars}
            type="submit"
            name="stars"
            value={stars}
            disabled={pending || Boolean(state?.success)}
            aria-label={`${stars} star${stars === 1 ? "" : "s"}`}
            className="flex h-11 w-11 flex-col items-center justify-center rounded-full border border-forest/20 bg-card text-amber hover:bg-forest-soft disabled:opacity-60"
          >
            <span className="text-lg leading-none">★</span>
            <span className="text-[10px] font-semibold text-forest">{stars}</span>
          </button>
        ))}
      </div>
      {pending ? <p className="mt-2 text-sm text-muted">Saving…</p> : null}
      {state?.error ? <p className="mt-2 text-sm text-rose-700">{state.error}</p> : null}
      {state?.success ? <p className="mt-2 text-sm text-forest">{state.success}</p> : null}
    </form>
  );
}
