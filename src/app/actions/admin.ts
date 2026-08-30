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
    currency: String(formData.get("currency") ?? "AED").trim() || "AED",
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
  if (carId) revalidatePath(`/admin/cars/${carId}`);
}

export async function createCarAction(formData: FormData): Promise<void> {
  const input = parseCarInput(formData);
  const { car, error } = await createCar(input);

  if (error || !car) {
    throw new Error(error ?? "Failed to create vehicle.");
  }

  revalidateEverywhere();
  redirect(`/admin/cars/${car.id}`);
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
  const files = formData
    .getAll("files")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

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
