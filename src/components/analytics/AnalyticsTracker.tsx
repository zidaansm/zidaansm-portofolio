"use client";

import { useEffect } from "react";
import { trackPortfolioEvent } from "@/lib/analytics";
import type { AnalyticsEventType } from "@/types/portfolio";

interface AnalyticsTrackerProps {
  eventType: Extract<AnalyticsEventType, "page_view" | "project_view">;
  path: string;
  projectSlug?: string;
}

export function AnalyticsTracker({
  eventType,
  path,
  projectSlug,
}: AnalyticsTrackerProps) {
  useEffect(() => {
    const storageKey = `portfolio-tracked:${eventType}:${path}`;
    try {
      if (sessionStorage.getItem(storageKey)) {
        return;
      }
      sessionStorage.setItem(storageKey, "1");
    } catch {
      // sessionStorage unavailable in restricted contexts; proceed anyway
    }

    trackPortfolioEvent({
      event_type: eventType,
      path,
      project_slug: projectSlug,
    });
  }, [eventType, path, projectSlug]);

  return null;
}
