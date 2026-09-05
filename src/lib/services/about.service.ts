import { createClient } from "@/lib/supabase/server";
import { readImageDimensions } from "@/lib/image-dimensions";
import { ABOUT_FALLBACK } from "@/data/about";
import type { AboutContent, AboutRow, AboutStat } from "@/types/about";

const ABOUT_IMAGES_BUCKET = "about-images";

/** The single row the table is allowed to hold. */
const ABOUT_ROW_ID = 1;

export type AboutInput = {
  eyebrow: string;
  heading: string;
  intro: string;
  paragraphs: string[];
  stats: AboutStat[];
  image_alt: string | null;
};

/** The stored row, or null while the site is still on the checked-in copy. */
export async function getAboutRow(): Promise<AboutRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("about_content")
    .select("*")
    .eq("id", ABOUT_ROW_ID)
    .maybeSingle();

  if (error) {
    console.error("getAboutRow failed:", error.message);
    return null;
  }

  return data;
}

/**
 * What the About Us page and the home page's brand statement render.
 *
 * Every field falls back on its own rather than the row as a whole, so a save
 * that leaves the photograph alone keeps showing the checked-in one instead of
 * dropping to a gap.
 */
export async function getAboutContent(): Promise<AboutContent> {
  return toAboutContent(await getAboutRow());
}

export function toAboutContent(row: AboutRow | null): AboutContent {
  const fallback = ABOUT_FALLBACK;

  return {
    eyebrow: row?.eyebrow?.trim() || fallback.eyebrow,
    heading: row?.heading?.trim() || fallback.heading,
    intro: row?.intro?.trim() || fallback.intro,
    paragraphs: row?.paragraphs?.length ? row.paragraphs : fallback.paragraphs,
    stats: row?.stats?.length ? row.stats : fallback.stats,
    showroom:
      row?.image_url && row.image_width && row.image_height
        ? {
            src: row.image_url,
            alt: row.image_alt?.trim() || fallback.showroom.alt,
            width: row.image_width,
            height: row.image_height,
          }
        : fallback.showroom,
  };
}

/**
 * Writes the one row, uploading a replacement photograph first when one was
 * picked. The previous file is only removed once the row points at the new one,
 * so a failed write never leaves the page with a missing image.
 */
export async function saveAbout(
  input: AboutInput,
  image?: File | null
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const existing = await getAboutRow();

  let imageFields: Partial<AboutRow> = {};

  if (image) {
    const uploaded = await uploadAboutImage(image);
    if (!uploaded.url) return { error: uploaded.error };
    imageFields = {
      image_url: uploaded.url,
      image_path: uploaded.path,
      image_width: uploaded.width,
      image_height: uploaded.height,
    };
  }

  const { error } = await supabase
    .from("about_content")
    .upsert({ id: ABOUT_ROW_ID, ...input, ...imageFields });

  if (error) {
    console.error("saveAbout failed:", error.message);
    if (imageFields.image_path) await removeAboutImage(imageFields.image_path);
    return { error: error.message };
  }

  if (image && existing?.image_path) await removeAboutImage(existing.image_path);

  return {};
}

type AboutImageUpload =
  | { url: string; path: string; width: number; height: number; error?: never }
  | { url: null; path: null; width: null; height: null; error: string };

async function uploadAboutImage(file: File): Promise<AboutImageUpload> {
  const failed = (error: string): AboutImageUpload => ({
    url: null,
    path: null,
    width: null,
    height: null,
    error,
  });

  if (!file.type.startsWith("image/")) return failed("That file is not an image.");

  // The dimensions are read here rather than in the browser because a Server
  // Action is reachable without one, and `next/image` cannot render the photo
  // without them.
  const dimensions = readImageDimensions(new Uint8Array(await file.arrayBuffer()));
  if (!dimensions) {
    return failed("That image could not be read — try a JPG, PNG or WebP.");
  }

  const supabase = await createClient();
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const storagePath = `${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage
    .from(ABOUT_IMAGES_BUCKET)
    .upload(storagePath, file, { contentType: file.type, upsert: false });

  if (error) {
    console.error("uploadAboutImage failed:", error.message);
    return failed(error.message);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(ABOUT_IMAGES_BUCKET).getPublicUrl(storagePath);

  return { url: publicUrl, path: storagePath, ...dimensions };
}

async function removeAboutImage(storagePath: string): Promise<void> {
  const supabase = await createClient();
  await supabase.storage.from(ABOUT_IMAGES_BUCKET).remove([storagePath]);
}
