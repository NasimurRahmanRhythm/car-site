"use client";

import { useState, useTransition } from "react";
import { ConfirmDeleteButton } from "@/components/common/ConfirmDialog";
import { Badge } from "@/components/common/Badge";
import { deleteSceneAction, setDefaultSceneAction } from "@/app/actions/admin";
import type { TourSceneWithHotspots } from "@/types/showroom";
import { HotspotEditor } from "./HotspotEditor";
import styles from "./Showroom360Manager.module.css";

export function SceneList({ scenes }: { scenes: TourSceneWithHotspots[] }) {
  // Only one scene is open for editing at a time. That is a hard constraint,
  // not a style choice: every open editor holds a live WebGL context, and
  // browsers cut you off after a dozen or so.
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (scenes.length === 0) {
    return (
      <p className={styles.empty}>
        No scenes yet. Upload the first panorama below — it becomes the room the tour opens in.
      </p>
    );
  }

  const editing = scenes.find((scene) => scene.id === editingId);

  return (
    <div className={styles.sceneList}>
      {scenes.map((scene) => (
        <div key={scene.id} className={styles.sceneCard}>
          {/* A flat strip of the panorama is enough to recognise the room, and
              costs none of the GPU a live viewer would. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={scene.url} alt="" className={styles.sceneThumb} />

          <div className={styles.sceneBody}>
            <div className={styles.sceneTitleRow}>
              <span className={styles.sceneTitle}>{scene.title}</span>
              {scene.is_default && <Badge variant="accent">Opens here</Badge>}
            </div>

            <p className={styles.sceneMeta}>
              {scene.width}×{scene.height} · {scene.hotspots.length} hotspot
              {scene.hotspots.length === 1 ? "" : "s"}
            </p>

            <div className={styles.sceneActions}>
              <button
                type="button"
                className="admin-action"
                onClick={() => setEditingId(editingId === scene.id ? null : scene.id)}
              >
                {editingId === scene.id ? "Close hotspots" : "Edit hotspots"}
              </button>

              {!scene.is_default && (
                <button
                  type="button"
                  className="admin-action"
                  disabled={isPending}
                  onClick={() => startTransition(() => setDefaultSceneAction(scene.id))}
                >
                  Open tour here
                </button>
              )}

              <ConfirmDeleteButton
                title="Delete this scene?"
                message="The panorama and every hotspot leading to or from it will be removed."
                onConfirm={() => deleteSceneAction(scene.id)}
              />
            </div>
          </div>
        </div>
      ))}

      {editing && (
        <HotspotEditor
          key={editing.id}
          scene={editing}
          scenes={scenes}
          onClose={() => setEditingId(null)}
        />
      )}
    </div>
  );
}
