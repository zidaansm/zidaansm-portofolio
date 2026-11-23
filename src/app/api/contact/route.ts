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

    // 1. Save to Supabase if configured
    if (isSupabaseConfigured()) {
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
        // Non-blocking fallback
      }
    }

    // 2. Send email notification via Resend if configured
    const resendKey = process.env.RESEND_API_KEY?.trim();
    const toEmail =
      process.env.CONTACT_TO_EMAIL?.trim() || "zidanseftino18@gmail.com";
    const fromEmail =
      process.env.CONTACT_FROM_EMAIL?.trim() ||
      "Portfolio Contact <onboarding@resend.dev>";

    if (resendKey) {
      try {
        const resend = new Resend(resendKey);
        const { error } = await resend.emails.send({
          from: fromEmail,
          to: [toEmail],
          replyTo: email,
          subject: `[Portfolio] ${subject}`,
          text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
        });
        if (!error) {
          deliveredVia.push("email");
        }
      } catch {
        // Non-blocking fallback
      }
    }

    if (deliveredVia.length === 0) {
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
