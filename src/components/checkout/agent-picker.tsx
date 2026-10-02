"use client";

import { AgentRatingLine } from "@/components/agents/agent-rating";
import { QueueBadge } from "@/components/agents/queue-badge";
import { useCart } from "@/components/cart/cart-provider";
import { fieldClass } from "@/components/ui/field";
import type { AgentBoardRow } from "@/lib/agents";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";

export function AgentPicker({ agents }: { agents: AgentBoardRow[] }) {
  const { cart, setRunnerSlug } = useCart();
  const selectedSlug = cart?.runnerSlug ?? null;
  const [chooseOpen, setChooseOpen] = useState(Boolean(selectedSlug));
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (selectedSlug) setChooseOpen(true);
  }, [selectedSlug]);

  const listed = selectedSlug ? agents.some((agent) => agent.slug === selectedSlug) : true;
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return agents;
    return agents.filter((agent) => agent.name.toLowerCase().includes(needle));
  }, [agents, query]);

  const poolSelected = !selectedSlug && !chooseOpen;

  return (
    <fieldset>
      <legend className="text-sm font-semibold text-forest">Who should deliver?</legend>
      <p className="mt-1 text-sm text-muted">
        Leave it open for whoever is free, or choose an Agent yourself.
      </p>
      <ul className="mt-3 space-y-2">
        <li>
          <label
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-[1.2rem] border px-4 py-3",
              poolSelected ? "border-forest bg-forest-soft/80" : "border-line bg-card",
            )}
          >
            <input
              type="radio"
              name="agent-mode"
              value="pool"
              className="mt-1"
              checked={poolSelected}
              onChange={() => {
                setChooseOpen(false);
                setQuery("");
                setRunnerSlug(null);
              }}
            />
            <span>
              <span className="block font-semibold text-forest">Any available Agent</span>
              <span className="mt-0.5 block text-sm text-muted">
                First live Agent who accepts this order
              </span>
            </span>
          </label>
        </li>
        <li>
          <label
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-[1.2rem] border px-4 py-3",
              chooseOpen ? "border-forest bg-forest-soft/80" : "border-line bg-card",
            )}
          >
            <input
              type="radio"
              name="agent-mode"
              value="choose"
              className="mt-1"
              checked={chooseOpen}
              onChange={() => setChooseOpen(true)}
            />
            <span>
              <span className="block font-semibold text-forest">Choose agent</span>
              <span className="mt-0.5 block text-sm text-muted">
                {selectedSlug
                  ? `Selected: ${agents.find((agent) => agent.slug === selectedSlug)?.name ?? `/r/${selectedSlug}`}`
                  : "Open the live list and pick someone"}
              </span>
            </span>
          </label>
        </li>
      </ul>

      {chooseOpen ? (
        <div className="mt-3 rounded-[1.2rem] border border-line bg-card p-3">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search agents by name"
            aria-label="Search agents"
            className={fieldClass("mt-0")}
          />
          <ul className="mt-3 max-h-64 space-y-2 overflow-y-auto">
            {selectedSlug && !listed ? (
              <li>
                <label className="flex cursor-pointer items-start gap-3 rounded-[1.1rem] border border-forest bg-forest-soft/80 px-3 py-2.5">
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
            {filtered.length === 0 ? (
              <li className="px-1 py-3 text-sm text-muted">No Agents match that search.</li>
            ) : (
              filtered.map((agent) => {
                const checked = selectedSlug === agent.slug;
                return (
                  <li key={agent.id}>
                    <label
                      className={cn(
                        "flex cursor-pointer items-start gap-3 rounded-[1.1rem] border px-3 py-2.5",
                        checked ? "border-forest bg-forest-soft/80" : "border-line",
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
                        <QueueBadge count={agent.queueCount} className="mt-1" />
                      </span>
                    </label>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      ) : null}
    </fieldset>
  );
}
