import { NextRequest, NextResponse } from "next/server";
import {
  createEmptyChatInsightsSummary,
  summarizeChatLogs,
} from "@/lib/chat-insights-server";
import { requireAdmin } from "@/lib/supabase/admin-auth";
import type { ChatLogRow } from "@/types/portfolio";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  const { data, error } = await auth.supabase
    .from("chat_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(2000);

  if (error) {
    return NextResponse.json({
      chatInsights: createEmptyChatInsightsSummary(false),
    });
  }

  const chatInsights = summarizeChatLogs(
    (data as ChatLogRow[] | null) ?? [],
    true
  );

  return NextResponse.json({ chatInsights });
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  const id = request.nextUrl.searchParams.get("id")?.trim();

  if (id) {
    if (!UUID_REGEX.test(id)) {
      return NextResponse.json({ error: "Invalid chat log id." }, { status: 400 });
    }

    const { error } = await auth.supabase
      .from("chat_logs")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: remaining, error: fetchError } = await auth.supabase
      .from("chat_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(2000);

    if (fetchError) {
      return NextResponse.json({
        ok: true,
        chatInsights: createEmptyChatInsightsSummary(false),
      });
    }

    return NextResponse.json({
      ok: true,
      chatInsights: summarizeChatLogs(
        (remaining as ChatLogRow[] | null) ?? [],
        true
      ),
    });
  }

  // Delete all recorded chat logs
  const { error } = await auth.supabase
    .from("chat_logs")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    chatInsights: createEmptyChatInsightsSummary(true),
  });
}
