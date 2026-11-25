import type {
  ChatInsightsDailyPoint,
  ChatInsightsSummary,
  ChatLogRow,
  ChatTopic,
} from "@/types/portfolio";

export const CHAT_TOPIC_LABELS: Record<ChatTopic, string> = {
  projects: "Projects & Case Studies",
  tech_stack: "Tech Stack & Skills",
  contact_cv: "CV, Hiring & Contact",
  experience: "Experience & Education",
  profile: "Profile & Intro",
  salary_private: "Salary / Private Inquiry",
  other: "Other / General",
};

export function getChatTopicLabel(topic: string): string {
  return CHAT_TOPIC_LABELS[topic as ChatTopic] ?? "Other / General";
}

/**
 * Classifies an anonymous visitor question into an actionable recruiter insight bucket.
 */
export function classifyChatTopic(
  question: string,
  currentPage?: string | null
): ChatTopic {
  const lower = question.toLowerCase();

  if (
    /(gaji|salary|rate|harga|fee|wa\b|whatsapp|telepon|phone|nomor hp|umur|age|alamat rumah|expected salary|compensation)/i.test(
      lower
    )
  ) {
    return "salary_private";
  }

  if (
    /(contact|kontak|hubungi|email|linkedin|github|cv\b|resume|hire|rekruit|rekrut|interview|available|availability|tersedia|ketersediaan|full-?time|status kerja|lokasi|location|domisili|bekasi|reach)/i.test(
      lower
    )
  ) {
    return "contact_cv";
  }

  if (
    /(project|proyek|projek|karya|case study|studi kasus|perpustakaan|library|filament|replaste|plastik|plastic|tflite|ldv|ldvarch|scoreboard|data-analyst|pendidikan|bps|this project|proyek ini|arsitektur|architecture|demo)/i.test(
      lower
    ) ||
    (Boolean(currentPage && currentPage.startsWith("/projects/")) &&
      /(jelaskan|explain|break down|spill|buat apa|how does|fitur|feature)/i.test(
        lower
      ))
  ) {
    return "projects";
  }

  if (
    /(skill|stack|tech|keahlian|teknologi|bahasa|framework|laravel|php|next\.?js|react|typescript|supabase|kotlin|android|power\s?bi|mysql|postgres|sql|node|express|tools|backend|frontend|database|tailwind|python)/i.test(
      lower
    )
  ) {
    return "tech_stack";
  }

  if (
    /(experience|pengalaman|education|pendidikan|kuliah|kampus|universitas|bani saleh|bangkit|msib|lulusan|degree|studi|background|latar belakang|magang|intern)/i.test(
      lower
    )
  ) {
    return "experience";
  }

  if (
    /(halo|hai|hello|hi\b|hey|selamat|siapa|who|ringkas|summary|summarize|profil|profile|tentang|about|zidan|kenalan|intro)/i.test(
      lower
    )
  ) {
    return "profile";
  }

  return "other";
}

function buildLast14DaysSkeleton(): ChatInsightsDailyPoint[] {
  const days: ChatInsightsDailyPoint[] = [];
  const now = new Date();
  for (let offset = 13; offset >= 0; offset -= 1) {
    const d = new Date(now);
    d.setUTCHours(0, 0, 0, 0);
    d.setUTCDate(d.getUTCDate() - offset);
    const isoDate = d.toISOString().slice(0, 10);
    const label = isoDate.slice(5); // MM-DD
    days.push({ date: isoDate, label, chats: 0 });
  }
  return days;
}

export function createEmptyChatInsightsSummary(
  tableReady: boolean
): ChatInsightsSummary {
  return {
    tableReady,
    totalChats: 0,
    chatsLast7Days: 0,
    aiSuccessRate: 0,
    avgResponseMs: 0,
    dailyTrend: buildLast14DaysSkeleton(),
    topicBreakdown: [],
    modelBreakdown: [],
    localeBreakdown: { id: 0, en: 0 },
    topPages: [],
    recentLogs: [],
  };
}

export function summarizeChatLogs(
  rows: ChatLogRow[],
  tableReady = true
): ChatInsightsSummary {
  const summary = createEmptyChatInsightsSummary(tableReady);
  if (rows.length === 0) {
    return summary;
  }

  const dailyMap = new Map<string, ChatInsightsDailyPoint>(
    summary.dailyTrend.map((point) => [point.date, point])
  );
  const topicCounts = new Map<string, number>();
  const modelCounts = new Map<string, number>();
  const pageCounts = new Map<string, number>();

  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  let geminiCount = 0;
  let totalLatency = 0;
  let latencySamples = 0;

  for (const row of rows) {
    summary.totalChats += 1;

    const createdMs = Date.parse(row.created_at);
    if (!Number.isNaN(createdMs) && createdMs >= sevenDaysAgo) {
      summary.chatsLast7Days += 1;
    }

    const dayKey = row.created_at.slice(0, 10);
    const bucket = dailyMap.get(dayKey);
    if (bucket) {
      bucket.chats += 1;
    }

    if (row.response_mode === "gemini") {
      geminiCount += 1;
    }

    if (typeof row.response_ms === "number" && row.response_ms > 0) {
      totalLatency += row.response_ms;
      latencySamples += 1;
    }

    const topicKey = row.topic || "other";
    topicCounts.set(topicKey, (topicCounts.get(topicKey) ?? 0) + 1);

    const modelKey = row.model_used || "unknown";
    modelCounts.set(modelKey, (modelCounts.get(modelKey) ?? 0) + 1);

    const pageKey = row.current_page || "/";
    pageCounts.set(pageKey, (pageCounts.get(pageKey) ?? 0) + 1);

    if (row.locale === "id") {
      summary.localeBreakdown.id += 1;
    } else {
      summary.localeBreakdown.en += 1;
    }
  }

  summary.aiSuccessRate = Math.round((geminiCount / rows.length) * 100);
  summary.avgResponseMs =
    latencySamples > 0 ? Math.round(totalLatency / latencySamples) : 0;

  summary.topicBreakdown = Array.from(topicCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([topic, count]) => ({
      topic,
      label: getChatTopicLabel(topic),
      count,
    }));

  summary.modelBreakdown = Array.from(modelCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([model, count]) => ({ model, count }));

  summary.topPages = Array.from(pageCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([page, count]) => ({ page, count }));

  summary.recentLogs = rows.slice(0, 100);

  return summary;
}
