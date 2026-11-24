"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export function NavigationProgressBar() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const trickleTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const completeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const safetyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function clearTimers() {
    if (trickleTimer.current) {
      clearInterval(trickleTimer.current);
      trickleTimer.current = null;
    }
    if (completeTimer.current) {
      clearTimeout(completeTimer.current);
      completeTimer.current = null;
    }
    if (safetyTimer.current) {
      clearTimeout(safetyTimer.current);
      safetyTimer.current = null;
    }
  }

  // Finish bar whenever pathname changes
  useEffect(() => {
    if (!visible) return;
    clearTimers();
    setProgress(100);
    completeTimer.current = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 220);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    function startProgress() {
      clearTimers();
      setVisible(true);
      setProgress(22);

      trickleTimer.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 88) return prev;
          return prev + Math.max(2, Math.round((90 - prev) * 0.18));
        });
      }, 180);

      // Safety fallback in case navigation is cancelled or stays on same route
      safetyTimer.current = setTimeout(() => {
        clearTimers();
        setProgress(100);
        completeTimer.current = setTimeout(() => {
          setVisible(false);
          setProgress(0);
        }, 200);
      }, 8000);
    }

    function handleClick(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;
      if (
        anchor.target === "_blank" ||
        anchor.hasAttribute("download") ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:")
      ) {
        return;
      }

      try {
        const nextUrl = new URL(anchor.href, window.location.href);
        if (nextUrl.origin !== window.location.origin) return;
        if (
          nextUrl.pathname === window.location.pathname &&
          nextUrl.search === window.location.search
        ) {
          return;
        }
        startProgress();
      } catch {
        // Ignore malformed URLs
      }
    }

    document.addEventListener("click", handleClick, true);
    return () => {
      document.removeEventListener("click", handleClick, true);
      clearTimers();
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 right-0 top-0 z-50 h-[3px] bg-transparent"
    >
      <div
        style={{ width: `${progress}%` }}
        className="h-full bg-ink transition-[width] duration-200 ease-out"
      />
    </div>
  );
}
