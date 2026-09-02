"use client";

import { useActionState, useState } from "react";
import { PanoramaViewer } from "@/components/viewer-360/PanoramaViewer";
import { ConfirmDeleteButton } from "@/components/common/ConfirmDialog";
import { SubmitButton } from "@/components/common/SubmitButton";
import { addHotspotAction, deleteHotspotAction, type HotspotState } from "@/app/actions/admin";
import type { TourSceneWithHotspots } from "@/types/showroom";
import styles from "./Showroom360Manager.module.css";

interface HotspotEditorProps {
  scene: TourSceneWithHotspots;
  scenes: TourSceneWithHotspots[];
  onClose: () => void;
}

const PENDING_ID = "pending";
const initialState: HotspotState | null = null;

/**
 * Places hotspots by clicking them into the panorama itself.
 *
 * Pitch and yaw are angles on a sphere — no one can type them from memory, so
 * the only workable way to author a hotspot is to look at the spot and click
 * it, exactly where a visitor will later see the marker.
 */
export function HotspotEditor({ scene, scenes, onClose }: HotspotEditorProps) {
  const [state, formAction] = useActionState(addHotspotAction.bind(null, scene.id), initialState);
  const [pending, setPending] = useState<{ pitch: number; yaw: number } | null>(null);

  const targets = scenes.filter((candidate) => candidate.id !== scene.id);

  // Clearing the staged point once the server has stored it keeps the marker
  // from lingering as a duplicate of the hotspot it just became.
  const placed = state?.success ? null : pending;

  const markers = [
    ...scene.hotspots.map((hotspot) => ({
      id: hotspot.id,
      pitch: hotspot.pitch,
      yaw: hotspot.yaw,
      label: hotspot.label ?? titleOf(scenes, hotspot.target_scene_id),
    })),
    ...(placed ? [{ id: PENDING_ID, pitch: placed.pitch, yaw: placed.yaw, label: "New hotspot" }] : []),
  ];

  return (
    <div className={styles.editor}>
      <div className={styles.editorHead}>
        <h3 className={styles.panelTitle}>Hotspots in &ldquo;{scene.title}&rdquo;</h3>
        <button type="button" className="admin-action" onClick={onClose}>
          Done
        </button>
      </div>

      <PanoramaViewer
        src={scene.url}
        width={scene.width}
        height={scene.height}
        alt={scene.title}
        hotspots={markers}
        onPick={setPending}
        autoRotate={false}
      />

      {targets.length === 0 ? (
        <p className={styles.hint}>
          Upload a second scene first — a hotspot has to lead somewhere.
        </p>
      ) : (
        <form action={formAction} className={styles.hotspotForm}>
          <input type="hidden" name="pitch" value={placed?.pitch ?? ""} />
          <input type="hidden" name="yaw" value={placed?.yaw ?? ""} />

          <p className={styles.hint}>
            {placed
              ? `Placed at pitch ${placed.pitch.toFixed(1)}°, yaw ${placed.yaw.toFixed(1)}°. Click again to move it.`
              : "Click the spot in the panorama where the marker should sit — a doorway or the far end of the room works well."}
          </p>

          <div className={styles.hotspotFields}>
            <label className={styles.field}>
              <span className={styles.label}>Leads to</span>
              <select name="target_scene_id" className={styles.textInput} required>
                {targets.map((target) => (
                  <option key={target.id} value={target.id}>
                    {target.title}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Label (optional)</span>
              <input
                type="text"
                name="label"
                placeholder="Defaults to the scene name"
                className={styles.textInput}
              />
            </label>
          </div>

          {state?.error && <p className={`${styles.feedback} ${styles.error}`}>{state.error}</p>}

          <SubmitButton label={placed ? "Add hotspot" : "Click the panorama first"} />
        </form>
      )}

      {scene.hotspots.length > 0 && (
        <ul className={styles.hotspotList}>
          {scene.hotspots.map((hotspot) => (
            <li key={hotspot.id} className={styles.hotspotRow}>
              <span>
                {hotspot.label ?? titleOf(scenes, hotspot.target_scene_id)} →{" "}
                <strong>{titleOf(scenes, hotspot.target_scene_id)}</strong>
              </span>
              <ConfirmDeleteButton
                title="Delete this hotspot?"
                message="Visitors will no longer be able to step through from here."
                onConfirm={() => deleteHotspotAction(hotspot.id)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function titleOf(scenes: TourSceneWithHotspots[], id: string): string {
  return scenes.find((scene) => scene.id === id)?.title ?? "a removed scene";
}
