import { after, NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  BACKUP_GEMINI_MODELS,
  buildPortfolioSystemPrompt,
  DEFAULT_GEMINI_MODEL,
  extractGeminiReplyText,
  generateFallbackReply,
} from "@/lib/chat";
import { classifyChatTopic } from "@/lib/chat-insights-server";
import { getPortfolioData } from "@/lib/data/portfolio";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { chatRequestSchema } from "@/lib/validators";
import type { Locale } from "@/types/portfolio";

export const runtime = "nodejs";
export const maxDuration = 30;

// Per-instance in-memory rate limiter (20 questions per 10 minutes per IP)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 20;

// Smart per-model cooldowns so rate-limited (429) or overloaded (503) models
// skip straight to the next healthy model without slowing down follow-up turns
const modelCooldownUntil = new Map<string, number>();
const COOLDOWN_RATE_LIMIT_MS = 5 * 60 * 1000; // 429 quota/rate-limit -> 5 min
const COOLDOWN_OVERLOAD_MS = 60 * 1000; // 503 high-demand / timeout -> 1 min
const COOLDOWN_NOT_FOUND_MS = 60 * 60 * 1000; // 404 retired model -> 1 hr

const PER_MODEL_TIMEOUT_MS = 7000;
const TOTAL_GEMINI_BUDGET_MS = 22000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();

  if (rateLimitMap.size > 500) {
    for (const [key, value] of rateLimitMap.entries()) {
      if (now > value.resetAt) {
        rateLimitMap.delete(key);
      }
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

function getCandidateModels(): string[] {
  const primary = process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;
  const envFallbacks = process.env.GEMINI_FALLBACK_MODELS
    ?.split(",")
    .map((m) => m.trim())
    .filter(Boolean);

  const rawList = [
    primary,
    ...(envFallbacks && envFallbacks.length > 0
      ? envFallbacks
      : BACKUP_GEMINI_MODELS),
  ];

  const uniqueModels = Array.from(new Set(rawList.filter(Boolean)));
  const now = Date.now();

  // Prioritize models not currently on cooldown; keep cooled models as last-resort retry
  const active = uniqueModels.filter(
    (model) => (modelCooldownUntil.get(model) ?? 0) <= now
  );
  const cooling = uniqueModels.filter(
    (model) => (modelCooldownUntil.get(model) ?? 0) > now
  );

  return [...active, ...cooling];
}

function normalizeCurrentPage(page: string | null | undefined): string {
  const trimmed = page?.trim() || "/";
  if (!trimmed.startsWith("/")) return "/";
  return trimmed.slice(0, 140);
}

/**
 * Logs anonymous chatbot interactions after the response is sent (zero latency impact).
 * Never stores IP addresses, cookies, or personal identifiers.
 */
function scheduleChatInsightLog(payload: {
  question: string;
  reply: string;
  locale: Locale;
  currentPage: string | null | undefined;
  responseMode: "gemini" | "fallback";
  modelUsed: string;
  responseMs: number;
}) {
  const { url, anonKey, configured } = getSupabaseConfig();
  if (!configured || !url || !anonKey) return;

  const safePage = normalizeCurrentPage(payload.currentPage);
  const topic = classifyChatTopic(payload.question, safePage);
  const safeQuestion = payload.question.trim().slice(0, 600);
  const safeReply = payload.reply.trim().slice(0, 780);
  const safeMs = Math.max(0, Math.min(120000, Math.round(payload.responseMs)));

  after(async () => {
    try {
      const supabase = createClient(url, anonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });

      await supabase.from("chat_logs").insert({
        question: safeQuestion,
        reply_preview: safeReply,
        topic,
        locale: payload.locale,
        current_page: safePage,
        response_mode: payload.responseMode,
        model_used: payload.modelUsed.slice(0, 80),
        response_ms: safeMs,
      });
    } catch {
      // Non-blocking: never affect live chatbot responses if chat_logs table isn't created yet
    }
  });
}

async function callGeminiModel({
  apiKey,
  model,
  systemPrompt,
  contents,
  includeThinkingConfig,
  timeoutMs,
}: {
  apiKey: string;
  model: string;
  systemPrompt: string;
  contents: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }>;
  includeThinkingConfig: boolean;
  timeoutMs: number;
}): Promise<Response> {
  const generationConfig: Record<string, unknown> = {
    temperature: 0.35,
    maxOutputTokens: 1024,
  };

  if (includeThinkingConfig) {
    generationConfig.thinkingConfig = {
      thinkingLevel: "LOW",
    };
  }

  return fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
        contents,
        generationConfig,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(timeoutMs),
    }
  );
}

