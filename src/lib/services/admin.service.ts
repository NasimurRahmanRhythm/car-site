import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
import type { Database } from "@/types/database";
import type { CarWithImages } from "@/types/car";

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
