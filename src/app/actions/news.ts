"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createNews, deleteNews, updateNews } from "@/lib/services/admin.service";

/** What the form's uploader writes: `videos/<uuid>.<ext>`. */
const VIDEO_PATH = /^videos\/[0-9a-f-]{36}\.[a-z0-9]{2,5}$/;

function parseNewsInput(formData: FormData): {
  input: { title: string; description: string };
  image: File | null;
  videoPath: string | null;
} {
  const file = formData.get("image");
  // The video itself never comes through here — the browser uploads it
  // straight to Storage and sends only the path it landed at.
  const videoPath = String(formData.get("video_path") ?? "");

  return {
    input: {
      title: String(formData.get("title") ?? "").trim(),
      description: String(formData.get("description") ?? "").trim(),
    },
    // `published_at` is left to the column default on create and untouched on
    // update, so the post keeps the date it first went live.
    image: file instanceof File && file.size > 0 ? file : null,
    videoPath: VIDEO_PATH.test(videoPath) ? videoPath : null,
  };
}

function revalidateNews(postId?: string) {
  revalidatePath("/", "layout");
  if (postId) revalidatePath(`/admin/news/${postId}`);
}

export async function createNewsAction(formData: FormData): Promise<void> {
  const { input, image, videoPath } = parseNewsInput(formData);
  const { error } = await createNews(input, image, videoPath);

  if (error) throw new Error(error);

  revalidateNews();
  redirect("/admin/news");
}

export async function updateNewsAction(postId: string, formData: FormData): Promise<void> {
  const { input, image, videoPath } = parseNewsInput(formData);
  const removeImage = formData.get("remove_image") === "on";
  const removeVideo = formData.get("remove_video") === "on";
  const { error } = await updateNews(
    postId,
    input,
    image,
    removeImage,
    videoPath,
    removeVideo
  );

  if (error) throw new Error(error);

  revalidateNews(postId);
  redirect("/admin/news");
}

export async function deleteNewsAction(postId: string): Promise<void> {
  await deleteNews(postId);
  revalidateNews();
  redirect("/admin/news");
}
