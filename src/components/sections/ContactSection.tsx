"use client";

import { useState, type FormEvent } from "react";
import { ArrowUpRight, Check, Copy, Mail, MapPin, Send } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { Badge } from "@/components/ui/Badge";
import { BrutalButton } from "@/components/ui/BrutalButton";
import { BrutalCard } from "@/components/ui/BrutalCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { Profile } from "@/types/portfolio";

export function ContactSection({ profile }: { profile: Profile }) {
  const { locale, t } = useLanguage();
  const [copied, setCopied] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // honeypot

  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const availability =
    locale === "id"
      ? profile.availability_status_id
      : profile.availability_status_en;

  async function handleCopyEmail() {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback ignored if clipboard blocked
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setStatusMessage(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          subject,
          message,
          website,
        }),
      });

      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
      };

      if (!response.ok || !payload.ok) {
        setStatusMessage({
          type: "error",
          text: payload.error || t.contact.errorFallback,
        });
      } else {
        setStatusMessage({
          type: "success",
          text: t.contact.successMessage,
        });
        setName("");
        setEmail("");
        setSubject("");
        setMessage("");
      }
    } catch {
      setStatusMessage({
        type: "error",
        text: t.contact.errorFallback,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="contact" className="scroll-mt-16 py-12 sm:scroll-mt-20 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          number={t.contact.sectionNumber}
          label={t.contact.sectionLabel}
          title={t.contact.title}
          subtitle={t.contact.subtitle}
        />

        <div className="grid gap-6 sm:gap-8 lg:grid-cols-12">
          {/* Left: Direct Channels */}
          <div className="lg:col-span-5">
            <BrutalCard className="h-full p-4 sm:p-7">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-2 border-b-2 border-borderline pb-3 sm:mb-6">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-ink">
                  {t.contact.directChannels}
                </span>
                {profile.is_available && (
                  <Badge variant="solid">{availability}</Badge>
                )}
              </div>

              <div className="space-y-5 sm:space-y-6">
                <div>
                  <p className="mb-1.5 font-mono text-[11px] uppercase tracking-wider text-muted">
                    {t.contact.emailLabel}
                  </p>
                  <div className="flex flex-col items-start justify-between gap-3 border-2 border-borderline bg-canvas p-3 sm:flex-row sm:items-center">
                    <a
                      href={`mailto:${profile.email}`}
                      className="inline-flex items-center gap-2 break-all font-mono text-xs font-semibold text-ink hover:underline sm:text-sm"
                    >
                      <Mail className="h-4 w-4 shrink-0" />
                      <span>{profile.email}</span>
                    </a>
                    <button
                      type="button"
                      onClick={handleCopyEmail}
                      className="inline-flex min-h-[38px] w-full items-center justify-center gap-1.5 border border-borderline bg-surface px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wider text-ink transition-colors hover:bg-ink hover:text-canvas sm:min-h-0 sm:w-auto"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          <span>{t.contact.copied}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>{t.contact.copyEmail}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <p className="mb-1.5 font-mono text-[11px] uppercase tracking-wider text-muted">
                    {t.contact.locationLabel}
                  </p>
                  <p className="flex items-center gap-2 text-sm font-semibold text-ink">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span>
                      {profile.location} — {profile.timezone}
                    </span>
                  </p>
                </div>

                <div className="border-t-2 border-borderline pt-5">
                  <div className="grid grid-cols-2 gap-3">
                    <a
                      href={profile.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="brutal-interactive flex min-h-[44px] items-center justify-between bg-canvas px-3.5 py-3 font-mono text-xs font-bold uppercase tracking-wider text-ink sm:px-4"
                    >
                      <span>LinkedIn</span>
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                    <a
                      href={profile.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="brutal-interactive flex min-h-[44px] items-center justify-between bg-canvas px-3.5 py-3 font-mono text-xs font-bold uppercase tracking-wider text-ink sm:px-4"
                    >
                      <span>GitHub</span>
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>
            </BrutalCard>
          </div>

          {/* Right: Contact Form */}
          <div className="lg:col-span-7">
            <BrutalCard className="p-4 sm:p-7">
              <div className="mb-5 border-b-2 border-borderline pb-3 sm:mb-6">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-ink">
                  {t.contact.formTitle}
                </span>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Honeypot anti-spam field */}
                <div className="hidden" aria-hidden="true">
                  <label htmlFor="contact-website">Website</label>
                  <input
                    id="contact-website"
                    type="text"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="mb-1.5 block font-mono text-xs font-bold uppercase tracking-wider text-ink"
                    >
                      {t.contact.nameLabel}
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      minLength={2}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t.contact.namePlaceholder}
                      className="w-full border-2 border-borderline bg-canvas px-3.5 py-2.5 text-base text-ink placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-ink sm:text-sm"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="contact-email"
                      className="mb-1.5 block font-mono text-xs font-bold uppercase tracking-wider text-ink"
                    >
                      {t.contact.emailInputLabel}
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t.contact.emailPlaceholder}
                      className="w-full border-2 border-borderline bg-canvas px-3.5 py-2.5 text-base text-ink placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-ink sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="contact-subject"
                    className="mb-1.5 block font-mono text-xs font-bold uppercase tracking-wider text-ink"
                  >
                    {t.contact.subjectLabel}
                  </label>
                  <input
                    id="contact-subject"
                    type="text"
                    required
                    minLength={3}
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder={t.contact.subjectPlaceholder}
                    className="w-full border-2 border-borderline bg-canvas px-3.5 py-2.5 text-base text-ink placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-ink sm:text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-message"
                    className="mb-1.5 block font-mono text-xs font-bold uppercase tracking-wider text-ink"
                  >
                    {t.contact.messageLabel}
                  </label>
                  <textarea
                    id="contact-message"
                    required
                    minLength={10}
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t.contact.messagePlaceholder}
                    className="w-full resize-y border-2 border-borderline bg-canvas px-3.5 py-2.5 text-base text-ink placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-ink sm:text-sm"
                  />
                </div>

                {statusMessage && (
                  <div
                    role="status"
                    className={`border-2 border-borderline p-3 font-mono text-xs font-semibold ${
                      statusMessage.type === "success"
                        ? "bg-ink text-canvas"
                        : "bg-surface text-ink"
                    }`}
                  >
                    {statusMessage.text}
                  </div>
                )}

                <BrutalButton
                  type="submit"
                  size="lg"
                  disabled={submitting}
                  className="w-full sm:w-auto"
                >
                  <Send className="h-4 w-4" />
                  <span>{submitting ? t.contact.sending : t.contact.sendButton}</span>
                </BrutalButton>
              </form>
            </BrutalCard>
          </div>
        </div>
      </div>
    </section>
  );
}
