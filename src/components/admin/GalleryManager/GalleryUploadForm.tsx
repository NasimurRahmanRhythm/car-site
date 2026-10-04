"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { addGalleryMediaAction } from "@/app/actions/gallery";
import { Button } from "@/components/common/Button";
import { FileDropzone } from "@/components/common/FileDropzone";
import { Spinner } from "@/components/common/Spinner";
import {
  MAX_VIDEO_BYTES,
  captureVideoPoster,
  compressImage,
  compressVideo,
  fileExtension,
} from "@/lib/media-compress";
import { createClient } from "@/lib/supabase/client";
import styles from "./GalleryManager.module.css";

const BUCKET = "gallery";

function megabytes(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/**
 * Files go from this browser straight to Supabase Storage — after being
 * compressed here — and only the resulting paths are sent to the server.
 * Pushing them through a Server Action instead is what broke uploads: request
 * bodies there are capped (and truncated by the proxy) well below a full-size video.
 */
export function GalleryUploadForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [dropzoneKey, setDropzoneKey] = useState(0);

  async function uploadOne(file: File, title: string | null) {
    const supabase = createClient();
    const bucket = supabase.storage.from(BUCKET);
    const isVideo = file.type.startsWith("video/");

    let upload = file;
    let posterPath: string | null = null;

    if (isVideo) {
      upload = (await compressVideo(file)).file;

      const poster = await captureVideoPoster(upload);
      if (poster) {
        posterPath = `posters/${crypto.randomUUID()}.jpg`;
        const { error: posterError } = await bucket.upload(posterPath, poster, {
          contentType: "image/jpeg",
        });
        // A missing poster only costs the thumbnail — the video still plays.
        if (posterError) posterPath = null;
      }
    } else {
      upload = await compressImage(file);
    }

    const storagePath = `${crypto.randomUUID()}.${fileExtension(upload)}`;
    const { error: uploadError } = await bucket.upload(storagePath, upload, {
      contentType: upload.type,
      upsert: false,
    });

    if (uploadError) {
      if (posterPath) await bucket.remove([posterPath]);
      throw new Error(uploadError.message);
    }

    const { error: saveError } = await addGalleryMediaAction({
      kind: isVideo ? "video" : "image",
      storagePath,
      thumbnailPath: posterPath,
      title,
    });
    if (saveError) throw new Error(saveError);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;

    // currentTarget is cleared once the handler awaits, so hold on to the form.
    const form = event.currentTarget;
    const formData = new FormData(form);
    const title = String(formData.get("title") ?? "").trim() || null;
    const files = formData
      .getAll("files")
      .filter((entry): entry is File => entry instanceof File && entry.size > 0);

    setError(null);
    setDone(null);

    if (files.length === 0) {
      setError("Choose at least one photo or video first.");
      return;
    }

    const tooLarge = files.filter(
      (file) => file.type.startsWith("video/") && file.size > MAX_VIDEO_BYTES
    );
    if (tooLarge.length > 0) {
      setError(
        `Videos can be at most ${megabytes(MAX_VIDEO_BYTES)}: ${tooLarge
          .map((file) => `${file.name} (${megabytes(file.size)})`)
          .join(", ")}`
      );
      return;
    }

    setBusy(true);
    const failures: string[] = [];
    let uploaded = 0;

    for (const file of files) {
      try {
        await uploadOne(file, title);
        uploaded += 1;
      } catch (uploadError) {
        failures.push(
          `${file.name} — ${uploadError instanceof Error ? uploadError.message : "upload failed"}`
        );
      }
    }

    setBusy(false);

    if (uploaded > 0) {
      setDone(`Uploaded ${uploaded} file${uploaded === 1 ? "" : "s"}.`);
      if (failures.length === 0) {
        form.reset();
        setDropzoneKey((key) => key + 1);
      }
      router.refresh();
    }
    if (failures.length > 0) setError(failures.join(" · "));
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <FileDropzone
        key={dropzoneKey}
        id="gallery-files"
        name="files"
        multiple
        accept="image-video"
        label="Add photos or videos"
        hint="JPG, PNG, WebP or any common video format. Videos up to 50 MB."
      />

      <label className={styles.field}>
        <span className={styles.label}>Caption (optional)</span>
        <input name="title" type="text" maxLength={120} className={styles.input} />
      </label>

      {done && <p className={`${styles.feedback} ${styles.success}`}>{done}</p>}
      {error && <p className={`${styles.feedback} ${styles.error}`}>{error}</p>}

      <Button type="submit" disabled={busy} aria-busy={busy}>
        {busy ? <Spinner /> : "Upload"}
      </Button>
    </form>
  );
}
