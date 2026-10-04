import { createClient } from "@/lib/supabase/server";
import { youtubeThumbnailUrl, youtubeWatchUrl } from "@/lib/youtube";
import type { GalleryItem } from "@/types/gallery";

export const GALLERY_BUCKET = "gallery";

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
  });

  if (error) {
    console.error("addGalleryYoutube failed:", error.message);
    return { error: error.message };
  }

  return {};
}

export async function deleteGalleryItem(id: string): Promise<{ error?: string }> {
  const supabase = await createClient();

  const { data: item } = await supabase
    .from("gallery_items")
    .select("storage_path, thumbnail_path")
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
  if (paths.length > 0) {
    const { error: storageError } = await supabase.storage.from(GALLERY_BUCKET).remove(paths);
    if (storageError) {
      console.error("deleteGalleryItem storage cleanup failed:", storageError.message);
    }
  }

  return {};
}
