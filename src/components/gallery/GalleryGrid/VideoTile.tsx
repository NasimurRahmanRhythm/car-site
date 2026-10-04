"use client";

import { useRef } from "react";
import Image from "next/image";
import { Play, X } from "lucide-react";
import styles from "./GalleryGrid.module.css";

interface VideoTileProps {
  url: string;
  poster: string | null;
  title: string | null;
  sizes: string;
}

/** An uploaded video: its poster in the grid, played in a lightbox on click. */
export function VideoTile({ url, poster, title, sizes }: VideoTileProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  function open() {
    dialogRef.current?.showModal();
    videoRef.current?.play().catch(() => {});
  }

  return (
    <>
      <button
        type="button"
        className={styles.tile}
        onClick={open}
        aria-label={title ? `Play video: ${title}` : "Play video"}
      >
        {poster ? (
          <Image src={poster} alt="" fill sizes={sizes} className={styles.image} />
        ) : (
          <video src={`${url}#t=1`} muted playsInline preload="metadata" className={styles.image} />
        )}
        <span className={styles.play} aria-hidden="true">
          <Play size={22} />
        </span>
        {title && <span className={styles.caption}>{title}</span>}
      </button>

      <dialog
        ref={dialogRef}
        className={styles.lightbox}
        onClose={() => videoRef.current?.pause()}
        // A click on the backdrop lands on the dialog element itself.
        onClick={(event) => {
          if (event.target === event.currentTarget) dialogRef.current?.close();
        }}
      >
        <button
          type="button"
          className={styles.close}
          aria-label="Close video"
          onClick={() => dialogRef.current?.close()}
        >
          <X size={20} aria-hidden="true" />
        </button>
        <video
          ref={videoRef}
          src={url}
          controls
          playsInline
          preload="none"
          className={styles.lightboxVideo}
        />
      </dialog>
    </>
  );
}
