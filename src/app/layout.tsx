import { Suspense } from "react";
import type { Metadata } from "next";
import { JetBrains_Mono, Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import { cookies } from "next/headers";
import { LanguageProvider } from "@/components/providers/LanguageProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { NavigationProgressBar } from "@/components/ui/NavigationProgressBar";
import { LOCALE_COOKIE_NAME, parseLocale } from "@/lib/i18n";
import { getSiteUrl } from "@/lib/utils";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const siteUrl = getSiteUrl();

const personJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      name: "Zidan Seftino Mutaqin",
      alternateName: "ZIDAN.",
      url: siteUrl,
      jobTitle: "Fullstack Web Developer",
      email: "mailto:zidanseftino18@gmail.com",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Bekasi",
        addressRegion: "Jawa Barat",
        addressCountry: "ID",
      },
      alumniOf: {
        "@type": "CollegeOrUniversity",
        name: "Universitas Bani Saleh",
      },
      sameAs: [
        "https://github.com/zidaansm",
        "https://www.linkedin.com/in/zidansm/",
      ],
      knowsAbout: [
        "Fullstack Web Development",
        "Next.js",
        "TypeScript",
        "Laravel",
        "Filament",
        "PostgreSQL",
        "MySQL",
        "Kotlin",
        "Android Development",
        "Power BI",
      ],
    },
    {
      "@type": "WebSite",
      name: "Zidan's Portfolio",
      url: siteUrl,
      inLanguage: ["en", "id"],
    },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Zidan's Portfolio",
    template: "%s | Zidan's Portfolio",
  },
  description:
    "Personal portfolio of Zidan Seftino Mutaqin — Fullstack Web Developer & Information Systems graduate specializing in structured web systems (Laravel, Filament, Next.js), Android mobile development (Kotlin), and Power BI data reporting.",
  keywords: [
    "Zidan Seftino Mutaqin",
    "Fullstack Web Developer",
    "Laravel",
    "Next.js",
    "Kotlin",
    "Power BI",
    "Information Systems",
    "Portfolio",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Zidan's Portfolio",
    description:
      "Building structured web systems, mobile apps, and actionable data dashboards.",
    siteName: "Zidan's Portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zidan's Portfolio",
    description:
      "Building structured web systems, mobile apps, and actionable data dashboards.",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const initialLocale = parseLocale(cookieStore.get(LOCALE_COOKIE_NAME)?.value);

  return (
    <html
      lang={initialLocale}
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${plusJakartaSans.variable} ${jetBrainsMono.variable}`}
    >
      <body
        suppressHydrationWarning
        className="min-h-screen bg-canvas text-ink antialiased"
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <ThemeProvider>
          <LanguageProvider initialLocale={initialLocale}>
            <Suspense fallback={null}>
              <NavigationProgressBar />
            </Suspense>
            {children}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
