"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createNews, deleteNews, updateNews } from "@/lib/services/admin.service";

function parseNewsInput(formData: FormData): {
  input: { title: string; description: string };
  image: File | null;
} {
  const file = formData.get("image");

  return {
    input: {
      title: String(formData.get("title") ?? "").trim(),
      description: String(formData.get("description") ?? "").trim(),
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
