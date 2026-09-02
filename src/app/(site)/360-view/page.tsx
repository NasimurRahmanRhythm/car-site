import type { Metadata } from "next";
import { Container } from "@/components/common/Container";
import { SectionHeading } from "@/components/common/SectionHeading";
import { TourViewer } from "@/components/viewer-360/TourViewer";
import { Viewer360 } from "@/components/viewer-360/Viewer360";
import { getTour } from "@/lib/services/showroom.service";
import styles from "./view-360.module.css";

export const metadata: Metadata = {
  title: "360° View",
};

export default async function View360Page() {
  const scenes = await getTour();

  return (
    <Container>
      <div className={styles.wrapper}>
        <SectionHeading
          eyebrow="Interactive"
          heading="360° View"
          description={
            scenes.length > 0
              ? "Step inside the showroom — drag to look around, and follow the markers to walk between rooms."
              : "Explore select vehicles from every angle before your visit."
          }
        />

        {scenes.length > 0 ? <TourViewer scenes={scenes} /> : <Viewer360 />}
      </div>
    </Container>
  );
}
