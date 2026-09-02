import type { TourSceneWithHotspots } from "@/types/showroom";
import { Showroom360Form } from "./Showroom360Form";
import { SceneList } from "./SceneList";
import styles from "./Showroom360Manager.module.css";

export function Showroom360Manager({ scenes }: { scenes: TourSceneWithHotspots[] }) {
  return (
    <div className={styles.wrapper}>
      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <h2 className={styles.panelTitle}>Scenes</h2>
          <span className={styles.meta}>
            {scenes.length} scene{scenes.length === 1 ? "" : "s"} live
          </span>
        </div>
        <SceneList scenes={scenes} />
      </section>

      <section className={styles.panel}>
        <h2 className={styles.panelTitle}>Add a scene</h2>
        <p className={styles.hint}>
          Upload one panorama per spot in the showroom, then link them with hotspots so visitors can
          walk between them.
        </p>
        <Showroom360Form />
      </section>
    </div>
  );
}