export async function POST(request: NextRequest) {
  const requestStartedAt = Date.now();

  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        {
          ok: false,
          error: "Too many questions sent recently. Please try again in a few minutes.",
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = chatRequestSchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return NextResponse.json(
        {
          ok: false,
          error: firstIssue?.message || "Invalid chat request.",
        },
        { status: 400 }
      );
    }

    const { messages, locale, currentPage } = parsed.data;
    const lastUserMessage = messages[messages.length - 1]?.content ?? "";

    // Always ground responses on live Supabase portfolio data (with graceful seed fallback)
    const portfolioData = await getPortfolioData();
    const apiKey = process.env.GEMINI_API_KEY?.trim();

    if (apiKey) {
      const systemPrompt = buildPortfolioSystemPrompt(
        portfolioData,
        locale,
        currentPage
      );
      const candidateModels = getCandidateModels();
      const contents = messages.map((msg) => ({
        role: (msg.role === "assistant" ? "model" : "user") as "user" | "model",
        parts: [{ text: msg.content }],
      }));

      const startedAt = Date.now();

      for (const model of candidateModels) {
        const elapsed = Date.now() - startedAt;
        const remaining = TOTAL_GEMINI_BUDGET_MS - elapsed;
        if (remaining < 1500) {
          break;
        }

        const attemptTimeout = Math.min(PER_MODEL_TIMEOUT_MS, remaining);

        try {
          // Gemini 4 & standard Gemini 3.x Flash models (non-lite) support thinkingConfig.thinkingLevel: "LOW"
          const useThinkingConfig =
            (model.startsWith("gemini-4") || model.startsWith("gemini-3")) &&
            !model.includes("lite");

          let response = await callGeminiModel({
            apiKey,
            model,
            systemPrompt,
            contents,
            includeThinkingConfig: useThinkingConfig,
            timeoutMs: attemptTimeout,
          });

          // If a specific model rejects thinkingConfig with 400, retry once without thinkingConfig
          if (response.status === 400 && useThinkingConfig) {
            const retryRemaining = TOTAL_GEMINI_BUDGET_MS - (Date.now() - startedAt);
            if (retryRemaining >= 1500) {
              response = await callGeminiModel({
                apiKey,
                model,
                systemPrompt,
                contents,
                includeThinkingConfig: false,
                timeoutMs: Math.min(PER_MODEL_TIMEOUT_MS, retryRemaining),
              });
            }
          }

          if (response.ok) {
            modelCooldownUntil.delete(model);
            const payload: unknown = await response.json();
            const reply = extractGeminiReplyText(payload);
            if (reply) {
              scheduleChatInsightLog({
                question: lastUserMessage,
                reply,
                locale,
                currentPage,
                responseMode: "gemini",
                modelUsed: model,
                responseMs: Date.now() - requestStartedAt,
              });

              return NextResponse.json({
                ok: true,
                reply,
                mode: "gemini",
                model,
              });
            }
          }

          if (response.status === 429) {
            modelCooldownUntil.set(model, Date.now() + COOLDOWN_RATE_LIMIT_MS);
            continue;
          }

          if (response.status === 503 || response.status === 500) {
            modelCooldownUntil.set(model, Date.now() + COOLDOWN_OVERLOAD_MS);
            continue;
          }

          if (response.status === 404) {
            modelCooldownUntil.set(model, Date.now() + COOLDOWN_NOT_FOUND_MS);
            continue;
          }

          // Stop trying backup models if the API key itself is invalid/unauthorized
          if (response.status === 401 || response.status === 403) {
            break;
          }
        } catch {
          modelCooldownUntil.set(model, Date.now() + COOLDOWN_OVERLOAD_MS);
          // Try next fallback model or fall back to local smart knowledge engine
        }
      }
    }

    // Zero-error automatic fallback grounded in live portfolio data
    const fallbackReply = generateFallbackReply(
      lastUserMessage,
      portfolioData,
      locale,
      currentPage
    );

    scheduleChatInsightLog({
      question: lastUserMessage,
      reply: fallbackReply,
      locale,
      currentPage,
      responseMode: "fallback",
      modelUsed: "local-knowledge",
      responseMs: Date.now() - requestStartedAt,
    });

    return NextResponse.json({
      ok: true,
      reply: fallbackReply,
      mode: "fallback",
      model: "local-knowledge",
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Malformed request payload." },
      { status: 400 }
    );
  }
}
