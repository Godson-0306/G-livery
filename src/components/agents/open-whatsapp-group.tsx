"use client";

import { AGENT_WHATSAPP_GROUP_URL } from "@/lib/agent-community";
import { useEffect } from "react";

export function OpenWhatsAppGroup({ delayMs = 1200 }: { delayMs?: number }) {
  useEffect(() => {
    const id = window.setTimeout(() => {
      window.location.assign(AGENT_WHATSAPP_GROUP_URL);
    }, delayMs);
    return () => window.clearTimeout(id);
  }, [delayMs]);

  return null;
}
