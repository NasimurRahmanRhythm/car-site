"use client";

import { useState, useTransition, type FormEvent } from "react";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { Button } from "@/components/common/Button";
import { FileDropzone } from "@/components/common/FileDropzone";
import { Spinner } from "@/components/common/Spinner";
import {
  MAX_VIDEO_BYTES,
  captureVideoPoster,
  compressVideo,
  fileExtension,
} from "@/lib/media-compress";
import { createClient } from "@/lib/supabase/client";
import type { NewsPost } from "@/types/news";
import styles from "./NewsForm.module.css";

/** Videos share the news image bucket, under their own folder. */
const BUCKET = "news-images";

interface NewsFormProps {
  post?: NewsPost;
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
}

export function NewsForm({ post, action, submitLabel }: NewsFormProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, startSaving] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const busy = isUploading || isSaving;

  /**
   * The video goes from this browser straight to Storage, compressed first —
   * a Server Action body is capped far below a video's size. The action then
   * receives only the path the file landed at.
   */
  async function uploadVideo(video: File, formData: FormData) {
    const bucket = createClient().storage.from(BUCKET);
    const { file } = await compressVideo(video);

    const path = `videos/${crypto.randomUUID()}.${fileExtension(file)}`;
    const { error: uploadError } = await bucket.upload(path, file, {
      contentType: file.type,
      upsert: false,
    });
    if (uploadError) throw new Error(uploadError.message);

    formData.set("video_path", path);

    // With no cover image at all, a frame of the video stands in for one, so
    // the news card is not left with an empty placeholder.
    const image = formData.get("image");
    const hasImage = (image instanceof File && image.size > 0) || Boolean(post?.image_url);
    if (!hasImage) {
      const poster = await captureVideoPoster(file);
      if (poster) formData.set("image", poster);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;

    const formData = new FormData(event.currentTarget);
    const video = formData.get("video");
    formData.delete("video");
    setError(null);

    if (video instanceof File && video.size > 0) {
      if (video.size > MAX_VIDEO_BYTES) {
        setError("The video can be at most 50 MB.");
        return;
      }

      setIsUploading(true);
      try {
        await uploadVideo(video, formData);
      } catch (uploadError) {
        setError(
          `Video upload failed — ${
            uploadError instanceof Error ? uploadError.message : "please try again"
          }`
        );
        return;
      } finally {
        setIsUploading(false);
      }
    }

    startSaving(() => action(formData));
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Post</legend>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="title">
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            defaultValue={post?.title}
            className={styles.input}
          />
        </div>

        <div className={styles.field}>
          <span className={styles.label}>Body</span>
          <RichTextEditor
            name="description"
            defaultValue={post?.description}
            placeholder="Write the post. Use the toolbar to format it, add photos, or drop in a clip."
          />
          <p className={styles.hint}>
            The image and video buttons upload a file; Embed takes a YouTube or Vimeo link.
          </p>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="image">
            Image
          </label>
          <FileDropzone
            compressImages
            id="image"
            name="image"
            currentImageUrl={post?.image_url}
            label="Add cover image"
            hint={
              post?.image_url
                ? "Pick a file to replace the current image. Leave it as is to keep it."
                : "Optional — shown on the news card and at the top of the post."
            }
          />
          {post?.image_url && (
            <label className={styles.checkbox}>
              <input type="checkbox" name="remove_image" />
              Remove the current image
            </label>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="video">
            Video
          </label>
          {post?.video_url && (
            <video
              src={post.video_url}
              poster={post.image_url ?? undefined}
              controls
              preload="metadata"
              className={styles.currentVideo}
            />
          )}
          <FileDropzone
            id="video"
            name="video"
            accept="video"
            label={post?.video_url ? "Replace video" : "Add video"}
            hint={
              post?.video_url
                ? "Pick a file to replace the current video. Leave it as is to keep it."
                : "Optional — plays at the top of the post. Up to 50 MB."
            }
          />
          {post?.video_url && (
            <label className={styles.checkbox}>
              <input type="checkbox" name="remove_video" />
              Remove the current video
            </label>
          )}
        </div>
      </fieldset>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.footer}>
        <Button type="submit" disabled={busy} aria-busy={busy}>
          {busy ? <Spinner /> : submitLabel}
        </Button>
      </div>
    </form>
  );
}
