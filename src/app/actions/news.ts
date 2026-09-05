"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createNews,
  deleteNews,
  updateNews,
  uploadNewsMedia,
} from "@/lib/services/admin.service";
import { sanitizeRichText } from "@/lib/rich-text";

function parseNewsInput(formData: FormData): {
  input: { title: string; description: string };
  image: File | null;
} {
  const file = formData.get("image");

  return {
    input: {
      title: String(formData.get("title") ?? "").trim(),
      // The editor's HTML is stored as written, minus anything outside the
      // allow-list — a borrowed admin account should not be able to leave a
      // script behind on the public post.
      description: sanitizeRichText(String(formData.get("description") ?? "").trim()),
    },
    // `published_at` is left to the column default on create and untouched on
    // update, so the post keeps the date it first went live.
    image: file instanceof File && file.size > 0 ? file : null,
  };
}

function revalidateNews(postId?: string) {
  revalidatePath("/", "layout");
  if (postId) revalidatePath(`/admin/news/${postId}`);
}

export async function createNewsAction(formData: FormData): Promise<void> {
  const { input, image } = parseNewsInput(formData);
  const { error } = await createNews(input, image);

  if (error) throw new Error(error);

  revalidateNews();
  redirect("/admin/news");
}

export async function updateNewsAction(postId: string, formData: FormData): Promise<void> {
  const { input, image } = parseNewsInput(formData);
  const { error } = await updateNews(postId, input, image);

  if (error) throw new Error(error);

  revalidateNews(postId);
  redirect("/admin/news");
}

export async function deleteNewsAction(postId: string): Promise<void> {
  await deleteNews(postId);
  revalidateNews();
  redirect("/admin/news");
}

/**
 * Backs the image and video buttons in the post editor: the file goes to the
 * news bucket and the editor embeds the URL it gets back. Nothing is
 * revalidated — the file is only referenced once the post itself is saved.
 */
export async function uploadNewsMediaAction(
  formData: FormData
): Promise<{ url?: string; error?: string }> {
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return { error: "No file was received." };
  }

  const { url, error } = await uploadNewsMedia(file);
  return url ? { url } : { error: error ?? "That upload failed." };
}
