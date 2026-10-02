"use client";

import { AGENT_WHATSAPP_GROUP_URL } from "@/lib/agent-community";
import { useEffect } from "react";

export function OpenWhatsAppGroup({ delayMs = 1200 }: { delayMs?: number }) {
  useEffect(() => {
    const id = window.setTimeout(() => {
      window.open(AGENT_WHATSAPP_GROUP_URL, "_blank", "noopener,noreferrer");
    }, delayMs);
    return () => window.clearTimeout(id);
  }, [delayMs]);

  return null;
}
