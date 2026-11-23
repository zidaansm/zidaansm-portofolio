export function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  return {
    url: url || null,
    anonKey: anonKey || null,
    configured: Boolean(url && anonKey),
  };
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseConfig().configured;
}

export function getAdminEmail(): string {
  return (process.env.ADMIN_EMAIL?.trim() || "zidanseftino18@gmail.com").toLowerCase();
}

export function isAuthorizedAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === getAdminEmail();
}
