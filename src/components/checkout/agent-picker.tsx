"use client";

import { AgentRatingLine } from "@/components/agents/agent-rating";
import { useCart } from "@/components/cart/cart-provider";
import type { AgentBoardRow } from "@/lib/agents";
import { cn } from "@/lib/utils";

export function AgentPicker({ agents }: { agents: AgentBoardRow[] }) {
  const { cart, setRunnerSlug } = useCart();
  const selectedSlug = cart?.runnerSlug ?? null;
  const listed = selectedSlug ? agents.some((agent) => agent.slug === selectedSlug) : true;

  return (
    <fieldset className="mt-6">
      <legend className="text-sm font-semibold text-forest">Who should deliver?</legend>
      <p className="mt-1 text-sm text-muted">
        Pick a live Agent, or leave it open for whoever is available.
      </p>
      <ul className="mt-3 space-y-2">
        <li>
          <label
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-[1.2rem] border px-4 py-3",
              !selectedSlug ? "border-forest bg-forest-soft/80" : "border-line bg-card",
            )}
          >
            <input
              type="radio"
              name="agent"
              value="pool"
              className="mt-1"
              checked={!selectedSlug}
              onChange={() => setRunnerSlug(null)}
            />
            <span>
              <span className="block font-semibold text-forest">Any available Agent</span>
              <span className="mt-0.5 block text-sm text-muted">
                First live Agent who accepts this order
              </span>
            </span>
          </label>
        </li>
        {selectedSlug && !listed ? (
          <li>
            <label className="flex cursor-pointer items-start gap-3 rounded-[1.2rem] border border-forest bg-forest-soft/80 px-4 py-3">
              <input
                type="radio"
                name="agent"
                value={selectedSlug}
                className="mt-1"
                checked
                onChange={() => undefined}
              />
              <span>
                <span className="block font-semibold text-forest">/r/{selectedSlug}</span>
                <span className="mt-0.5 block text-sm text-muted">
                  Tagged from their personal link. They are not on the live list right now.
                </span>
              </span>
            </label>
          </li>
        ) : null}
        {agents.map((agent) => {
          const checked = selectedSlug === agent.slug;
          return (
            <li key={agent.id}>
              <label
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-[1.2rem] border px-4 py-3",
                  checked ? "border-forest bg-forest-soft/80" : "border-line bg-card",
                )}
              >
                <input
                  type="radio"
                  name="agent"
                  value={agent.slug}
                  className="mt-1"
                  checked={checked}
                  onChange={() => setRunnerSlug(agent.slug)}
                />
                <span className="min-w-0">
                  <span className="block font-semibold text-forest">{agent.name}</span>
                  <AgentRatingLine
                    averageStars={agent.averageStars}
                    ratingCount={agent.ratingCount}
                    className="mt-0.5 text-muted"
                  />
                  <span className="mt-0.5 block text-xs text-muted">
                    {agent.deliveredCount} {agent.deliveredCount === 1 ? "delivery" : "deliveries"}
                  </span>
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}
