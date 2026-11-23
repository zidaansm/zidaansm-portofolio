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
    <div className="swiss-grid-bg flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-muted hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Portfolio</span>
        </Link>

        <BrutalCard className="p-6 sm:p-8">
          <div className="mb-6 flex items-center justify-between border-b-2 border-borderline pb-4">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex h-8 w-8 items-center justify-center border-2 border-borderline bg-ink text-canvas">
                <Lock className="h-4 w-4" />
              </span>
              <div>
                <h1 className="font-display text-xl font-bold text-ink">
                  Admin Console
                </h1>
                <p className="font-mono text-[11px] uppercase tracking-wider text-muted">
                  Supabase Auth Protected
                </p>
              </div>
            </div>
          </div>

          {!supabaseConfigured ? (
            <div className="space-y-4 border-2 border-borderline bg-canvas p-4 font-mono text-xs leading-relaxed text-ink">
              <div className="flex items-center gap-2 font-bold uppercase">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>Supabase Setup Required</span>
              </div>
              <p className="text-muted">
                The public portfolio runs seamlessly in fallback mode using{" "}
                <code>src/data/seed-data.ts</code>. To enable live Admin CRUD &amp;
                authentication:
              </p>
              <ol className="list-decimal space-y-1.5 pl-4 text-muted">
                <li>
                  Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
                  <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to{" "}
                  <code>.env.local</code>.
                </li>
                <li>
                  Run <code>supabase/schema.sql</code> and{" "}
                  <code>supabase/seed.sql</code> in Supabase SQL Editor.
                </li>
                <li>
                  Create your Auth user (<code>{adminEmail}</code>) in Supabase
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
                  className="w-full border-2 border-borderline bg-canvas px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-ink"
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
                  className="w-full border-2 border-borderline bg-canvas px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-ink"
                />
              </div>

              {error && (
                <div className="border-2 border-borderline bg-canvas p-3 font-mono text-xs font-semibold text-ink">
                  {error}
                </div>
              )}

              <BrutalButton
                type="submit"
                disabled={loading}
                className="w-full"
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
