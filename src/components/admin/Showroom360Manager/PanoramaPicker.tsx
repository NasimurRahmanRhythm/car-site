"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { SubmitButton } from "@/components/common/SubmitButton";
import { PanoramaViewer } from "@/components/viewer-360/PanoramaViewer";
import {
  PANORAMA_EXTENSIONS,
  PANORAMA_MAX_MB,
  PANORAMA_MIN_WIDTH,
  validatePanorama,
} from "@/lib/panorama";
import styles from "./Showroom360Manager.module.css";

interface Picked {
  url: string;
  width: number;
  height: number;
  sizeMb: string;
  name: string;
}

/**
 * Picks a panorama and shows it in the real viewer before anything is sent.
 * A 2:1 image looks nothing like the room it came from when laid out flat, so
 * a thumbnail would not tell an admin whether the panorama is actually usable
 * — only dragging through it does.
 */
export function PanoramaPicker() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [picked, setPicked] = useState<Picked | null>(null);
  const [rejection, setRejection] = useState<string | null>(null);

  // The preview holds an object URL alive for as long as the file is staged;
  // it has to be released by hand or every re-pick leaks the previous one.
  useEffect(() => {
    if (!picked) return;
    return () => URL.revokeObjectURL(picked.url);
  }, [picked]);

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setRejection(null);

    // Dimensions are only knowable once the browser has decoded the file, so
    // this cannot be an `accept` attribute — and the server re-checks all of
    // it anyway, since a Server Action is reachable without this form.
    const url = URL.createObjectURL(file);
    const dimensions = await readDimensions(url);
    const problem = validatePanorama(file, dimensions);

    if (problem || !dimensions) {
      URL.revokeObjectURL(url);
      setRejection(problem ?? "That image could not be read.");
      setPicked(null);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setPicked({
      url,
      width: dimensions.width,
      height: dimensions.height,
      sizeMb: (file.size / (1024 * 1024)).toFixed(1),
      name: file.name,
    });
  }

  return (
    <>
      <div className={styles.field}>
        <label htmlFor="title" className={styles.label}>
          Scene name
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          placeholder="Main showroom floor"
          className={styles.textInput}
        />
        <p className={styles.hint}>
          Shown on the scene buttons, and used as the default label on hotspots leading here.
        </p>
      </div>

      <div className={styles.field}>
        <label htmlFor="panorama" className={styles.label}>
          Panorama image
        </label>
        <input
          ref={inputRef}
          id="panorama"
          name="panorama"
          type="file"
          accept={PANORAMA_EXTENSIONS}
          onChange={handleChange}
          className={styles.fileInput}
        />
        <p className={styles.hint}>
          Equirectangular JPG, PNG or WebP — roughly 2:1 (4096×2048 and up), at least{" "}
          {PANORAMA_MIN_WIDTH}px wide, under {PANORAMA_MAX_MB} MB. Shoot it with your phone&rsquo;s
          panorama / photo-sphere mode, or a 360° camera. An ordinary photo will be rejected.
        </p>
      </div>

      {rejection && <p className={`${styles.feedback} ${styles.error}`}>{rejection}</p>}

      {picked && (
        <div className={styles.preview}>
          <div className={styles.previewHead}>
            <span className={styles.previewTitle}>Preview — not published yet</span>
            <span className={styles.previewMeta}>
              {picked.name} · {picked.width}×{picked.height} · {picked.sizeMb} MB
            </span>
          </div>
          <PanoramaViewer
            src={picked.url}
            width={picked.width}
            height={picked.height}
            alt="Panorama preview"
            autoRotate={false}
          />
          <p className={styles.hint}>
            Drag through the whole room before publishing. If it looks stretched, or the join where
            the panorama wraps is visible, re-shoot it rather than publishing.
          </p>
        </div>
      )}

      <SubmitButton label={picked ? "Add scene" : "Choose a panorama first"} />
    </>
  );
}

function readDimensions(url: string): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => resolve(null);
    image.src = url;
  });
}
