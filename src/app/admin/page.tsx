import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { getAdminPortfolioData } from "@/lib/data/portfolio";
import { isAuthorizedAdminEmail, isSupabaseConfigured } from "@/lib/supabase/config";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  if (!isSupabaseConfigured()) {
    redirect("/admin/login");
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    redirect("/admin/login");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAuthorizedAdminEmail(user.email)) {
    redirect("/admin/login");
  }

  const data = await getAdminPortfolioData();

  return (
    <AdminDashboard
      initialProfile={data.profile}
      initialProjects={data.projects}
      initialCapabilities={data.capabilities}
      initialExperiences={data.experiences}
      initialMessages={data.messages}
      initialAnalytics={data.analytics}
      schemaReady={data.schemaReady}
      userEmail={user.email ?? ""}
    />
  );
}
