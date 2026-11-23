import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isExternalUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return url.startsWith("http://") || url.startsWith("https://");
}

export function isDirectFileDownload(url: string | null | undefined): boolean {
  if (!url) return false;
  return url.toLowerCase().endsWith(".pdf");
}
