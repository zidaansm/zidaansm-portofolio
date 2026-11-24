"use client";

import {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUp,
  Check,
  Copy,
  MessageSquare,
  RotateCcw,
  Sparkles,
  X,
} from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  modelLabel?: string;
}

interface PortfolioChatbotProps {
  currentPage?: string;
  isAiConfigured?: boolean;
}

type EngineState = "idle" | "gemini" | "fallback";

const INLINE_TOKEN_REGEX =
  /(\*\*[^*]+\*\*|https?:\/\/[^\s)]+|(?:\/projects\/[a-z0-9-]+|\/#(?:projects|capabilities|experience|github|contact)|\/cv)\b|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;

function formatInlineTokens(
  text: string,
  onInternalNavigate: () => void
): ReactNode[] {
  const parts = text.split(INLINE_TOKEN_REGEX);

  return parts.map((part, idx) => {
    if (!part) return null;

    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={idx} className="font-semibold text-ink">
          {part.slice(2, -2)}
        </strong>
      );
    }

    if (part.startsWith("http://") || part.startsWith("https://")) {
      const cleanUrl = part.replace(/[.,;:!?]+$/, "");
      const trailing = part.slice(cleanUrl.length);
      return (
        <Fragment key={idx}>
          <a
            href={cleanUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="break-all font-mono text-[0.9em] underline decoration-2 underline-offset-2 transition-opacity hover:opacity-75"
          >
            {cleanUrl}
          </a>
          {trailing}
        </Fragment>
      );
    }

    if (part.startsWith("/")) {
      return (
        <Link
          key={idx}
          href={part}
          onClick={onInternalNavigate}
          className="font-mono text-[0.9em] font-semibold underline decoration-2 underline-offset-2 transition-opacity hover:opacity-75"
        >
          {part}
        </Link>
      );
    }

    if (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(part)) {
      return (
        <a
          key={idx}
          href={`mailto:${part}`}
          className="break-all font-mono text-[0.9em] underline decoration-2 underline-offset-2 transition-opacity hover:opacity-75"
        >
          {part}
        </a>
      );
    }

    return <Fragment key={idx}>{part}</Fragment>;
  });
}

function RichMessageText({
  content,
  onInternalNavigate,
}: {
  content: string;
  onInternalNavigate: () => void;
}) {
  const lines = content.split(/\r?\n/);

  return (
    <div className="space-y-1.5 break-words text-sm leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-1" />;
        }

        const bulletMatch = trimmed.match(/^[-*•]\s+(.*)$/);
        if (bulletMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-0.5">
              <span
                aria-hidden="true"
                className="mt-2 h-1.5 w-1.5 shrink-0 bg-ink"
              />
              <p className="min-w-0 flex-1">
                {formatInlineTokens(bulletMatch[1], onInternalNavigate)}
              </p>
            </div>
          );
        }

        return (
          <p key={idx}>{formatInlineTokens(trimmed, onInternalNavigate)}</p>
        );
      })}
    </div>
  );
}

function formatModelShortLabel(model: string | null | undefined): string | null {
  if (!model || model === "local-knowledge") return null;

  const normalized = model.toLowerCase();
  if (normalized.includes("4-hydrogen")) return "GEMINI 4H";
  if (normalized.includes("4-argon")) return "GEMINI 4A";
  if (normalized.includes("4-carbon")) return "GEMINI 4C";
  if (normalized.includes("4-neon")) return "GEMINI 4N";

  const match = normalized.match(/gemini-(\d+(?:\.\d+)?)/i);
  if (match) {
    const isLite = normalized.includes("lite");
    return `GEMINI ${match[1]}${isLite ? " LITE" : ""}`;
  }

  return "GEMINI AI";
}

function formatModelBadge(
  engineState: EngineState,
  activeModel: string | null,
  readyLabel: string,
  fallbackLabel: string
): string {
  if (engineState === "fallback") return fallbackLabel;
  if (engineState === "gemini") {
    return formatModelShortLabel(activeModel) ?? "GEMINI AI";
  }
  return readyLabel;
}

