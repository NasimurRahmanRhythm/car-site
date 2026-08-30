import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
import type { Database } from "@/types/database";
import type { CarWithImages } from "@/types/car";
import type { NewsPost } from "@/types/news";
import type { Appointment, AppointmentStatus } from "@/types/appointment";

export type CarInput = Database["public"]["Tables"]["cars"]["Insert"];
export type CarUpdate = Database["public"]["Tables"]["cars"]["Update"];

const CAR_IMAGES_BUCKET = "car-images";

export async function getAllCarsForAdmin(): Promise<CarWithImages[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cars")
    .select("*, car_images(*)")
    .order("created_at", { ascending: false });

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

  if (images && images.length > 0) {
    await supabase.storage
      .from(CAR_IMAGES_BUCKET)
      .remove(images.map((img) => img.storage_path));
  }

  const { error } = await supabase.from("cars").delete().eq("id", id);

  if (error) {
    console.error("deleteCar failed:", error.message);
    return { success: false, error: error.message };
  }

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
      is_cover: options.isCover ?? false,
      sort_order: options.sortOrder ?? 0,
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
  imageId: string,
  storagePath: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  await supabase.storage.from(CAR_IMAGES_BUCKET).remove([storagePath]);
  const { error } = await supabase.from("car_images").delete().eq("id", imageId);

  if (error) {
    console.error("deleteCarImage failed:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
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

async function removeNewsImage(storagePath: string | null): Promise<void> {
  if (!storagePath) return;
  const supabase = await createClient();
  await supabase.storage.from(NEWS_IMAGES_BUCKET).remove([storagePath]);
}

export async function createNews(
  input: Omit<NewsInput, "slug">,
  image?: File | null
): Promise<{ post: NewsPost | null; error?: string }> {
  const supabase = await createClient();
  const slug = await uniqueNewsSlug(input.title);

  let imageFields: Pick<NewsInput, "image_url" | "image_path"> = {};
  if (image) {
    const uploaded = await uploadNewsImage(image);
    if (!uploaded.url) return { post: null, error: uploaded.error };
    imageFields = { image_url: uploaded.url, image_path: uploaded.path };
  }

  const { data, error } = await supabase
    .from("news")
    .insert({ ...input, ...imageFields, slug })
    .select()
    .single();

  if (error) {
    console.error("createNews failed:", error.message);
    await removeNewsImage(imageFields.image_path ?? null);
    return { post: null, error: error.message };
  }

  return { post: data };
}

export async function updateNews(
  id: string,
  input: Omit<NewsInput, "slug">,
  image?: File | null
): Promise<{ post: NewsPost | null; error?: string }> {
  const supabase = await createClient();
  const existing = await getNewsForAdmin(id);
  if (!existing) return { post: null, error: "Post not found." };

  const slug = await uniqueNewsSlug(input.title, id);

  let imageFields: Pick<NewsInput, "image_url" | "image_path"> = {};
  if (image) {
    const uploaded = await uploadNewsImage(image);
    if (!uploaded.url) return { post: null, error: uploaded.error };
    imageFields = { image_url: uploaded.url, image_path: uploaded.path };
  }

  const { data, error } = await supabase
    .from("news")
    .update({ ...input, ...imageFields, slug })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("updateNews failed:", error.message);
    await removeNewsImage(imageFields.image_path ?? null);
    return { post: null, error: error.message };
  }

  // Only drop the old file once the row is safely pointing at the new one.
  if (image) await removeNewsImage(existing.image_path);

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
  return { success: true };
}

/* ---------------------------------------------------------- Appointments */

export async function getAllAppointments(): Promise<Appointment[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getAllAppointments failed:", error.message);
    return [];
  }

  return data ?? [];
}

export async function setAppointmentStatus(
  id: string,
  status: AppointmentStatus
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("appointments").update({ status }).eq("id", id);

  if (error) {
    console.error("setAppointmentStatus failed:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function deleteAppointment(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("appointments").delete().eq("id", id);

  if (error) {
    console.error("deleteAppointment failed:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}
