"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createCar,
  updateCar,
  deleteCar,
  uploadCarImage,
  deleteCarImage,
  setCoverImage,
  type CarInput,
} from "@/lib/services/admin.service";
import {
  addScene,
  deleteScene,
  setDefaultScene,
  addHotspot,
  deleteHotspot,
} from "@/lib/services/showroom.service";
import { DEFAULT_CURRENCY } from "@/lib/utils";
import type { CarCategory, CarStatus } from "@/types/car";

function toOptionalString(formData: FormData, key: string): string | null {
  const value = String(formData.get(key) ?? "").trim();
  return value ? value : null;
}

function toOptionalNumber(formData: FormData, key: string): number | null {
  const value = String(formData.get(key) ?? "").trim();
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseCarInput(formData: FormData): Omit<CarInput, "slug"> {
  const featuresRaw = String(formData.get("features") ?? "");
  const features = featuresRaw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const categories = formData.getAll("categories") as CarCategory[];

  return {
    make: String(formData.get("make") ?? "").trim(),
    model: String(formData.get("model") ?? "").trim(),
    year: Number(formData.get("year")),
    trim: toOptionalString(formData, "trim"),
    price: Number(formData.get("price")),
    // The form's currency field is fixed, so this only ever sees BDT on a new
    // car or the value the row already had on an edit. Upper-cased so casing
    // cannot fork one code into two.
    currency:
      String(formData.get("currency") ?? DEFAULT_CURRENCY).trim().toUpperCase() ||
      DEFAULT_CURRENCY,
    status: (String(formData.get("status") ?? "available") as CarStatus),
    categories,
    mileage: toOptionalNumber(formData, "mileage"),
    exterior_color: toOptionalString(formData, "exterior_color"),
    interior_color: toOptionalString(formData, "interior_color"),
    transmission: toOptionalString(formData, "transmission"),
    fuel_type: toOptionalString(formData, "fuel_type"),
    engine: toOptionalString(formData, "engine"),
    horsepower: toOptionalNumber(formData, "horsepower"),
    drivetrain: toOptionalString(formData, "drivetrain"),
    body_type: toOptionalString(formData, "body_type"),
    doors: toOptionalNumber(formData, "doors"),
    seats: toOptionalNumber(formData, "seats"),
    vin: toOptionalString(formData, "vin"),
    description: toOptionalString(formData, "description"),
    features,
    is_featured: formData.get("is_featured") === "on",
  };
}

function revalidateEverywhere(carId?: string) {
  revalidatePath("/", "layout");
  revalidatePath("/admin");
  if (carId) revalidatePath(`/admin/cars/${carId}`);
}

/** Files picked in a form, ignoring the empty entry a browser sends for none. */
function pickedFiles(formData: FormData): File[] {
  return formData
    .getAll("files")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);
}

export async function createCarAction(formData: FormData): Promise<void> {
  const input = parseCarInput(formData);
  const { car, error } = await createCar(input);

  if (error || !car) {
    throw new Error(error ?? "Failed to create vehicle.");
  }

  // Photos can only be attached now: both the storage path and the car_images
  // row are keyed by car id, so there is nothing to upload against until the
  // row exists. The first one becomes the cover, matching the form's hint.
  const failures: string[] = [];

  for (const [index, file] of pickedFiles(formData).entries()) {
    const { error: uploadError } = await uploadCarImage(car.id, file, {
      isCover: index === 0,
      sortOrder: index,
    });
    if (uploadError) failures.push(`${file.name} — ${uploadError}`);
  }

  revalidateEverywhere();

  // The vehicle itself saved, so this is not an error page — send them to the
  // edit screen where the uploader is, and say which photos did not make it
  // rather than letting them silently come up short.
  const query =
    failures.length > 0 ? `?imageError=${encodeURIComponent(failures.join(" · "))}` : "";

  redirect(`/admin/cars/${car.id}${query}`);
}

