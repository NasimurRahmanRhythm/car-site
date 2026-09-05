"use server";

import { revalidatePath } from "next/cache";
import {
  addGalleryItem,
  deleteGalleryItem,
  updateGalleryCaption,
} from "@/lib/services/gallery.service";

export interface GalleryUploadState {
  error?: string;
  added?: number;
  completedAt: number;
}

function revalidateGallery() {
  revalidatePath("/gallery");
  revalidatePath("/admin/gallery");
}

/**
 * Uploads every file picked in one go. A file that fails does not cancel the
 * rest — the ones that made it are still worth keeping, so the failures come
 * back as a message alongside the count that landed.
 */
export async function addGalleryItemsAction(
  _prevState: GalleryUploadState | null,
  formData: FormData
): Promise<GalleryUploadState> {
  const files = formData
    .getAll("files")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  if (files.length === 0) {
    return { error: "Choose an image or a video first.", completedAt: Date.now() };
  }

  const caption = String(formData.get("caption") ?? "").trim() || null;
  const failures: string[] = [];
  let added = 0;

  for (const file of files) {
    const { error } = await addGalleryItem(file, caption);
    if (error) failures.push(`${file.name} — ${error}`);
    else added += 1;
  }

  if (added > 0) revalidateGallery();

  return {
    added,
    error: failures.length > 0 ? failures.join(" · ") : undefined,
    completedAt: Date.now(),
  };
}

export async function updateGalleryCaptionAction(id: string, formData: FormData): Promise<void> {
  await updateGalleryCaption(id, String(formData.get("caption") ?? "").trim() || null);
  revalidateGallery();
}

export async function deleteGalleryItemAction(id: string): Promise<void> {
  await deleteGalleryItem(id);
  revalidateGallery();
}
