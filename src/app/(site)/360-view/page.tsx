import type { Metadata } from "next";
import { Container } from "@/components/common/Container";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Viewer360 } from "@/components/viewer-360/Viewer360";
import styles from "./view-360.module.css";

export const metadata: Metadata = {
  title: "360° View",
};

export default function View360Page() {
  return (
    <Container>
      <div className={styles.wrapper}>
        <SectionHeading
          eyebrow="Interactive"
          heading="360° View"
          description="Explore select vehicles from every angle before your visit."
        />
        <Viewer360 />
      </div>
    </Container>
  );
}