export async function updateCarAction(carId: string, formData: FormData): Promise<void> {
  const input = parseCarInput(formData);
  const { error } = await updateCar(carId, input);

  if (error) {
    throw new Error(error);
  }

  revalidateEverywhere(carId);
  redirect("/admin");
}

export async function deleteCarAction(carId: string): Promise<void> {
  await deleteCar(carId);
  revalidateEverywhere();
  redirect("/admin");
}

export interface UploadImagesState {
  uploaded: number;
  error?: string;
  /** Changes on every run, which is what lets the form reset its dropzone. */
  completedAt: number;
}

export async function uploadImagesAction(
  carId: string,
  _prevState: UploadImagesState | null,
  formData: FormData
): Promise<UploadImagesState> {
  const files = pickedFiles(formData);

  if (files.length === 0) {
    return { uploaded: 0, error: "Choose at least one image first.", completedAt: Date.now() };
  }

  // Storage rejections used to pass silently, which looked exactly like a
  // successful upload that never appeared — report what actually happened.
  let uploaded = 0;
  const failures: string[] = [];

  for (const file of files) {
    const { error } = await uploadCarImage(carId, file);
    if (error) failures.push(`${file.name} — ${error}`);
    else uploaded += 1;
  }

  revalidateEverywhere(carId);

  return {
    uploaded,
    error: failures.length > 0 ? failures.join(" · ") : undefined,
    completedAt: Date.now(),
  };
}

export async function deleteImageAction(
  carId: string,
  imageId: string,
  storagePath: string
): Promise<void> {
  await deleteCarImage(imageId, storagePath);
  revalidateEverywhere(carId);
}

export async function setCoverImageAction(carId: string, imageId: string): Promise<void> {
  await setCoverImage(carId, imageId);
  revalidateEverywhere(carId);
}

// ── Showroom 360° tour ────────────────────────────────────────────

function revalidateTour() {
  revalidatePath("/360-view");
  revalidatePath("/admin/360-view");
}

export interface SceneUploadState {
  error?: string;
  success?: boolean;
  completedAt: number;
}

export async function addSceneAction(
  _prevState: SceneUploadState | null,
  formData: FormData
): Promise<SceneUploadState> {
  const file = formData.get("panorama");
  const title = String(formData.get("title") ?? "").trim();

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose a panorama image first.", completedAt: Date.now() };
  }
  if (!title) {
    return { error: "Give the scene a name, so hotspots can point at it.", completedAt: Date.now() };
  }

  const { error } = await addScene(title, file);
  if (error) return { error, completedAt: Date.now() };

  revalidateTour();
  return { success: true, completedAt: Date.now() };
}

export async function deleteSceneAction(sceneId: string): Promise<void> {
  await deleteScene(sceneId);
  revalidateTour();
}

export async function setDefaultSceneAction(sceneId: string): Promise<void> {
  await setDefaultScene(sceneId);
  revalidateTour();
}

export interface HotspotState {
  error?: string;
  success?: boolean;
  completedAt: number;
}

export async function addHotspotAction(
  sceneId: string,
  _prevState: HotspotState | null,
  formData: FormData
): Promise<HotspotState> {
  const targetSceneId = String(formData.get("target_scene_id") ?? "");
  const pitch = Number(formData.get("pitch"));
  const yaw = Number(formData.get("yaw"));

  if (!targetSceneId) {
    return { error: "Pick which scene this hotspot leads to.", completedAt: Date.now() };
  }
  if (!Number.isFinite(pitch) || !Number.isFinite(yaw)) {
    return { error: "Click a spot in the panorama to place the hotspot.", completedAt: Date.now() };
  }

  const { error } = await addHotspot({
    sceneId,
    targetSceneId,
    label: String(formData.get("label") ?? "").trim() || null,
    pitch,
    yaw,
  });

  if (error) return { error, completedAt: Date.now() };

  revalidateTour();
  return { success: true, completedAt: Date.now() };
}

export async function deleteHotspotAction(hotspotId: string): Promise<void> {
  await deleteHotspot(hotspotId);
  revalidateTour();
}
