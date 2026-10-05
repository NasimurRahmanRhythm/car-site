"use server";

import { revalidatePath } from "next/cache";
import {
  addGalleryMedia,
  addGalleryYoutube,
  deleteGalleryItem,
  updateGalleryCaption,
} from "@/lib/services/gallery.service";
import { parseYoutubeId } from "@/lib/youtube";

function revalidateGallery() {
  revalidatePath("/gallery");
  revalidatePath("/admin/gallery");
}

/** Paths the uploader writes: `<uuid>.<ext>` or `posters/<uuid>.jpg`. */
const STORAGE_PATH = /^(posters\/)?[0-9a-f-]{36}\.[a-z0-9]{2,5}$/;

/**
 * The file itself never passes through here — the browser uploads it straight
 * to Storage (a Server Action body is capped far below a full-size video) and
 * then calls this to record it.
 */
export async function addGalleryMediaAction(input: {
  kind: "image" | "video";
  storagePath: string;
  thumbnailPath?: string | null;
  title?: string | null;
}): Promise<{ error?: string }> {
  if (input.kind !== "image" && input.kind !== "video") {
    return { error: "Unsupported media type." };
  }
  if (!STORAGE_PATH.test(input.storagePath)) {
    return { error: "Invalid upload path." };
  }
  if (input.thumbnailPath && !STORAGE_PATH.test(input.thumbnailPath)) {
    return { error: "Invalid poster path." };
  }

  const result = await addGalleryMedia({
    kind: input.kind,
    storagePath: input.storagePath,
    thumbnailPath: input.thumbnailPath ?? null,
    title: input.title?.trim() || null,
  });

  if (!result.error) revalidateGallery();
  return result;
}

export interface YoutubeLinkState {
  error?: string;
  success?: boolean;
  completedAt: number;
}

export async function addYoutubeLinkAction(
  _prevState: YoutubeLinkState | null,
  formData: FormData
): Promise<YoutubeLinkState> {
  const link = String(formData.get("youtube_url") ?? "");
  const title = String(formData.get("title") ?? "").trim() || null;
  const youtubeId = parseYoutubeId(link);

  if (!youtubeId) {
    return {
      error: "That doesn't look like a YouTube video link.",
      completedAt: Date.now(),
    };
  }

  const { error } = await addGalleryYoutube(youtubeId, title);
  if (error) return { error, completedAt: Date.now() };

  revalidateGallery();
  return { success: true, completedAt: Date.now() };
}

export async function updateGalleryCaptionAction(id: string, formData: FormData): Promise<void> {
  await updateGalleryCaption(id, String(formData.get("caption") ?? "").trim() || null);
  revalidateGallery();
}

export async function deleteGalleryItemAction(id: string): Promise<void> {
  await deleteGalleryItem(id);
  revalidateGallery();
}
