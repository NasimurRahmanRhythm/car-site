import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
import type { Database } from "@/types/database";
import type { CarWithImages } from "@/types/car";
import type { NewsPost } from "@/types/news";

export type CarInput = Database["public"]["Tables"]["cars"]["Insert"];
export type CarUpdate = Database["public"]["Tables"]["cars"]["Update"];

const CAR_IMAGES_BUCKET = "car-images";

/**
 * Removes files from a bucket, logging rather than throwing on failure — by
 * the time this runs the database row is already gone, so there is nothing to
 * roll back, but an orphaned file should at least leave a trace.
 */
async function removeFromStorage(bucket: string, paths: string[]): Promise<void> {
  if (paths.length === 0) return;
  const supabase = await createClient();
  const { error } = await supabase.storage.from(bucket).remove(paths);
  if (error) console.error(`Storage cleanup in "${bucket}" failed:`, error.message);
}

export async function getAllCarsForAdmin(): Promise<CarWithImages[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cars")
    .select("*, car_images(*)")
    .order("created_at", { ascending: false })
    .order("sort_order", { referencedTable: "car_images", ascending: true });

  if (error) {
    console.error("getAllCarsForAdmin failed:", error.message);
    return [];
  }

  return (data ?? []) as unknown as CarWithImages[];
}

export async function getCarForAdmin(id: string): Promise<CarWithImages | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cars")
    .select("*, car_images(*)")
    .eq("id", id)
    .order("sort_order", { referencedTable: "car_images", ascending: true })
    .maybeSingle();

  if (error) {
    console.error("getCarForAdmin failed:", error.message);
    return null;
  }

  return data as unknown as CarWithImages | null;
}

async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  const supabase = await createClient();
  const root = slugify(base);
  let candidate = root;
  let suffix = 2;

  for (;;) {
    let query = supabase.from("cars").select("id").eq("slug", candidate);
    if (excludeId) query = query.neq("id", excludeId);
    const { data } = await query.maybeSingle();
    if (!data) return candidate;
    candidate = `${root}-${suffix}`;
    suffix += 1;
  }
}

export async function createCar(
  input: Omit<CarInput, "slug"> & { slug?: string }
): Promise<{ car: CarWithImages | null; error?: string }> {
  const supabase = await createClient();
  const slug = await uniqueSlug(input.slug || `${input.year}-${input.make}-${input.model}`);

  const { data, error } = await supabase
    .from("cars")
    .insert({ ...input, slug })
    .select("*, car_images(*)")
    .single();

  if (error) {
    console.error("createCar failed:", error.message);
    return { car: null, error: error.message };
  }

  return { car: data as unknown as CarWithImages };
}

export async function updateCar(
  id: string,
  input: CarUpdate
): Promise<{ car: CarWithImages | null; error?: string }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("cars")
    .update(input)
    .eq("id", id)
    .select("*, car_images(*)")
    .single();

  if (error) {
    console.error("updateCar failed:", error.message);
    return { car: null, error: error.message };
  }

  return { car: data as unknown as CarWithImages };
}

export async function deleteCar(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { data: images } = await supabase
    .from("car_images")
    .select("storage_path")
    .eq("car_id", id);

  const { error } = await supabase.from("cars").delete().eq("id", id);

  if (error) {
    console.error("deleteCar failed:", error.message);
    return { success: false, error: error.message };
  }

  // Only once the row (and, by cascade, its image rows) is gone — otherwise a
  // failed delete would leave the car pointing at files that no longer exist.
  await removeFromStorage(
    CAR_IMAGES_BUCKET,
    (images ?? []).map((img) => img.storage_path)
  );

  return { success: true };
}

