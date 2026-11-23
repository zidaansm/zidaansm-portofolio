"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Download, Menu, Moon, Sun, X } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { BrutalLinkButton } from "@/components/ui/BrutalButton";
import { isExternalUrl } from "@/lib/utils";
import type { Profile } from "@/types/portfolio";

interface NavbarProps {
  profile: Profile;
  hasExperiences?: boolean;
}

export function Navbar({ profile, hasExperiences = true }: NavbarProps) {
  const { locale, setLocale, t } = useLanguage();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    { href: "/#projects", label: t.nav.projects },
    { href: "/#capabilities", label: t.nav.capabilities },
    ...(hasExperiences
      ? [{ href: "/#experience", label: t.nav.experience }]
      : []),
    { href: "/#contact", label: t.nav.contact },
  ];

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <header className="sticky top-0 z-40 border-b-2 border-borderline bg-canvas/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Monogram */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-display text-lg font-bold tracking-tight text-ink transition-opacity hover:opacity-80"
        >
          <span className="inline-flex h-8 w-8 items-center justify-center border-2 border-borderline bg-ink font-mono text-sm font-bold text-canvas">
            Z
          </span>
          <span>{profile.brand_name}</span>
        </Link>

        {/* Desktop Nav */}
        <nav
          aria-label="Primary"
          className="hidden items-center gap-6 md:flex"
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-mono text-xs font-semibold uppercase tracking-wider text-muted transition-colors hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Bilingual Switcher */}
          <div
            role="group"
            aria-label="Language toggle"
            className="inline-flex border-2 border-borderline bg-surface p-0.5 font-mono text-xs font-bold"
          >
            <button
              type="button"
              onClick={() => setLocale("en")}
              className={`px-2 py-1 transition-colors ${
                locale === "en"
                  ? "bg-ink text-canvas"
                  : "text-muted hover:text-ink"
              }`}
              aria-pressed={locale === "en"}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLocale("id")}
              className={`px-2 py-1 transition-colors ${
                locale === "id"
                  ? "bg-ink text-canvas"
                  : "text-muted hover:text-ink"
              }`}
              aria-pressed={locale === "id"}
            >
              ID
            </button>
          </div>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            aria-label="Toggle color theme"
            className="inline-flex h-9 w-9 items-center justify-center border-2 border-borderline bg-surface text-ink transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-sm active:translate-x-0 active:translate-y-0"
          >
            {mounted ? (
              isDark ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )
            ) : (
              <span className="h-4 w-4" />
            )}
          </button>

          {/* Download CV CTA (Desktop) */}
          <BrutalLinkButton
            href={profile.cv_url || "/cv"}
            external={isExternalUrl(profile.cv_url)}
            size="sm"
            className="hidden sm:inline-flex"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{t.nav.downloadCv}</span>
          </BrutalLinkButton>

          {/* Mobile Drawer Trigger */}
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? t.nav.close : t.nav.menu}
            aria-expanded={mobileOpen}
            className="inline-flex h-9 w-9 items-center justify-center border-2 border-borderline bg-surface text-ink md:hidden"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="border-t-2 border-borderline bg-surface px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="border-b border-borderline/20 py-2 font-mono text-sm font-semibold uppercase tracking-wider text-ink"
              >
                {item.label}
              </Link>
            ))}
            <BrutalLinkButton
              href={profile.cv_url || "/cv"}
              external={isExternalUrl(profile.cv_url)}
              size="md"
              className="mt-2 w-full"
              onClick={() => setMobileOpen(false)}
            >
              <Download className="h-4 w-4" />
              <span>{t.nav.downloadCv}</span>
            </BrutalLinkButton>
          </div>
        </div>
      )}
    </header>
  );
}
