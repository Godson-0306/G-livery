"use client";

import { markNotificationsReadAction } from "@/actions/notifications";
import { useEffect, useRef } from "react";

export function MarkAlertsReadOnOpen({ hasUnread }: { hasUnread: boolean }) {
  const ran = useRef(false);

  useEffect(() => {
    if (!hasUnread || ran.current) return;
    ran.current = true;
    void markNotificationsReadAction();
  }, [hasUnread]);

  return null;
}
