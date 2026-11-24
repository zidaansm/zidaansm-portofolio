"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock, AlertTriangle } from "lucide-react";
import { BrutalButton } from "@/components/ui/BrutalButton";
import { BrutalCard } from "@/components/ui/BrutalCard";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

interface AdminLoginFormProps {
  supabaseConfigured: boolean;
  adminEmail: string;
  initialError?: string;
}

export function AdminLoginForm({
  supabaseConfigured,
  adminEmail,
  initialError,
}: AdminLoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState(adminEmail);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    initialError === "forbidden"
      ? "Signed-in account does not match ADMIN_EMAIL."
      : null
  );

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      setError("Supabase environment variables are not configured yet.");
      setLoading(false);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="swiss-grid-bg flex min-h-screen items-center justify-center px-4 py-8 sm:py-12">
      <div className="w-full min-w-0 max-w-md">
        <Link
          href="/"
          className="mb-5 inline-flex min-h-[40px] items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-muted hover:text-ink sm:mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Portfolio</span>
        </Link>

        <BrutalCard className="w-full min-w-0 p-5 sm:p-8">
          <div className="mb-5 flex items-center justify-between border-b-2 border-borderline pb-4 sm:mb-6">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center border-2 border-borderline bg-ink text-canvas">
                <Lock className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <h1 className="font-display text-lg font-bold text-ink sm:text-xl">
                  Admin Console
                </h1>
                <p className="font-mono text-[11px] uppercase tracking-wider text-muted">
                  Supabase Auth Protected
                </p>
              </div>
            </div>
          </div>

          {!supabaseConfigured ? (
            <div className="space-y-4 border-2 border-borderline bg-canvas p-3.5 font-mono text-xs leading-relaxed text-ink sm:p-4">
              <div className="flex items-center gap-2 font-bold uppercase">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>Supabase Setup Required</span>
              </div>
              <p className="break-words text-muted">
                The public portfolio runs seamlessly in fallback mode using{" "}
                <code className="break-all">src/data/seed-data.ts</code>. To enable live Admin CRUD &amp;
                authentication:
              </p>
              <ol className="list-decimal space-y-1.5 pl-4 text-muted">
                <li className="break-words">
                  Add <code className="break-all">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
                  <code className="break-all">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to{" "}
                  <code>.env.local</code>.
                </li>
                <li className="break-words">
                  Run <code>supabase/schema.sql</code> and{" "}
                  <code>supabase/seed.sql</code> in Supabase SQL Editor.
                </li>
                <li className="break-words">
                  Create your Auth user (<code className="break-all">{adminEmail}</code>) in Supabase
                  Authentication.
                </li>
              </ol>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label
                  htmlFor="admin-email"
                  className="mb-1.5 block font-mono text-xs font-bold uppercase tracking-wider text-ink"
                >
                  Admin Email
                </label>
                <input
                  id="admin-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border-2 border-borderline bg-canvas px-3.5 py-2.5 text-base text-ink focus:outline-none focus:ring-2 focus:ring-ink sm:text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="admin-password"
                  className="mb-1.5 block font-mono text-xs font-bold uppercase tracking-wider text-ink"
                >
                  Password
                </label>
                <input
                  id="admin-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full border-2 border-borderline bg-canvas px-3.5 py-2.5 text-base text-ink focus:outline-none focus:ring-2 focus:ring-ink sm:text-sm"
                />
              </div>

              {error && (
                <div className="break-words border-2 border-borderline bg-canvas p-3 font-mono text-xs font-semibold text-ink">
                  {error}
                </div>
              )}

              <BrutalButton
                type="submit"
                disabled={loading}
                className="min-h-[46px] w-full"
                size="lg"
              >
                {loading ? "Signing In..." : "Sign In to Dashboard"}
              </BrutalButton>
            </form>
          )}
        </BrutalCard>
      </div>
    </div>
  );
}
