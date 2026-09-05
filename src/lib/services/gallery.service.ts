import { createClient } from "@/lib/supabase/server";
import { getGalleryImages } from "@/lib/services/car.service";
import { carDisplayName } from "@/lib/utils";
import type { GalleryEntry, GalleryItem, GalleryMediaType } from "@/types/gallery";

const GALLERY_BUCKET = "gallery-media";

/** Uploaded gallery media, newest first within the manual ordering. */
export async function getGalleryItems(): Promise<GalleryItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("gallery_items")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getGalleryItems failed:", error.message);
    return [];
  }

  return data ?? [];
}

/**
 * Everything the gallery page shows: the media uploaded for the gallery
 * itself, then the shuffled pool of vehicle photos behind it.
 *
 * Uploaded media leads because it is the deliberate choice — a vehicle photo
 * ends up here as a side effect of listing the car.
 */
export async function getGalleryEntries(carImageLimit = 60): Promise<GalleryEntry[]> {
  const [items, carImages] = await Promise.all([
    getGalleryItems(),
    getGalleryImages(carImageLimit),
  ]);

  const uploaded: GalleryEntry[] = items.map((item) => ({
    id: item.id,
    kind: item.media_type,
    url: item.url,
    caption: item.caption,
    alt: item.caption ?? "VIP Motors gallery",
    href: null,
  }));

  const fromInventory: GalleryEntry[] = carImages.map((image) => {
    const name = image.car ? carDisplayName(image.car) : null;
    return {
      id: image.id,
      kind: "image" as const,
      url: image.url,
      caption: name,
      alt: image.alt ?? name ?? "Vehicle photograph",
      href: image.car ? `/inventory/${image.car.slug}` : null,
    };
  });

  return [...uploaded, ...fromInventory];
}

/**
 * Adds one file to the gallery. The row is written only once the upload lands,
 * and the file is swept back out if the row fails — otherwise a failed insert
 * would leave an orphan in the bucket that nothing points at.
 */
export async function addGalleryItem(
  file: File,
  caption: string | null
): Promise<{ item?: GalleryItem; error?: string }> {
  const mediaType = mediaTypeOf(file);
  if (!mediaType) return { error: `${file.name} is not an image or a video.` };

  const supabase = await createClient();
  const extension = file.name.split(".").pop()?.toLowerCase() || (mediaType === "image" ? "jpg" : "mp4");
  const storagePath = `${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(GALLERY_BUCKET)
    .upload(storagePath, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    console.error("addGalleryItem storage failed:", uploadError.message);
    return { error: uploadError.message };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(GALLERY_BUCKET).getPublicUrl(storagePath);

  // New media goes to the front of the gallery, which is where an admin who
  // just uploaded it expects to find it.
  const { data: first } = await supabase
    .from("gallery_items")
    .select("sort_order")
    .order("sort_order", { ascending: true })
    .limit(1)
    .maybeSingle();

  const { data, error } = await supabase
    .from("gallery_items")
    .insert({
      media_type: mediaType,
      url: publicUrl,
      storage_path: storagePath,
      caption,
      sort_order: (first?.sort_order ?? 0) - 1,
    })
    .select()
    .single();

  if (error) {
    console.error("addGalleryItem row insert failed:", error.message);
    await supabase.storage.from(GALLERY_BUCKET).remove([storagePath]);
    return { error: error.message };
  }

  return { item: data };
}

export async function updateGalleryCaption(
  id: string,
  caption: string | null
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("gallery_items").update({ caption }).eq("id", id);

  if (error) {
    console.error("updateGalleryCaption failed:", error.message);
    return { error: error.message };
  }

  return {};
}

export async function deleteGalleryItem(id: string): Promise<{ error?: string }> {
  const supabase = await createClient();

  const { data: item } = await supabase
    .from("gallery_items")
    .select("storage_path")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("gallery_items").delete().eq("id", id);

  if (error) {
    console.error("deleteGalleryItem failed:", error.message);
    return { error: error.message };
  }

  if (item) await supabase.storage.from(GALLERY_BUCKET).remove([item.storage_path]);

  return {};
}

function mediaTypeOf(file: File): GalleryMediaType | null {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  return null;
}
