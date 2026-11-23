import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import {
  FALLBACK_CAPABILITIES,
  FALLBACK_EXPERIENCES,
  FALLBACK_PROFILE,
  FALLBACK_PROJECTS,
} from "@/data/seed-data";
import { requireAdmin } from "@/lib/supabase/admin-auth";

export async function POST() {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  const { supabase } = auth;

  try {
    // 1. Profile — insert only if empty so user edits are preserved
    const { data: existingProfile } = await supabase
      .from("profile")
      .select("id")
      .limit(1)
      .maybeSingle();

    if (!existingProfile) {
      const { id: _id, ...profilePayload } = FALLBACK_PROFILE;
      void _id;
      const { error } = await supabase.from("profile").insert(profilePayload);
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    // 2. Projects — upsert by slug, ignore existing
    const projectRows = FALLBACK_PROJECTS.map(({ id: _id, ...rest }) => {
      void _id;
      return rest;
    });
    const { error: projectsError } = await supabase
      .from("projects")
      .upsert(projectRows, { onConflict: "slug", ignoreDuplicates: true });
    if (projectsError) {
      return NextResponse.json({ error: projectsError.message }, { status: 500 });
    }

    // 3. Tech Capabilities — upsert by category_key, ignore existing
    const capabilityRows = FALLBACK_CAPABILITIES.map(({ id: _id, ...rest }) => {
      void _id;
      return rest;
    });
    const { error: capError } = await supabase
      .from("tech_capabilities")
      .upsert(capabilityRows, {
        onConflict: "category_key",
        ignoreDuplicates: true,
      });
    if (capError) {
      return NextResponse.json({ error: capError.message }, { status: 500 });
    }

    // 4. Experiences — insert only if table is empty
    const { count: expCount } = await supabase
      .from("experiences")
      .select("id", { count: "exact", head: true });

    if (!expCount || expCount === 0) {
      const expRows = FALLBACK_EXPERIENCES.map(({ id: _id, ...rest }) => {
        void _id;
        return rest;
      });
      const { error: expError } = await supabase
        .from("experiences")
        .insert(expRows);
      if (expError) {
        return NextResponse.json({ error: expError.message }, { status: 500 });
      }
    }

    // Fetch updated datasets to return to Admin UI
    const [projectsRes, capabilitiesRes, experiencesRes] = await Promise.all([
      supabase
        .from("projects")
        .select("*")
        .order("sort_order", { ascending: true }),
      supabase
        .from("tech_capabilities")
        .select("*")
        .order("sort_order", { ascending: true }),
      supabase
        .from("experiences")
        .select("*")
        .order("sort_order", { ascending: true }),
    ]);

    revalidatePath("/");
    revalidatePath("/cv");
    revalidatePath("/projects/[slug]", "page");

    return NextResponse.json({
      ok: true,
      projects: projectsRes.data ?? [],
      capabilities: capabilitiesRes.data ?? [],
      experiences: experiencesRes.data ?? [],
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to seed initial portfolio data." },
      { status: 500 }
    );
  }
}
