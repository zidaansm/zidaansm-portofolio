import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/admin-auth";
import { galleryImageSchema, projectSchema } from "@/lib/validators";
import { z } from "zod";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  const { id } = await context.params;

  try {
    const body = await request.json();
    const parsed = projectSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid project payload" },
        { status: 400 }
      );
    }

    const { data, error } = await auth.supabase
      .from("projects")
      .update(parsed.data)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidatePath("/");
    revalidatePath(`/projects/${data.slug}`);
    revalidatePath("/cv");
    return NextResponse.json({ project: data });
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  const { id } = await context.params;

  try {
    const body = (await request.json()) as {
      cover_image_url?: string | null;
      gallery_images?: unknown;
    };

    const updateFields: Record<string, unknown> = {};

    if ("cover_image_url" in body) {
      updateFields.cover_image_url =
        typeof body.cover_image_url === "string" &&
        body.cover_image_url.trim().length > 0
          ? body.cover_image_url.trim()
          : null;
    }

    if ("gallery_images" in body) {
      const parsedGallery = z
        .array(galleryImageSchema)
        .max(20)
        .safeParse(body.gallery_images);
      if (!parsedGallery.success) {
        return NextResponse.json(
          { error: parsedGallery.error.issues[0]?.message || "Invalid gallery payload" },
          { status: 400 }
        );
      }
      updateFields.gallery_images = parsedGallery.data;
    }

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json(
        { error: "No supported fields provided for update" },
        { status: 400 }
      );
    }

    const { data, error } = await auth.supabase
      .from("projects")
      .update(updateFields)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidatePath("/");
    revalidatePath(`/projects/${data.slug}`);
    return NextResponse.json({ project: data });
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  const { id } = await context.params;

  const { error } = await auth.supabase.from("projects").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath("/");
  revalidatePath("/projects/[slug]", "page");
  revalidatePath("/cv");
  return NextResponse.json({ ok: true });
}
