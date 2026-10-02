"use client";

import { sendOrderMessageAction } from "@/actions/chat";
import { buttonClass } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { fieldClass } from "@/components/ui/field";
import type { ChatMessageView } from "@/lib/order-chat";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

export function OrderChat({
  orderId,
  currentUserId,
  peerName,
  canSend,
  waitingForAgent,
  cancelled,
  initialMessages,
}: {
  orderId: string;
  currentUserId: string;
  peerName: string | null;
  canSend: boolean;
  waitingForAgent: boolean;
  cancelled: boolean;
  initialMessages: ChatMessageView[];
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [sendable, setSendable] = useState(canSend);
  const [waiting, setWaiting] = useState(waitingForAgent);
  const [isCancelled, setIsCancelled] = useState(cancelled);
  const [open, setOpen] = useState(true);
  const bottomRef = useRef<HTMLLIElement>(null);
  const lastId = messages.at(-1)?.id;

  useEffect(() => {
    setSendable(canSend);
    setWaiting(waitingForAgent);
    setIsCancelled(cancelled);
  }, [canSend, waitingForAgent, cancelled]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  useEffect(() => {
    const tick = async () => {
      const query = lastId ? `?after=${encodeURIComponent(lastId)}` : "";
      try {
        const res = await fetch(`/api/orders/${orderId}/messages${query}`, { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as {
          messages?: ChatMessageView[];
          canSend?: boolean;
          waitingForAgent?: boolean;
          cancelled?: boolean;
        };
        if (typeof data.canSend === "boolean") setSendable(data.canSend);
        if (typeof data.waitingForAgent === "boolean") setWaiting(data.waitingForAgent);
        if (typeof data.cancelled === "boolean") setIsCancelled(data.cancelled);
        if (!data.messages?.length) return;
        setMessages((prev) => {
          const seen = new Set(prev.map((row) => row.id));
          const next = data.messages!.filter((row) => !seen.has(row.id));
          return next.length ? [...prev, ...next] : prev;
        });
      } catch {
        /* keep last view */
      }
    };
    const id = window.setInterval(tick, 2000);
    return () => window.clearInterval(id);
  }, [orderId, lastId]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!draft.trim() || pending) return;
    setPending(true);
    setError(null);
    const result = await sendOrderMessageAction(orderId, draft);
    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    if (result.message) {
      setMessages((prev) => (prev.some((row) => row.id === result.message!.id) ? prev : [...prev, result.message!]));
      setDraft("");
    }
  }

  return (
    <Card padded={false} className="overflow-hidden">
      <button
        type="button"
        className="flex w-full items-center justify-between px-5 py-3 text-left"
        onClick={() => setOpen((value) => !value)}
      >
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber">Live chat</p>
          <p className="mt-0.5 font-display text-lg font-medium text-heading">
            {peerName ? `Chat with ${peerName}` : "Order chat"}
          </p>
        </div>
        <span className="text-sm font-semibold text-forest">{open ? "Hide" : "Show"}</span>
      </button>
      {open ? (
        <div className="border-t border-line">
          <div className="flex h-[min(22rem,50vh)] flex-col">
            <ul className="flex-1 space-y-2 overflow-y-auto px-4 py-3">
              {waiting ? (
                <li className="rounded-2xl bg-forest-soft px-3 py-2 text-sm text-muted">
                  Chat opens after an agent accepts.
                </li>
              ) : null}
              {isCancelled ? (
                <li className="rounded-2xl bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:bg-rose-950/40 dark:text-rose-200">
                  This order was cancelled. Chat is read-only.
                </li>
              ) : null}
              {messages.length === 0 && sendable ? (
                <li className="text-sm text-muted">No messages yet. Say where to meet or if anything changed.</li>
              ) : null}
              {messages.map((row) => {
                const mine = row.senderId === currentUserId;
                return (
                  <li key={row.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                        mine ? "bg-forest text-white" : "bg-forest-soft text-foreground",
                      )}
                    >
                      <p className={cn("text-[11px] font-semibold", mine ? "text-white/70" : "text-muted")}>
                        {mine ? "You" : row.senderName}
                      </p>
                      <p className="mt-0.5 whitespace-pre-wrap break-words">{row.body}</p>
                      <p className={cn("mt-1 text-[10px]", mine ? "text-white/55" : "text-muted")}>
                        {formatChatTime(row.createdAt)}
                      </p>
                    </div>
                  </li>
                );
              })}
              <li ref={bottomRef} />
            </ul>
            {sendable ? (
              <form onSubmit={onSubmit} className="sticky bottom-0 border-t border-line bg-card p-3">
                <div className="flex gap-2">
                  <input
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    maxLength={500}
                    placeholder="Message…"
                    className={fieldClass("mt-0")}
                  />
                  <button type="submit" disabled={pending} className={buttonClass("primary", "h-11 shrink-0 px-4")}>
                    {pending ? "…" : "Send"}
                  </button>
                </div>
                {error ? <p className="mt-2 text-sm text-rose-700">{error}</p> : null}
              </form>
            ) : null}
          </div>
        </div>
      ) : null}
    </Card>
  );
}

function formatChatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-NG", { hour: "numeric", minute: "2-digit" });
}
