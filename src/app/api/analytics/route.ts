import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { analyticsEventSchema } from "@/lib/validators";

const BOT_PATTERN =
  /bot|crawl|spider|slurp|headless|lighthouse|pingdom|uptime|preview|whatsapp|facebookexternalhit|twitterbot|linkedinbot/i;

function detectDeviceType(userAgent: string): "mobile" | "tablet" | "desktop" {
  if (/ipad|tablet|playbook|silk|(android(?!.*mobi))/i.test(userAgent)) {
    return "tablet";
  }
  if (/mobi|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(userAgent)) {
    return "mobile";
  }
  return "desktop";
}

function normalizeReferrerHost(
  referrer: string | null | undefined,
  requestHost: string | null
): string {
  if (!referrer) return "direct";
  try {
    const url = new URL(referrer);
    const host = url.hostname.replace(/^www\./i, "").toLowerCase();
    const currentHost = (requestHost || "")
      .split(":")[0]
      .replace(/^www\./i, "")
      .toLowerCase();
    if (!host || (currentHost && host === currentHost)) {
      return "direct";
    }
    return host.slice(0, 120);
  } catch {
    return "direct";
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = analyticsEventSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: parsed.error.issues[0]?.message || "Invalid analytics payload.",
        },
        { status: 400 }
      );
    }

    const userAgent = request.headers.get("user-agent") || "";
    if (BOT_PATTERN.test(userAgent)) {
      return NextResponse.json({ ok: true, recorded: false });
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ ok: true, recorded: false });
    }

    const deviceType = detectDeviceType(userAgent);
    const referrerHost = normalizeReferrerHost(
      parsed.data.referrer,
      request.headers.get("host")
    );

    const supabase = await createServerSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ ok: true, recorded: false });
    }

    const { error } = await supabase.from("analytics_events").insert({
      event_type: parsed.data.event_type,
      path: parsed.data.path,
      project_slug: parsed.data.project_slug || null,
      referrer_host: referrerHost,
      device_type: deviceType,
    });

    if (error) {
      // Fail softly if table hasn't been migrated yet
      return NextResponse.json({ ok: true, recorded: false });
    }

    return NextResponse.json({ ok: true, recorded: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Malformed request payload." },
      { status: 400 }
    );
  }
}
