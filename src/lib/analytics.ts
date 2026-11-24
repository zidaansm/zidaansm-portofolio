"use client";

import type { AnalyticsEventType } from "@/types/portfolio";

interface TrackPayload {
  event_type: AnalyticsEventType;
  path: string;
  project_slug?: string;
}

export function trackPortfolioEvent(payload: TrackPayload): void {
  if (typeof window === "undefined") return;

  try {
    const body = JSON.stringify({
      event_type: payload.event_type,
      path: payload.path,
      project_slug: payload.project_slug || null,
      referrer: document.referrer || null,
    });

    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const blob = new Blob([body], { type: "application/json" });
      const sent = navigator.sendBeacon("/api/analytics", blob);
      if (sent) return;
    }

    void fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    });
  } catch {
    // Analytics must never interrupt user navigation
  }
}
