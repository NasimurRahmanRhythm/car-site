"use client";

import { useState } from "react";
import { PanoramaViewer } from "@/components/viewer-360/PanoramaViewer";
import { cn } from "@/lib/utils";
import type { TourSceneWithHotspots } from "@/types/showroom";
import styles from "./TourViewer.module.css";

/**
 * The whole showroom tour: one panorama at a time, with hotspots that walk the
 * visitor between them and a strip of scene buttons for jumping directly.
 */
export function TourViewer({ scenes }: { scenes: TourSceneWithHotspots[] }) {
  const opening = scenes.find((scene) => scene.is_default) ?? scenes[0];
  const [currentId, setCurrentId] = useState(opening?.id);

  const current = scenes.find((scene) => scene.id === currentId) ?? opening;
  if (!current) return null;

  return (
    <div className={styles.tour}>
      <PanoramaViewer
        // Remounting per scene is deliberate: it rebuilds the GL texture and
        // resets the camera, so each room opens facing forward rather than
        // inheriting where the visitor happened to be looking.
        key={current.id}
        src={current.url}
        width={current.width}
        height={current.height}
        alt={`Inside the showroom — ${current.title}`}
        hotspots={current.hotspots.map((hotspot) => ({
          id: hotspot.id,
          pitch: hotspot.pitch,
          yaw: hotspot.yaw,
          label: hotspot.label ?? sceneTitle(scenes, hotspot.target_scene_id),
        }))}
        onHotspotActivate={(hotspotId) => {
          const hotspot = current.hotspots.find((entry) => entry.id === hotspotId);
          if (hotspot) setCurrentId(hotspot.target_scene_id);
        }}
      />

      {scenes.length > 1 && (
        <div className={styles.scenes}>
          {scenes.map((scene) => (
            <button
              key={scene.id}
              type="button"
              className={cn(styles.sceneButton, scene.id === current.id && styles.sceneActive)}
              onClick={() => setCurrentId(scene.id)}
              aria-current={scene.id === current.id}
            >
              {scene.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function sceneTitle(scenes: TourSceneWithHotspots[], id: string): string {
  return scenes.find((scene) => scene.id === id)?.title ?? "Go here";
}
