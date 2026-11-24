import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/admin-auth";
import { profileSchema } from "@/lib/validators";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  const { data, error } = await auth.supabase
    .from("profile")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ profile: data });
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    const parsed = profileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid profile payload" },
        { status: 400 }
      );
    }

    const { data: existing } = await auth.supabase
      .from("profile")
      .select("id")
      .limit(1)
      .maybeSingle();

    let result = existing
      ? await auth.supabase
          .from("profile")
          .update(parsed.data)
          .eq("id", existing.id)
          .select("*")
          .single()
      : await auth.supabase
          .from("profile")
          .insert(parsed.data)
          .select("*")
          .single();

    // Backward-compatible retry if featured_github_repos column hasn't been added yet
    if (
      result.error &&
      result.error.message.includes("featured_github_repos")
    ) {
      if (parsed.data.featured_github_repos.length > 0) {
        return NextResponse.json(
          {
            error:
              "Column 'featured_github_repos' is missing in Supabase. Run the ALTER TABLE SQL migration first to save pinned repositories.",
          },
          { status: 500 }
        );
      }

      const { featured_github_repos: _ignored, ...fallbackPayload } = parsed.data;
      void _ignored;

      result = existing
        ? await auth.supabase
            .from("profile")
            .update(fallbackPayload)
            .eq("id", existing.id)
            .select("*")
            .single()
        : await auth.supabase
            .from("profile")
            .insert(fallbackPayload)
            .select("*")
            .single();
    }

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    revalidatePath("/");
    revalidatePath("/cv");
    return NextResponse.json({ profile: result.data });
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}
