import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/admin-auth";

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);
const ALLOWED_CV_TYPES = new Set(["application/pdf"]);
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB
const MAX_PDF_BYTES = 10 * 1024 * 1024; // 10MB
const BUCKET_NAME = "portfolio-media";

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const folderRaw = String(formData.get("folder") || "general");
    const folder = ["profile", "projects", "cv"].includes(folderRaw)
      ? folderRaw
      : "general";

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "No file provided." },
        { status: 400 }
      );
    }

    const isCvUpload = folder === "cv";
    const allowedTypes = isCvUpload ? ALLOWED_CV_TYPES : ALLOWED_IMAGE_TYPES;
    const maxBytes = isCvUpload ? MAX_PDF_BYTES : MAX_IMAGE_BYTES;

    if (!allowedTypes.has(file.type)) {
      return NextResponse.json(
        {
          error: isCvUpload
            ? "Unsupported format. Please upload a PDF file (.pdf)."
            : "Unsupported format. Use JPG, PNG, WebP, or AVIF.",
        },
        { status: 400 }
      );
    }

    if (file.size > maxBytes) {
      return NextResponse.json(
        {
          error: isCvUpload
            ? "PDF file is too large. Maximum size is 10MB."
            : "Image is too large. Maximum size is 5MB.",
        },
        { status: 400 }
      );
    }

    const defaultExt = isCvUpload ? "pdf" : "jpg";
    const ext =
      (isCvUpload
        ? "pdf"
        : file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "")) ||
      defaultExt;
    const safeBase =
      file.name
        .replace(/\.[^/.]+$/, "")
        .toLowerCase()
        .replace(/[^a-z0-9-_]/g, "-")
        .slice(0, 40) || (isCvUpload ? "cv" : "image");
    const filePath = `${folder}/${Date.now()}-${safeBase}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const { error: uploadError } = await auth.supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, arrayBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json(
        {
          error: `Upload failed (${uploadError.message}). Make sure the '${BUCKET_NAME}' storage bucket SQL policy has been applied.`,
        },
        { status: 500 }
      );
    }

    const { data: publicData } = auth.supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return NextResponse.json({ url: publicData.publicUrl });
  } catch {
    return NextResponse.json(
      { error: "Failed to process file upload." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const body = (await request.json()) as { url?: string | null };
    const url = body.url?.trim();

    if (!url) {
      return NextResponse.json({ ok: true, deletedFromStorage: false });
    }

    const marker = `/storage/v1/object/public/${BUCKET_NAME}/`;
    const markerIndex = url.indexOf(marker);

    if (markerIndex === -1) {
      return NextResponse.json({ ok: true, deletedFromStorage: false });
    }

    const storagePath = decodeURIComponent(
      url.slice(markerIndex + marker.length).split("?")[0]
    );

    if (!storagePath) {
      return NextResponse.json({ ok: true, deletedFromStorage: false });
    }

    const { error } = await auth.supabase.storage
      .from(BUCKET_NAME)
      .remove([storagePath]);

    if (error) {
      return NextResponse.json(
        { error: `Failed to delete file from storage: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, deletedFromStorage: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to process delete request." },
      { status: 400 }
    );
  }
}