export function PortfolioChatbot({
  currentPage = "/",
  isAiConfigured = false,
}: PortfolioChatbotProps) {
  const { locale, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [engineState, setEngineState] = useState<EngineState>(
    isAiConfigured ? "idle" : "fallback"
  );
  const [activeModel, setActiveModel] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isProjectPage = currentPage.startsWith("/projects/");
  const quickPrompts = isProjectPage
    ? [
        t.chatbot.quickPromptCurrentProject,
        t.chatbot.quickPrompt1,
        t.chatbot.quickPrompt3,
        t.chatbot.quickPrompt4,
      ]
    : [
        t.chatbot.quickPrompt1,
        t.chatbot.quickPrompt2,
        t.chatbot.quickPrompt3,
        t.chatbot.quickPrompt4,
      ];

  // Close with Escape key
  useEffect(() => {
    if (!isOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  // Focus text input on desktop when opened (skip on mobile to keep quick prompts visible)
  useEffect(() => {
    if (isOpen && typeof window !== "undefined" && window.innerWidth >= 640) {
      const timer = window.setTimeout(() => {
        inputRef.current?.focus();
      }, 120);
      return () => window.clearTimeout(timer);
    }
  }, [isOpen]);

  // Auto-scroll to latest message
  useEffect(() => {
    if (!isOpen) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [isOpen, messages, isLoading]);

  const sendMessage = useCallback(
    async (rawText: string) => {
      const text = rawText.trim();
      if (!text || isLoading) return;

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: text.slice(0, 600),
      };

      const updatedHistory = [...messages, userMsg];
      setMessages(updatedHistory);
      setInputValue("");
      setIsLoading(true);

      try {
        const payloadMessages = updatedHistory.slice(-12).map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: payloadMessages,
            locale,
            currentPage,
          }),
        });

        const result = (await response.json().catch(() => null)) as {
          ok?: boolean;
          reply?: string;
          mode?: "gemini" | "fallback";
          model?: string;
          error?: string;
        } | null;

        if (response.status === 429) {
          setMessages((prev) => [
            ...prev,
            {
              id: `assistant-${Date.now()}`,
              role: "assistant",
              content: t.chatbot.rateLimitError,
            },
          ]);
          return;
        }

        if (!response.ok || !result?.ok || !result.reply) {
          setMessages((prev) => [
            ...prev,
            {
              id: `assistant-${Date.now()}`,
              role: "assistant",
              content: result?.error || t.chatbot.networkError,
            },
          ]);
          return;
        }

        let msgModelLabel: string | undefined;
        if (result.mode === "gemini") {
          setEngineState("gemini");
          setActiveModel(result.model ?? null);
          msgModelLabel = formatModelShortLabel(result.model) ?? "GEMINI AI";
        } else {
          setEngineState("fallback");
          setActiveModel(null);
          msgModelLabel = t.chatbot.badgeFallback;
        }

        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content: result.reply as string,
            modelLabel: msgModelLabel,
          },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content: t.chatbot.networkError,
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [
      currentPage,
      isLoading,
      locale,
      messages,
      t.chatbot.badgeFallback,
      t.chatbot.networkError,
      t.chatbot.rateLimitError,
    ]
  );

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    void sendMessage(inputValue);
  }

  function handleReset() {
    if (isLoading) return;
    setMessages([]);
    setInputValue("");
    setCopiedId(null);
    setEngineState(isAiConfigured ? "idle" : "fallback");
    setActiveModel(null);
  }

  async function handleCopyReply(id: string, content: string) {
    try {
      await navigator.clipboard.writeText(content.replace(/\*\*/g, ""));
      setCopiedId(id);
      window.setTimeout(() => {
        setCopiedId((current) => (current === id ? null : current));
      }, 1800);
    } catch {
      // Clipboard unavailable
    }
  }

  function handleInternalNavigate() {
    setIsOpen(false);
  }

  const badgeText = formatModelBadge(
    engineState,
    activeModel,
    t.chatbot.badgeReady,
    t.chatbot.badgeFallback
  );

  return (
    <div className="no-print">
      {/* Floating Brutalist Trigger Button (Never Auto-Opens) */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            onClick={() => setIsOpen(true)}
            aria-label={t.chatbot.openAria}
            className="brutal-interactive fixed bottom-4 right-4 z-40 inline-flex min-h-[46px] items-center gap-2.5 bg-ink px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-canvas sm:bottom-6 sm:right-6"
          >
            <span className="relative inline-flex h-2 w-2 shrink-0 bg-canvas">
              <span className="absolute inline-flex h-full w-full animate-ping bg-canvas opacity-60" />
            </span>
            <MessageSquare className="h-4 w-4 shrink-0" />
            <span>{t.chatbot.triggerLabel}</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Editorial Swiss-Brutalist Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.section
            role="dialog"
            aria-label={t.chatbot.title}
            initial={{ opacity: 0, y: 14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.2, 0.8, 0.2, 1] }}
            className="fixed inset-x-3 bottom-3 z-50 flex h-[min(78dvh,560px)] flex-col border-2 border-borderline bg-surface shadow-brutal sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-[400px]"
          >
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between gap-2 border-b-2 border-borderline bg-ink px-3.5 py-3 text-canvas">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center border-2 border-canvas bg-canvas font-mono text-xs font-bold text-ink">
                  <Sparkles className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="truncate font-mono text-xs font-bold uppercase tracking-wider">
                      {t.chatbot.title}
                    </h2>
                    <span className="shrink-0 border border-canvas/50 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-canvas/90">
                      {badgeText}
                    </span>
                  </div>
                  <p className="truncate font-mono text-[10px] uppercase tracking-wider text-canvas/70">
                    {t.chatbot.subtitle}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                {messages.length > 0 && (
                  <button
                    type="button"
                    onClick={handleReset}
                    disabled={isLoading}
                    aria-label={t.chatbot.resetLabel}
                    title={t.chatbot.resetLabel}
                    className="inline-flex h-8 w-8 items-center justify-center border border-canvas/40 text-canvas transition-colors hover:bg-canvas hover:text-ink disabled:opacity-40"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label={t.chatbot.closeAria}
                  className="inline-flex h-8 w-8 items-center justify-center border border-canvas/40 text-canvas transition-colors hover:bg-canvas hover:text-ink"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Messages Thread */}
            <div
              aria-live="polite"
              className="swiss-grid-bg flex-1 space-y-3 overflow-y-auto bg-canvas p-3.5"
            >
              {/* Initial Greeting Bubble */}
              <div className="max-w-[92%] border-2 border-borderline bg-surface p-3 text-ink shadow-brutal-sm">
                <div className="mb-1.5 flex items-center justify-between gap-2 font-mono text-[10px] font-bold uppercase tracking-wider text-muted">
                  <span>AI // ZIDAN.</span>
                  <span>{locale.toUpperCase()}</span>
                </div>
                <p className="text-sm leading-relaxed">{t.chatbot.greeting}</p>
              </div>

              {/* Quick Prompt Buttons (shown before first user turn) */}
              {messages.length === 0 && (
                <div className="space-y-2 pt-1">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted">
                    {t.chatbot.quickPromptsLabel}
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {quickPrompts.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        disabled={isLoading}
                        onClick={() => void sendMessage(prompt)}
                        className="flex min-h-[38px] w-full items-center justify-between gap-2 border-2 border-borderline bg-surface px-3 py-2 text-left font-mono text-xs font-semibold text-ink transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-ink hover:text-canvas hover:shadow-brutal-sm active:translate-x-0 active:translate-y-0 disabled:opacity-50"
                      >
                        <span className="truncate">{prompt}</span>
                        <span aria-hidden="true" className="shrink-0 text-xs">
                          →
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Conversation Messages */}
              {messages.map((msg) =>
                msg.role === "user" ? (
                  <div key={msg.id} className="flex justify-end">
                    <div className="max-w-[86%] border-2 border-borderline bg-ink px-3.5 py-2.5 text-sm leading-relaxed text-canvas shadow-brutal-sm">
                      <p className="whitespace-pre-wrap break-words">
                        {msg.content}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div key={msg.id} className="flex justify-start">
                    <div className="max-w-[92%] border-2 border-borderline bg-surface p-3 text-ink shadow-brutal-sm">
                      <div className="mb-1.5 flex items-center justify-between gap-2 font-mono text-[10px] font-bold uppercase tracking-wider text-muted">
                        <span className="truncate">
                          AI // {msg.modelLabel ?? "ZIDAN."}
                        </span>
                        <button
                          type="button"
                          onClick={() => void handleCopyReply(msg.id, msg.content)}
                          aria-label={t.chatbot.copyReply}
                          title={t.chatbot.copyReply}
                          className="inline-flex shrink-0 items-center gap-1 text-[10px] text-muted transition-colors hover:text-ink"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="h-3 w-3" />
                              <span>{t.chatbot.copiedReply}</span>
                            </>
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                      <RichMessageText
                        content={msg.content}
                        onInternalNavigate={handleInternalNavigate}
                      />
                    </div>
                  </div>
                )
              )}

              {/* Typing Indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="inline-flex items-center gap-2.5 border-2 border-borderline bg-surface px-3 py-2.5 shadow-brutal-sm">
                    <span className="flex items-center gap-1" aria-hidden="true">
                      <span className="h-1.5 w-1.5 animate-pulse bg-ink" />
                      <span className="h-1.5 w-1.5 animate-pulse bg-ink [animation-delay:150ms]" />
                      <span className="h-1.5 w-1.5 animate-pulse bg-ink [animation-delay:300ms]" />
                    </span>
                    <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-muted">
                      {t.chatbot.thinking}
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Composer Footer */}
            <div className="shrink-0 border-t-2 border-borderline bg-surface p-3">
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  maxLength={600}
                  disabled={isLoading}
                  placeholder={t.chatbot.inputPlaceholder}
                  aria-label={t.chatbot.inputPlaceholder}
                  className="min-h-[42px] min-w-0 flex-1 border-2 border-borderline bg-canvas px-3 py-2 text-base text-ink placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-ink/20 disabled:opacity-60 sm:text-sm"
                />
                <button
                  type="submit"
                  disabled={isLoading || inputValue.trim().length === 0}
                  aria-label={t.chatbot.sendAria}
                  className="inline-flex h-[42px] w-[42px] shrink-0 items-center justify-center border-2 border-borderline bg-ink text-canvas transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-sm active:translate-x-0 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
              </form>
              <div className="mt-2 flex items-center justify-between gap-2 font-mono text-[10px] text-muted">
                <span className="truncate">{t.chatbot.disclaimer}</span>
                {inputValue.length > 420 && (
                  <span className="shrink-0">{inputValue.length}/600</span>
                )}
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
