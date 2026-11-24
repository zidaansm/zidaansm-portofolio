import { NextRequest, NextResponse } from "next/server";
import { getAllGitHubRepos } from "@/lib/github";
import { requireAdmin } from "@/lib/supabase/admin-auth";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  let githubUrl = request.nextUrl.searchParams.get("github_url");

  if (!githubUrl) {
    const { data } = await auth.supabase
      .from("profile")
      .select("github_url")
      .limit(1)
      .maybeSingle();
    githubUrl = data?.github_url ?? "https://github.com/zidaansm";
  }

  const repos = await getAllGitHubRepos(githubUrl);
  return NextResponse.json({ repos });
}
