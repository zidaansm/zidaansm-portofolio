import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { contactSchema } from "@/lib/validators";

// Simple per-instance in-memory rate limiter (5 requests per 10 minutes per IP)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  if (rateLimitMap.size > 500) {
    for (const [key, value] of rateLimitMap.entries()) {
      if (now > value.resetAt) rateLimitMap.delete(key);
    }
  }

  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return true;
  }

  entry.count += 1;
  return false;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildContactEmailHtml({
  name,
  email,
  subject,
  message,
}: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): string {
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeSubject = escapeHtml(subject);
  const safeMessage = escapeHtml(message).replace(/\r?\n/g, "<br />");
  const replyHref = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(`Re: ${subject}`)}`;

  return `<!DOCTYPE html>
<html lang="en">
  <body style="margin:0;padding:24px;background-color:#fafafa;color:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;margin:0 auto;background-color:#ffffff;border:2px solid #0a0a0a;">
      <tr>
        <td style="background-color:#0a0a0a;color:#fafafa;padding:18px 24px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;">
          ZIDAN. // PORTFOLIO CONTACT INBOX
        </td>
      </tr>
      <tr>
        <td style="padding:24px;">
          <p style="margin:0 0 6px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#525252;">
            SUBJECT
          </p>
          <h1 style="margin:0 0 20px;font-size:20px;line-height:1.3;color:#0a0a0a;">
            ${safeSubject}
          </h1>

          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:20px;border:2px solid #0a0a0a;background-color:#fafafa;">
            <tr>
              <td style="padding:12px 16px;border-bottom:1px solid #d4d4d8;font-size:13px;">
                <strong style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;text-transform:uppercase;color:#525252;">From:</strong>
                <span style="margin-left:8px;font-weight:600;color:#0a0a0a;">${safeName}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:12px 16px;font-size:13px;">
                <strong style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;text-transform:uppercase;color:#525252;">Email:</strong>
                <a href="mailto:${safeEmail}" style="margin-left:8px;color:#0a0a0a;text-decoration:underline;">${safeEmail}</a>
              </td>
            </tr>
          </table>

          <p style="margin:0 0 8px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#525252;">
            MESSAGE
          </p>
          <div style="padding:16px;border:2px solid #0a0a0a;background-color:#ffffff;font-size:14px;line-height:1.65;color:#0a0a0a;">
            ${safeMessage}
          </div>

          <div style="margin-top:24px;">
            <a href="${replyHref}" style="display:inline-block;padding:12px 20px;background-color:#0a0a0a;color:#fafafa;text-decoration:none;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;border:2px solid #0a0a0a;">
              Reply to ${safeName} &rarr;
            </a>
          </div>
        </td>
      </tr>
      <tr>
        <td style="padding:14px 24px;border-top:2px solid #0a0a0a;background-color:#fafafa;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;color:#525252;">
          Sent via Zidan&apos;s Portfolio Contact Form &middot; Also viewable in /admin &rarr; Inbox.
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        {
          ok: false,
          error: "Too many messages sent recently. Please try again in a few minutes.",
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return NextResponse.json(
        {
          ok: false,
          error: firstIssue?.message || "Invalid contact form submission.",
        },
        { status: 400 }
      );
    }

    // Honeypot check: pretend success without persisting or sending
    if (parsed.data.website && parsed.data.website.trim().length > 0) {
      return NextResponse.json({
        ok: true,
        deliveredVia: ["accepted"],
      });
    }

    const { name, email, subject, message } = parsed.data;
    const deliveredVia: string[] = [];

    const supabaseConfigured = isSupabaseConfigured();
    const resendKey = process.env.RESEND_API_KEY?.trim();
    const toEmail =
      process.env.CONTACT_TO_EMAIL?.trim() || "zidanseftino18@gmail.com";
    const fromEmail =
      process.env.CONTACT_FROM_EMAIL?.trim() ||
      "Portfolio Contact <onboarding@resend.dev>";

    // 1. Save to Supabase if configured
    if (supabaseConfigured) {
      try {
        const supabase = await createServerSupabaseClient();
        if (supabase) {
          const { error } = await supabase.from("contact_messages").insert({
            name,
            email,
            subject,
            message,
          });
          if (!error) {
            deliveredVia.push("database");
          }
        }
      } catch {
        // Attempt email delivery before deciding failure
      }
    }

    // 2. Send formatted monochrome HTML notification via Resend if configured
    if (resendKey) {
      try {
        const resend = new Resend(resendKey);
        const { error } = await resend.emails.send({
          from: fromEmail,
          to: [toEmail],
          replyTo: email,
          subject: `[Portfolio] ${subject}`,
          text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`,
          html: buildContactEmailHtml({ name, email, subject, message }),
        });
        if (!error) {
          deliveredVia.push("email");
        }
      } catch {
        // Handled below if all configured delivery channels failed
      }
    }

    const hasConfiguredLiveChannel = supabaseConfigured || Boolean(resendKey);

    if (deliveredVia.length === 0) {
      if (hasConfiguredLiveChannel) {
        return NextResponse.json(
          {
            ok: false,
            error: `Delivery temporarily unavailable. Please email me directly at ${toEmail}.`,
          },
          { status: 502 }
        );
      }

      // Local demo mode (neither Supabase nor Resend configured)
      deliveredVia.push("fallback-validated");
    }

    return NextResponse.json({
      ok: true,
      deliveredVia,
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Malformed request payload." },
      { status: 400 }
    );
  }
}
