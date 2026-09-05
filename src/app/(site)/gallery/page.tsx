import type { Metadata } from "next";
import { Container } from "@/components/common/Container";
import { SectionHeading } from "@/components/common/SectionHeading";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { getGalleryEntries } from "@/lib/services/gallery.service";
import styles from "./gallery.module.css";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Photographs from across the current collection.",
};

export default async function GalleryPage() {
  const entries = await getGalleryEntries(60);

  return (
    <Container>
      <div className={styles.wrapper}>
        <SectionHeading
          eyebrow="The Collection"
          heading="Gallery"
          description="A rotating look through the showroom and the cars on our floor. Tap any vehicle photo to open its listing."
        />

        <GalleryGrid entries={entries} />
      </div>
    </Container>
  );
}
