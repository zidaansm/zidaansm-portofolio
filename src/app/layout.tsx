import type { Metadata } from "next";
import { JetBrains_Mono, Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import { cookies } from "next/headers";
import { LanguageProvider } from "@/components/providers/LanguageProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { LOCALE_COOKIE_NAME, parseLocale } from "@/lib/i18n";
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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

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
        <ThemeProvider>
          <LanguageProvider initialLocale={initialLocale}>
            {children}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
