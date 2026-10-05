import { createClient } from "@/lib/supabase/server";
import { getGalleryImages } from "@/lib/services/car.service";
import { carDisplayName } from "@/lib/utils";
import { youtubeThumbnailUrl, youtubeWatchUrl } from "@/lib/youtube";
import type { GalleryEntry, GalleryItem } from "@/types/gallery";

export const GALLERY_BUCKET = "gallery";

/** Where the gallery first kept its files — rows from then still point there. */
const LEGACY_GALLERY_BUCKET = "gallery-media";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

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
 * Everything the gallery page shows: the media added to the gallery itself,
 * then the shuffled pool of vehicle photos behind it.
 *
 * Gallery media leads because it is the deliberate choice — a vehicle photo
 * ends up here as a side effect of listing the car.
 */
export async function getGalleryEntries(carImageLimit = 60): Promise<GalleryEntry[]> {
  const [items, carImages] = await Promise.all([
    getGalleryItems(),
    getGalleryImages(carImageLimit),
  ]);

  const uploaded: GalleryEntry[] = items.map((item) => ({
    id: item.id,
    kind: item.kind,
    url: item.url,
    poster: item.thumbnail_url,
    caption: item.title,
    alt: item.title ?? "VIP Motors gallery",
    href: null,
  }));

  const fromInventory: GalleryEntry[] = carImages.map((image) => {
    const name = image.car ? carDisplayName(image.car) : null;
    return {
      id: image.id,
      kind: "image" as const,
      url: image.url,
      poster: null,
      caption: name,
      alt: image.alt ?? name ?? "Vehicle photograph",
      href: image.car ? `/inventory/${image.car.slug}` : null,
    };
  });

  return [...uploaded, ...fromInventory];
}

/**
 * New media goes to the front of the gallery, which is where an admin who
 * just added it expects to find it.
 */
async function frontSortOrder(supabase: SupabaseServerClient): Promise<number> {
  const { data: first } = await supabase
    .from("gallery_items")
    .select("sort_order")
    .order("sort_order", { ascending: true })
    .limit(1)
    .maybeSingle();

  return (first?.sort_order ?? 0) - 1;
}

/**
 * Records a file the admin's browser has already put in the bucket. Only the
 * storage paths come from the client — the public URLs are derived here, so a
 * row can never point anywhere but this bucket.
 */
export async function addGalleryMedia(input: {
  kind: "image" | "video";
  storagePath: string;
  thumbnailPath?: string | null;
  title?: string | null;
}): Promise<{ error?: string }> {
  const supabase = await createClient();
  const bucket = supabase.storage.from(GALLERY_BUCKET);

  const { data: file } = bucket.getPublicUrl(input.storagePath);
  const thumbnailUrl = input.thumbnailPath
    ? bucket.getPublicUrl(input.thumbnailPath).data.publicUrl
    : null;

  const { error } = await supabase.from("gallery_items").insert({
    kind: input.kind,
    url: file.publicUrl,
    storage_path: input.storagePath,
    thumbnail_url: thumbnailUrl,
    thumbnail_path: input.thumbnailPath ?? null,
    title: input.title ?? null,
    sort_order: await frontSortOrder(supabase),
  });

  if (error) {
    console.error("addGalleryMedia failed:", error.message);
    // Nothing points at the uploaded files any more, so don't leave them behind.
    await bucket.remove(
      [input.storagePath, input.thumbnailPath].filter((path): path is string => Boolean(path))
    );
    return { error: error.message };
  }

  return {};
}

export async function addGalleryYoutube(
  youtubeId: string,
  title: string | null
): Promise<{ error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase.from("gallery_items").insert({
    kind: "youtube",
    url: youtubeWatchUrl(youtubeId),
    youtube_id: youtubeId,
    thumbnail_url: youtubeThumbnailUrl(youtubeId),
    title,
    sort_order: await frontSortOrder(supabase),
  });

  if (error) {
    console.error("addGalleryYoutube failed:", error.message);
    return { error: error.message };
  }

  return {};
}

export async function updateGalleryCaption(
  id: string,
  caption: string | null
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("gallery_items").update({ title: caption }).eq("id", id);

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
    .select("url, storage_path, thumbnail_path")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("gallery_items").delete().eq("id", id);

  if (error) {
    console.error("deleteGalleryItem failed:", error.message);
    return { error: error.message };
  }

  const paths = [item?.storage_path, item?.thumbnail_path].filter(
    (path): path is string => Boolean(path)
  );
  if (item && paths.length > 0) {
    const bucket = item.url.includes(`/${LEGACY_GALLERY_BUCKET}/`)
      ? LEGACY_GALLERY_BUCKET
      : GALLERY_BUCKET;
    const { error: storageError } = await supabase.storage.from(bucket).remove(paths);
    if (storageError) {
      console.error("deleteGalleryItem storage cleanup failed:", storageError.message);
    }
  }

  return {};
}