export async function uploadCarImage(
  carId: string,
  file: File,
  options: { isCover?: boolean; sortOrder?: number } = {}
): Promise<{ image: CarWithImages["car_images"][number] | null; error?: string }> {
  const supabase = await createClient();
  const extension = file.name.split(".").pop() || "jpg";
  const storagePath = `${carId}/${crypto.randomUUID()}.${extension}`;

  // What the car already has decides where this one lands: the very first
  // image becomes the cover (otherwise a car could sit there with photos and
  // no cover, leaving every thumbnail to an arbitrary fallback), and the rest
  // queue up behind it in upload order.
  const { data: existing } = await supabase
    .from("car_images")
    .select("id, is_cover")
    .eq("car_id", carId);

  const existingCount = existing?.length ?? 0;
  const hasCover = existing?.some((image) => image.is_cover) ?? false;

  const { error: uploadError } = await supabase.storage
    .from(CAR_IMAGES_BUCKET)
    .upload(storagePath, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    console.error("uploadCarImage storage failed:", uploadError.message);
    return { image: null, error: uploadError.message };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(CAR_IMAGES_BUCKET).getPublicUrl(storagePath);

  const { data, error } = await supabase
    .from("car_images")
    .insert({
      car_id: carId,
      url: publicUrl,
      storage_path: storagePath,
      is_cover: options.isCover ?? !hasCover,
      sort_order: options.sortOrder ?? existingCount,
    })
    .select()
    .single();

  if (error) {
    console.error("uploadCarImage row insert failed:", error.message);
    await supabase.storage.from(CAR_IMAGES_BUCKET).remove([storagePath]);
    return { image: null, error: error.message };
  }

  return { image: data };
}

export async function deleteCarImage(
  imageId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  // The storage path is read from the row rather than taken from the caller,
  // so a request can only ever delete the file that belongs to this image.
  const { data: image } = await supabase
    .from("car_images")
    .select("car_id, storage_path, is_cover")
    .eq("id", imageId)
    .maybeSingle();

  if (!image) return { success: false, error: "Image not found." };

  const { error } = await supabase.from("car_images").delete().eq("id", imageId);

  if (error) {
    console.error("deleteCarImage failed:", error.message);
    return { success: false, error: error.message };
  }

  await removeFromStorage(CAR_IMAGES_BUCKET, [image.storage_path]);

  // Losing the cover would leave the car without a thumbnail, so the next
  // photo in line takes over.
  if (image.is_cover) {
    const { data: next } = await supabase
      .from("car_images")
      .select("id")
      .eq("car_id", image.car_id)
      .order("sort_order", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (next) await supabase.from("car_images").update({ is_cover: true }).eq("id", next.id);
  }

  return { success: true };
}

export interface InventoryPhoto {
  id: string;
  url: string;
  is_cover: boolean;
  car: { id: string; year: number; make: string; model: string } | null;
}

/** Every photo attached to a vehicle, newest first, for the admin gallery. */
export async function getInventoryPhotosForAdmin(): Promise<InventoryPhoto[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("car_images")
    .select("id, url, is_cover, cars(id, year, make, model)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getInventoryPhotosForAdmin failed:", error.message);
    return [];
  }

  const rows = (data ?? []) as unknown as (Omit<InventoryPhoto, "car"> & {
    cars: InventoryPhoto["car"];
  })[];

  return rows.map(({ cars, ...photo }) => ({ ...photo, car: cars }));
}

export async function setCoverImage(
  carId: string,
  imageId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  await supabase.from("car_images").update({ is_cover: false }).eq("car_id", carId);
  const { error } = await supabase
    .from("car_images")
    .update({ is_cover: true })
    .eq("id", imageId);

  if (error) {
    console.error("setCoverImage failed:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/* ------------------------------------------------------------------ News */

const NEWS_IMAGES_BUCKET = "news-images";

export type NewsInput = Database["public"]["Tables"]["news"]["Insert"];

export async function getAllNewsForAdmin(): Promise<NewsPost[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("news")
    .select("*")
    .order("published_at", { ascending: false });

  if (error) {
    console.error("getAllNewsForAdmin failed:", error.message);
    return [];
  }

  return data ?? [];
}

export async function getNewsForAdmin(id: string): Promise<NewsPost | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("news")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("getNewsForAdmin failed:", error.message);
    return null;
  }

  return data;
}

async function uniqueNewsSlug(base: string, excludeId?: string): Promise<string> {
  const supabase = await createClient();
  const root = slugify(base) || "news";
  let candidate = root;
  let suffix = 2;

  for (;;) {
    let query = supabase.from("news").select("id").eq("slug", candidate);
    if (excludeId) query = query.neq("id", excludeId);
    const { data } = await query.maybeSingle();
    if (!data) return candidate;
    candidate = `${root}-${suffix}`;
    suffix += 1;
  }
}

type NewsImageUpload =
  | { url: string; path: string; error?: never }
  | { url: null; path: null; error: string };

async function uploadNewsImage(file: File): Promise<NewsImageUpload> {
  const supabase = await createClient();
  const extension = file.name.split(".").pop() || "jpg";
  const storagePath = `${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage
    .from(NEWS_IMAGES_BUCKET)
    .upload(storagePath, file, { contentType: file.type, upsert: false });

  if (error) {
    console.error("uploadNewsImage failed:", error.message);
    return { url: null, path: null, error: error.message };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(NEWS_IMAGES_BUCKET).getPublicUrl(storagePath);

  return { url: publicUrl, path: storagePath };
}

/** Images and videos share the bucket, so this removes either. */
async function removeNewsImage(storagePath: string | null): Promise<void> {
  if (!storagePath) return;
  await removeFromStorage(NEWS_IMAGES_BUCKET, [storagePath]);
}

/**
 * The row fields for a video the admin's browser already put in the bucket.
 * Only the path comes from the client; the URL is derived here.
 */
async function newsVideoFields(
  videoPath: string
): Promise<Pick<NewsInput, "video_url" | "video_path">> {
  const supabase = await createClient();
  const { data } = supabase.storage.from(NEWS_IMAGES_BUCKET).getPublicUrl(videoPath);
  return { video_url: data.publicUrl, video_path: videoPath };
}

export async function createNews(
  input: Omit<NewsInput, "slug">,
  image?: File | null,
  /** Storage path of a video already uploaded from the browser. */
  videoPath?: string | null
): Promise<{ post: NewsPost | null; error?: string }> {
  const supabase = await createClient();
  const slug = await uniqueNewsSlug(input.title);

  let imageFields: Pick<NewsInput, "image_url" | "image_path"> = {};
  if (image) {
    const uploaded = await uploadNewsImage(image);
    if (!uploaded.url) {
      await removeNewsImage(videoPath ?? null);
      return { post: null, error: uploaded.error };
    }
    imageFields = { image_url: uploaded.url, image_path: uploaded.path };
  }

  const videoFields = videoPath ? await newsVideoFields(videoPath) : {};

  const { data, error } = await supabase
    .from("news")
    .insert({ ...input, ...imageFields, ...videoFields, slug })
    .select()
    .single();

  if (error) {
    console.error("createNews failed:", error.message);
    await removeNewsImage(imageFields.image_path ?? null);
    await removeNewsImage(videoPath ?? null);
    return { post: null, error: error.message };
  }

  return { post: data };
}

export async function updateNews(
  id: string,
  input: Omit<NewsInput, "slug">,
  image?: File | null,
  /** Drop the current image without replacing it. Ignored when `image` is set. */
  removeImage = false,
  /** Storage path of a replacement video already uploaded from the browser. */
  videoPath?: string | null,
  /** Drop the current video without replacing it. Ignored when `videoPath` is set. */
  removeVideo = false
): Promise<{ post: NewsPost | null; error?: string }> {
  const supabase = await createClient();
  const existing = await getNewsForAdmin(id);
  if (!existing) {
    await removeNewsImage(videoPath ?? null);
    return { post: null, error: "Post not found." };
  }

  const slug = await uniqueNewsSlug(input.title, id);

  let imageFields: Pick<NewsInput, "image_url" | "image_path"> = {};
  if (image) {
    const uploaded = await uploadNewsImage(image);
    if (!uploaded.url) {
      await removeNewsImage(videoPath ?? null);
      return { post: null, error: uploaded.error };
    }
    imageFields = { image_url: uploaded.url, image_path: uploaded.path };
  } else if (removeImage) {
    imageFields = { image_url: null, image_path: null };
  }
  const replacesImage = Boolean(image) || removeImage;

  let videoFields: Pick<NewsInput, "video_url" | "video_path"> = {};
  if (videoPath) videoFields = await newsVideoFields(videoPath);
  else if (removeVideo) videoFields = { video_url: null, video_path: null };
  const replacesVideo = Boolean(videoPath) || removeVideo;

  const { data, error } = await supabase
    .from("news")
    .update({ ...input, ...imageFields, ...videoFields, slug })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("updateNews failed:", error.message);
    await removeNewsImage(imageFields.image_path ?? null);
    await removeNewsImage(videoPath ?? null);
    return { post: null, error: error.message };
  }

  // Only drop the old file once the row is safely pointing at the new one.
  if (replacesImage) await removeNewsImage(existing.image_path);
  if (replacesVideo) await removeNewsImage(existing.video_path);

  return { post: data };
}

export async function deleteNews(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const existing = await getNewsForAdmin(id);

  const { error } = await supabase.from("news").delete().eq("id", id);

  if (error) {
    console.error("deleteNews failed:", error.message);
    return { success: false, error: error.message };
  }

  await removeNewsImage(existing?.image_path ?? null);
  await removeNewsImage(existing?.video_path ?? null);
  return { success: true };
}
