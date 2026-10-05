"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Plus, X } from "lucide-react";
import { Spinner } from "@/components/common/Spinner";
import { compressImage } from "@/lib/media-compress";
import { cn } from "@/lib/utils";
import styles from "./FileDropzone.module.css";

interface FileDropzoneProps {
  id: string;
  name: string;
  multiple?: boolean;
  required?: boolean;
  label?: string;
  hint?: string;
  /** Existing image to show behind the prompt until a replacement is picked. */
  currentImageUrl?: string | null;
  /** Which media the zone takes. Defaults to images only. */
  accept?: "image" | "video" | "image-video";
  /**
   * Downscale and re-encode photos as they are picked, so a form never sends
   * full-size camera files — those used to overrun the request body limit.
   */
  compressImages?: boolean;
}

interface Picked {
  file: File;
  /** Object URL for the thumbnail — revoked as soon as the file is dropped. */
  url: string;
  isVideo: boolean;
}

export function FileDropzone({
  id,
  name,
  multiple = false,
  required = false,
  label = "Add image",
  hint,
  currentImageUrl,
  accept = "image",
  compressImages = false,
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [picked, setPicked] = useState<Picked[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const allowsImage = accept !== "video";
  const allowsVideo = accept !== "image";
  const noun = accept === "image-video" ? "file" : accept;
  const mimeTypes = [allowsImage && "image/*", allowsVideo && "video/*"]
    .filter(Boolean)
    .join(",");

  // Object URLs outlive React state, so the live set is mirrored into a ref
  // and released when the component goes away.
  const liveUrls = useRef<string[]>([]);
  useEffect(() => {
    const urls = liveUrls;
    return () => urls.current.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  /**
   * The real `<input type="file">` is what the form submits, so every change
   * has to be written back onto it — a DataTransfer is the only way to build a
   * FileList by hand.
   */
  function commit(nextFiles: File[]) {
    const input = inputRef.current;
    if (!input) return;

    const transfer = new DataTransfer();
    nextFiles.forEach((file) => transfer.items.add(file));
    input.files = transfer.files;

    const existing = new Map(picked.map((entry) => [entry.file, entry.url]));
    const next = nextFiles.map((file) => ({
      file,
      url: existing.get(file) ?? URL.createObjectURL(file),
      isVideo: file.type.startsWith("video/"),
    }));

    picked
      .filter((entry) => !nextFiles.includes(entry.file))
      .forEach((entry) => URL.revokeObjectURL(entry.url));

    liveUrls.current = next.map((entry) => entry.url);
    setPicked(next);
  }

  async function addFiles(incoming: FileList | null) {
    if (!incoming || incoming.length === 0) return;
    let media = Array.from(incoming).filter(
      (file) =>
        (allowsImage && file.type.startsWith("image/")) ||
        (allowsVideo && file.type.startsWith("video/"))
    );
    if (media.length === 0) return;
    if (!multiple) media = media.slice(0, 1);

    // Snapshot before the await: `picked` must be the list as it was when
    // these files arrived.
    const kept = multiple ? picked.map((entry) => entry.file) : [];

    if (compressImages) {
      setIsProcessing(true);
      try {
        media = await Promise.all(
          media.map((file) => (file.type.startsWith("image/") ? compressImage(file) : file))
        );
      } finally {
        setIsProcessing(false);
      }
    }

    commit([...kept, ...media]);
  }

  const hasFiles = picked.length > 0;
  const showCurrent = !hasFiles && Boolean(currentImageUrl);

  return (
    <div className={styles.wrapper}>
      <div
        className={cn(styles.zone, isDragging && styles.dragging, hasFiles && styles.filled)}
        aria-busy={isProcessing}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          addFiles(event.dataTransfer.files);
        }}
      >
        {isProcessing && (
          <span className={styles.processing}>
            <Spinner />
          </span>
        )}

        <input
          ref={inputRef}
          id={id}
          name={name}
          type="file"
          accept={mimeTypes}
          multiple={multiple}
          required={required && !hasFiles}
          className={styles.input}
          onChange={(event) => addFiles(event.target.files)}
        />

        {hasFiles ? (
          <div className={styles.previewGrid}>
            {picked.map((entry, index) => (
              <div key={entry.url} className={styles.preview}>
                {entry.isVideo ? (
                  <video src={entry.url} muted playsInline className={styles.previewImage} />
                ) : (
                  <>
                    {/* Blob URLs cannot go through the image optimiser. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={entry.url} alt="" className={styles.previewImage} />
                  </>
                )}
                <button
                  type="button"
                  className={styles.remove}
                  aria-label={`Remove ${entry.file.name}`}
                  onClick={() =>
                    commit(
                      picked.filter((_, i) => i !== index).map((remaining) => remaining.file)
                    )
                  }
                >
                  <X size={14} aria-hidden="true" />
                </button>
              </div>
            ))}

            <label htmlFor={id} className={styles.addMore}>
              <Plus size={20} aria-hidden="true" />
              <span className={styles.srOnly}>Add another {noun}</span>
            </label>
          </div>
        ) : (
          <label htmlFor={id} className={styles.empty}>
            {showCurrent && currentImageUrl && (
              <span className={styles.currentImage}>
                <Image
                  src={currentImageUrl}
                  alt=""
                  fill
                  sizes="320px"
                  style={{ objectFit: "cover" }}
                />
              </span>
            )}
            <span className={styles.plus}>
              <Plus size={24} aria-hidden="true" />
            </span>
            <span className={styles.label}>{showCurrent ? "Replace image" : label}</span>
            <span className={styles.dropHint}>
              or drop {multiple ? `${noun}s` : noun === "image" ? "an image" : `a ${noun}`} here
            </span>
          </label>
        )}
      </div>

      {hint && <p className={styles.hint}>{hint}</p>}
    </div>
  );
}
